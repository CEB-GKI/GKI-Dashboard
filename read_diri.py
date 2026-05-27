import pandas as pd
import json
import sys

try:
    df = pd.read_excel('Form LKKJ v3.1 2025-2026.xlsx', sheet_name='DIRI', header=None)
    for r in [3, 12, 19, 27, 35]:
        print(f'=== TABLE {r+1}: {df.iloc[r, 0]} ===')
        # Print next 6 rows, dropping fully empty columns
        print(df.iloc[r:r+7, :20].dropna(how='all', axis=1).to_string())
        print('\n')
except Exception as e:
    print("Error:", e)
