import pandas as pd
import sys

def parse_diri(excel_path):
    df = pd.read_excel(excel_path, sheet_name="DIRI", header=None)
    def safe_int(val):
        try: return int(float(str(val).replace(',', '')))
        except: return 0
    
    diri_data = {"usia_gender": [], "etnis": [], "pendidikan": [], "profesi": [], "massa": []}
    for r in range(8, 11):
        if str(df.iloc[r, 0]) == "nan": break
        diri_data["usia_gender"].append({
            "Tahun": str(df.iloc[r, 0]),
            "Anak < 4 P": safe_int(df.iloc[r, 1]), "Anak < 4 W": safe_int(df.iloc[r, 2]),
        })
    return diri_data

print(parse_diri('Form LKKJ v3.1 2025-2026.xlsx'))
