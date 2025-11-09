#!/usr/bin/env python3
"""
Test script for querying educational facilities data.
Run this script after the data has been loaded to verify functionality.
"""

import requests
import json
from typing import Dict, Any
from tabulate import tabulate

BASE_URL = "http://localhost:8080"

def test_endpoint(endpoint: str, params: Dict[Any, Any] = None) -> None:
    """Test an API endpoint and print the results in a table format."""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            # Limit the results to 5 items for display
            display_data = data[:5]
            # Convert to table format
            headers = display_data[0].keys()
            rows = [d.values() for d in display_data]
            print(f"\nResults for {endpoint} (showing first 5 of {len(data)} total):")
            print(tabulate(rows, headers=headers, tablefmt="grid"))
        else:
            print(f"\nResponse from {endpoint}:")
            print(json.dumps(data, indent=2))
            
    except requests.exceptions.RequestException as e:
        print(f"Error testing {endpoint}: {e}")

def main():
    """Run a series of tests against the API."""
    print("Testing Educational Facilities API...")
    
    # Test basic endpoints
    test_endpoint("/api/facilities", {"limit": 5})
    
    # Test facility by ID (assuming ID 1 exists)
    test_endpoint("/api/facilities/1")
    
    # Test facility by unique ID
    test_endpoint("/api/facilities/unique/ON-001")
    
    # Test facilities by province
    test_endpoint("/api/facilities/province/ON", {"limit": 5})
    
    # Test facilities by municipality
    test_endpoint("/api/facilities/municipality/Toronto", {"limit": 5})
    
    # Test facilities by type
    test_endpoint("/api/facilities/type/Secondary School", {"limit": 5})
    
    # Test facilities by municipality
    test_endpoint("/api/facilities/municipality/Toronto")
    
    # Test facilities by type
    test_endpoint("/api/facilities/type/Secondary School")
    
    # Test facilities with French immersion
    test_endpoint("/api/facilities", {"french_immersion": "true"})
    
    # Test facilities by grade level
    test_endpoint("/api/facilities", {"min_grade": "9", "max_grade": "12"})

if __name__ == "__main__":
    main()