import pandas as pd
import json

try:
    df = pd.read_excel('Form LKKJ v3.1 2025-2026.xlsx', sheet_name='DIRI', header=None)
    
    # Table 1: Usia & Gender (rows 5,6,7 are headers)
    print("=== TABLE 1 ===")
    t1 = df.iloc[5:10, 1:].dropna(how='all', axis=1)
    print(t1.to_string())

    # Table 2: Etnis (row 14 is header)
    print("\n=== TABLE 2 ===")
    t2 = df.iloc[14:18, 1:].dropna(how='all', axis=1)
    print(t2.to_string())

    # Table 3: Pendidikan (row 21, 22 are headers)
    print("\n=== TABLE 3 ===")
    t3 = df.iloc[21:26, 1:].dropna(how='all', axis=1)
    print(t3.to_string())

    # Table 4: Profesi (row 29, 30 are headers)
    print("\n=== TABLE 4 ===")
    t4 = df.iloc[29:34, 1:].dropna(how='all', axis=1)
    print(t4.to_string())

    # Table 5: Massa (row 37, 38 are headers)
    print("\n=== TABLE 5 ===")
    t5 = df.iloc[37:42, 1:].dropna(how='all', axis=1)
    print(t5.to_string())

except Exception as e:
    print("Error:", e)
