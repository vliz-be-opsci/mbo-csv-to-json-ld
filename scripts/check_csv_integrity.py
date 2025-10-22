#!/usr/bin/env python3

import csv
import sys
import glob
import os

def check_file(file_path):
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        expected = None
        error_found = 0
        for line_num, row in enumerate(reader, start=1):
            if expected is None:
                expected = len(row)
                continue
            if len(row) < expected:
                print(f"{file_path}: line {line_num} has {len(row)} fields, expected at least {expected}")
                error_found = 1
        return error_found

# Determine the data directory path relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)  # Go up one level from scripts/ to project root
data_dir = os.path.join(project_root, "data")

# Check if data directory exists
if not os.path.exists(data_dir):
    print(f"❌ Data directory not found: {data_dir}")
    sys.exit(1)

errors = 0
csv_pattern = os.path.join(data_dir, "*.csv")
csv_files = glob.glob(csv_pattern)

if not csv_files:
    print(f"⚠️  No CSV files found in {data_dir}")
    sys.exit(1)

for f in csv_files:
    filename = os.path.basename(f)
    print(f"Checking {filename}")
    errors += check_file(f)

if errors:
    print("❌ CSV format errors found. Fix them before continuing.")
    sys.exit(1)
else:
    print("✅ All CSV files passed field count check.")
