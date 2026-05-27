import pandas as pd

df = pd.read_excel('Form LKKJ v3.1 2025-2026.xlsx', sheet_name='TENAGA', header=None)
print("=== TENAGA SHEET ===")

# Print first 50 rows to understand the structure
print(df.iloc[0:50, 0:25].to_string())

# Find tables by searching for strings that look like "1. ", "2. ", "3. "
for idx, row in df.iterrows():
    val = str(row[0]).strip()
    if val.startswith("1. ") or val.startswith("2. ") or val.startswith("3. ") or val.startswith("4. ") or val.startswith("5. "):
        print(f"\n=== TABLE AT ROW {idx}: {val} ===")
        print(df.iloc[idx:idx+10, 0:25].to_string())
