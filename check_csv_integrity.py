#!/usr/bin/env python3

import csv
import sys
import glob

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

errors = 0
for f in glob.glob("*.csv"):
    print(f"Checking {f}")
    errors += check_file(f)

if errors:
    print("❌ CSV format errors found. Fix them before continuing.")
    sys.exit(1)
else:
    print("✅ All CSV files passed field count check.")
