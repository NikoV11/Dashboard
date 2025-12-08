import pandas as pd
import json

# Read the Excel file
excel_file = pd.ExcelFile('data/all-funds-historical.xlsx')

# Storage for all data
all_data = []

# Process each fiscal year sheet (skip Table of Contents)
for sheet_name in excel_file.sheet_names:
    if sheet_name == 'Table of Contents':
        continue
    
    # Extract year from sheet name (e.g., "FY 2003" -> 2003)
    year = int(sheet_name.split()[-1])
    
    # Read the sheet
    df = pd.read_excel('data/all-funds-historical.xlsx', sheet_name=sheet_name)
    
    # The structure has Tax Category in first column, months in subsequent columns
    # Row 1 has the month names, rows 2+ have the data
    
    # Get month names from row 1 (index 1)
    months = df.iloc[1, 1:13].tolist()  # Columns 1-12 are the months
    
    # Get tax categories and their values
    # Start from row 2 (index 2) where actual tax data begins
    for i in range(2, len(df)):
        tax_category = df.iloc[i, 0]
        
        # Skip if not a valid tax category
        if pd.isna(tax_category) or str(tax_category).strip() == '':
            continue
        
        # Get monthly values for this tax category
        for month_idx, month in enumerate(months):
            value = df.iloc[i, month_idx + 1]  # +1 because first column is category name
            
            # Skip if value is not a number
            if pd.isna(value):
                continue
            
            try:
                value = float(value)
                all_data.append({
                    'year': year,
                    'month': str(month).strip(),
                    'category': str(tax_category).strip(),
                    'value': value
                })
            except (ValueError, TypeError):
                continue

print(f"Processed {len(all_data)} records")
print(f"Sample data:")
print(all_data[:5])
print(f"\nYears available: {sorted(set([d['year'] for d in all_data]))}")
print(f"Categories: {sorted(set([d['category'] for d in all_data]))}")

# Write to JavaScript file
with open('revenue-data.js', 'w') as f:
    f.write('const REVENUE_DATA = ')
    f.write(json.dumps(all_data, indent=2))
    f.write(';\n')

print(f"\nData written to revenue-data.js")
