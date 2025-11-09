import pandas as pd
import mysql.connector
import os
from typing import Dict, Any
import logging
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EducationalFacilityIngestor:
    def __init__(self):
        self.db_config = {
            'host': os.environ.get('DB_ADDRESS', 'database'),
            'user': os.environ.get('DB_USER', 'root'),
            'password': os.environ.get('DB_PASSWORD', 'pwd'),
            'database': os.environ.get('DB_DATABASE', 'template_db')
        }

    def table_exists(self, conn, table_name):
        """Check if the specified table exists in the database."""
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = %s
                AND table_name = %s
            """, (self.db_config['database'], table_name))
            return cursor.fetchone()[0] > 0
        finally:
            cursor.close()

    def connect_to_db(self, max_retries=30, delay=2):
        """
        Attempt to connect to the database with retries and exponential backoff.
        Also verifies that the required table exists.
        """
        import time
        attempt = 0
        last_error = None

        while attempt < max_retries:
            try:
                logger.info(f"Attempting to connect to database (attempt {attempt + 1}/{max_retries})")
                conn = mysql.connector.connect(**self.db_config)
                
                # Check if the table exists
                if self.table_exists(conn, 'educational_facility'):
                    logger.info("Successfully connected and verified table existence")
                    return conn
                else:
                    logger.warning("Table 'educational_facility' does not exist yet")
                    conn.close()
                    raise mysql.connector.Error("Table 'educational_facility' does not exist")
                    
            except mysql.connector.Error as err:
                last_error = err
                attempt += 1
                wait_time = delay * (2 ** (attempt - 1))  # exponential backoff
                logger.warning(f"Failed to connect or verify table: {err}. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
        
        logger.error(f"Failed to connect to database after {max_retries} attempts: {last_error}")
        raise last_error

    def process_dataset(self, file_path: str) -> None:
        """
        Process the educational facilities dataset and load it into the database.
        """
        try:
            # Read dataset (supports CSV, Excel)
            df = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_excel(file_path)
            
            # Debug: Print column names
            logger.info("Available columns in the dataset:")
            for col in df.columns:
                logger.info(f"  - {col}")
            
            # Clean and validate data
            df = self._clean_data(df)
            
            # Insert into database
            self._insert_data(df)
            
            logger.info(f"Successfully processed {len(df)} records")
            
        except Exception as e:
            logger.error(f"Error processing dataset: {e}")
            raise

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and validate the dataset.
        """
        # First, let's normalize the column names
        df.columns = [col.strip() for col in df.columns]  # Remove any whitespace
        
        # Check if 'Unique ID' exists, if not look for variations
        unique_id_variants = ['Unique ID', 'UniqueID', 'unique_id', 'UNIQUE_ID', 'id', 'ID']
        unique_id_col = None
        
        for variant in unique_id_variants:
            if variant in df.columns:
                unique_id_col = variant
                break
        
        if unique_id_col:
            # Remove duplicates based on found unique ID column
            df = df.drop_duplicates(subset=[unique_id_col])
            logger.info(f"Using '{unique_id_col}' as the unique identifier")
        
        # Map the CSV columns to database columns
        column_mapping = {
            'unique_id': 'unique_id',
            'facility_name': 'facility_name',
            'authority_name': 'authority_name',
            'streetAddress': 'address',
            'postOfficeBoxNumber': 'unit',
            'postalCode': 'postal_code',
            'addressLocality': 'municipality_name',
            'provider': 'facility_type',
            'province_code': 'province',
            'source_id': 'source_id',
            'geometry': 'geometry',
            'is_OLMS': 'language_minority_status',
            'min_grade': 'min_grade',
            'max_grade': 'max_grade',
            'csdname': 'census_subdivision_name',
            'dguid': 'census_subdivision_id'
        }
        
        df = df.rename(columns=column_mapping)
        
        # Extract longitude and latitude from geometry field
        def extract_coordinates(geom_str):
            if pd.isna(geom_str) or geom_str == '':
                return None, None
            try:
                # Parse POINT (-53.9840877 47.7650123) format
                coords = geom_str.replace('POINT (', '').replace(')', '').split()
                return float(coords[0]), float(coords[1])
            except:
                return None, None

        # Create longitude and latitude columns from geometry
        df[['longitude', 'latitude']] = df['geometry'].apply(lambda x: pd.Series(extract_coordinates(x)))
        
        # Basic data cleaning (use target/renamed column names)
        df = df.fillna({
            'unit': '',
            'address': '',
            'min_grade': '',
            'max_grade': '',
            'authority_name': '',
            'census_subdivision_name': '',
            'geometry': ''
        })
        
        return df

    def _insert_data(self, df: pd.DataFrame) -> None:
        """
        Insert the processed data into the database.
        """
        conn = self.connect_to_db()
        cursor = conn.cursor()
        
        insert_query = """
        INSERT INTO educational_facility 
        (unique_id, facility_name, facility_type, authority_name, 
         address, unit, postal_code, municipality_name, province,
         source_id, min_grade, max_grade, language_minority_status,
         french_immersion, early_immersion, middle_immersion, late_immersion,
         census_subdivision_name, census_subdivision_id, geometry, longitude, latitude, date_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        try:
            for _, row in df.iterrows():
                # Use safe lookups (row.get) because we've renamed columns
                # Convert string-like boolean values to actual booleans (accept '1' or 1 or True)
                def to_bool(val):
                    if pd.isna(val):
                        return False
                    if isinstance(val, str):
                        return val.strip() == '1' or val.strip().lower() in ('true', 't', 'yes', 'y')
                    return bool(val)

                is_olms = to_bool(row.get('language_minority_status') or row.get('is_OLMS'))
                french_imm = to_bool(row.get('french_immersion'))
                early_imm = to_bool(row.get('early_immersion'))
                middle_imm = to_bool(row.get('middle_immersion'))
                late_imm = to_bool(row.get('late_immersion'))

                def clean_grade(grade):
                    if pd.isna(grade):
                        return None
                    grade_str = str(grade).strip().lower()
                    if grade_str in ('', 'nan', '.', 'none', 'null', '..'):
                        return None
                    return grade_str[:50]  # Enforce max length
                
                values = (
                    row.get('unique_id'),
                    row.get('facility_name'),
                    row.get('facility_type') or row.get('provider'),
                    row.get('authority_name'),
                    row.get('address'),
                    row.get('unit'),
                    row.get('postal_code') or row.get('postalCode'),
                    row.get('municipality_name') or row.get('addressLocality'),
                    row.get('province'),
                    row.get('source_id'),
                    clean_grade(row.get('min_grade')),
                    clean_grade(row.get('max_grade')),
                    is_olms,
                    french_imm,
                    early_imm,
                    middle_imm,
                    late_imm,
                    row.get('census_subdivision_name') or row.get('csdname'),
                    row.get('census_subdivision_id') or row.get('dguid'),
                    row.get('geometry'),
                    row.get('longitude'),
                    row.get('latitude'),
                    row.get('date_updated')
                )
                # Sanitize values: convert pandas NaN / numpy.nan to None so MySQL gets NULL
                sanitized = []
                for v in values:
                    try:
                        if v is None:
                            sanitized.append(None)
                        elif isinstance(v, float) and math.isnan(v):
                            sanitized.append(None)
                        elif isinstance(v, (str, bytes)) and str(v).lower() == 'nan':
                            sanitized.append(None)
                        else:
                            sanitized.append(v)
                    except Exception:
                        # fallback: if any check fails, insert None to avoid SQL errors
                        sanitized.append(None)

                cursor.execute(insert_query, tuple(sanitized))
            
            conn.commit()
            logger.info("Data successfully inserted into database")
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error inserting data: {e}")
            raise
        
        finally:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    import time
    
    # Wait for database to be ready
    max_retries = 30
    retry_interval = 2
    
    ingestor = EducationalFacilityIngestor()
    
    # Try to connect to the database with retries
    for attempt in range(max_retries):
        try:
            ingestor.connect_to_db().close()
            logger.info("Successfully connected to database")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Could not connect to database after {max_retries} attempts")
                raise
            logger.warning(f"Database connection attempt {attempt + 1} failed, retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)
    
    # Path to your dataset file
    dataset_path = "/usr/app/data/facilities.csv"  # This matches the volume mount point
    
    if not os.path.exists(dataset_path):
        logger.error(f"Dataset file not found at {dataset_path}")
        logger.error("Please make sure facilities.csv is in the ingestor/data directory")
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
        
    logger.info(f"Processing dataset from: {dataset_path}")
    ingestor.process_dataset(dataset_path)