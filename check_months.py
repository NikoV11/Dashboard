import json

# Read the JavaScript file
with open('revenue-data.js', 'r') as f:
    content = f.read()
    
# Remove JavaScript variable declaration
json_str = content.replace('const REVENUE_DATA = ', '').replace(';\n', '')

# Parse JSON
data = json.loads(json_str)

# Get unique months
months = sorted(set([d['month'] for d in data]))
print('Unique months found in data:')
for month in months:
    print(f'  - {month}')

# Check sample data for each month in a specific year
print(f'\nSample data for year 2024:')
year_2024_data = [d for d in data if d['year'] == 2024]
months_2024 = sorted(set([d['month'] for d in year_2024_data]))
print(f'Months available in 2024: {months_2024}')

# Check if months match expected values
print(f'\nChecking for specific months in 2024:')
for month in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']:
    count = len([d for d in year_2024_data if d['month'] == month])
    print(f'  {month}: {count} records')
