import pandas as pd
import json
from datetime import datetime

# Read the CSV file, skipping header rows
df = pd.read_csv('data/mortgage-rates.csv', skiprows=7)

# The first column contains dates, second column contains 30yr rates
# Column names are taken from the first row: '4/2/1971' is the date, '7.33' is the rate
mortgage_data = []

# Get the actual column names (which are the header row)
col_names = df.columns.tolist()

# First column is date, second is 30yr rate
for index, row in df.iterrows():
    try:
        # The date is in the first column
        date_str = col_names[0]  # '4/2/1971'
        
        # Parse date
        date_obj = pd.to_datetime(date_str)
        formatted_date = date_obj.strftime('%Y-%m-%d')
        
        # The 30 year rate is in the second column
        rate_30yr = col_names[1]  # '7.33'
        rate_30yr = float(rate_30yr) if rate_30yr and rate_30yr != '' else None
        
        # Only add if we have a valid rate
        if rate_30yr is not None:
            mortgage_data.append({
                'date': formatted_date,
                'rate30yr': rate_30yr,
                'rate15yr': None
            })
    except (ValueError, TypeError, AttributeError) as e:
        continue

# Actually, the structure is: first row has dates and rates
# Let me reparse this correctly
mortgage_data = []

# Read without headers to understand structure
df_raw = pd.read_csv('data/mortgage-rates.csv', skiprows=7, header=None)

for index, row in df_raw.iterrows():
    try:
        # First column (0) is the date
        date_str = str(row[0]).strip()
        if not date_str or date_str == 'nan':
            continue
        
        # Second column (1) is the 30yr rate
        rate_30yr_str = str(row[1]).strip()
        if rate_30yr_str and rate_30yr_str != 'nan':
            rate_30yr = float(rate_30yr_str)
        else:
            rate_30yr = None
        
        # Third column (2) might be fees/points (skip)
        # Try to find 15yr rate
        rate_15yr = None
        if len(row) > 3:
            rate_15yr_str = str(row[3]).strip()
            if rate_15yr_str and rate_15yr_str != 'nan':
                try:
                    rate_15yr = float(rate_15yr_str)
                except:
                    rate_15yr = None
        
        # Parse date and add if we have at least one rate
        if rate_30yr is not None or rate_15yr is not None:
            date_obj = pd.to_datetime(date_str)
            formatted_date = date_obj.strftime('%Y-%m-%d')
            
            mortgage_data.append({
                'date': formatted_date,
                'rate30yr': rate_30yr,
                'rate15yr': rate_15yr
            })
    except (ValueError, TypeError, AttributeError, pd.errors.ParserError) as e:
        continue

print(f"Processed {len(mortgage_data)} records")
print(f"Sample data:")
for record in mortgage_data[:5]:
    print(record)
print(f"Last record:")
print(mortgage_data[-1] if mortgage_data else "No data")

# Write to JavaScript file
with open('mortgage-data.js', 'w') as f:
    f.write('const MORTGAGE_RATES_DATA = ')
    f.write(json.dumps(mortgage_data, indent=2))
    f.write(';\n')

print(f"\nData written to mortgage-data.js")
