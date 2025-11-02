# Use the latest stable Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/app/

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the Python code into the container
# You may need to copy more than one file to get your entire OO program
COPY data_ingestor.py .

# command to run the script once and keep the container running
CMD ["sh", "-c", "python data_ingestor.py && tail -f /dev/null"]