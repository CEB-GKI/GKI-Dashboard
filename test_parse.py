import pandas as pd
import json

def parse_diri_data(df):
    diri_data = {
        "usia_gender": [],
        "etnis": [],
        "pendidikan": [],
        "profesi": [],
        "massa": []
    }
    try:
        def safe_int(val):
            try: return int(float(str(val).replace(',', '')))
            except: return 0

        # Table 1: Usia & Gender (rows 8, 9, 10 are years)
        for r in range(8, 11):
            if str(df.iloc[r, 0]) == "nan": break
            diri_data["usia_gender"].append({
                "Tahun": str(df.iloc[r, 0]),
                "Anak < 4 P": safe_int(df.iloc[r, 1]),
                "Anak < 4 W": safe_int(df.iloc[r, 2]),
                "Anak 4-8 P": safe_int(df.iloc[r, 3]),
                "Anak 4-8 W": safe_int(df.iloc[r, 4]),
                "Anak 9-12 P": safe_int(df.iloc[r, 5]),
                "Anak 9-12 W": safe_int(df.iloc[r, 6]),
                "Anak 13-15 P": safe_int(df.iloc[r, 7]),
                "Anak 13-15 W": safe_int(df.iloc[r, 8]),
                "Anak > 15 P": safe_int(df.iloc[r, 9]),
                "Anak > 15 W": safe_int(df.iloc[r, 10]),
                
                "Dewasa < 16 P": safe_int(df.iloc[r, 14]),
                "Dewasa < 16 W": safe_int(df.iloc[r, 15]),
                "Dewasa 16-19 P": safe_int(df.iloc[r, 16]),
                "Dewasa 16-19 W": safe_int(df.iloc[r, 17]),
                "Dewasa 20-30 P": safe_int(df.iloc[r, 18]),
                "Dewasa 20-30 W": safe_int(df.iloc[r, 19]),
                "Dewasa 31-39 P": safe_int(df.iloc[r, 20]),
                "Dewasa 31-39 W": safe_int(df.iloc[r, 21]),
                "Dewasa 40-59 P": safe_int(df.iloc[r, 22]),
                "Dewasa 40-59 W": safe_int(df.iloc[r, 23]),
                "Dewasa >= 60 P": safe_int(df.iloc[r, 24]),
                "Dewasa >= 60 W": safe_int(df.iloc[r, 25]),
            })

        # Table 2: Etnis
        for r in range(15, 18):
            if str(df.iloc[r, 0]) == "nan": break
            diri_data["etnis"].append({
                "Tahun": str(df.iloc[r, 0]),
                "Tionghoa": safe_int(df.iloc[r, 4]),
                "Sunda": safe_int(df.iloc[r, 6]),
                "Batak": safe_int(df.iloc[r, 8]),
                "Jawa": safe_int(df.iloc[r, 10]),
                "Ambon": safe_int(df.iloc[r, 12]),
                "Minahasa": safe_int(df.iloc[r, 14]),
                "Nias": safe_int(df.iloc[r, 16]),
                "Dayak": safe_int(df.iloc[r, 18]),
                "Toraja": safe_int(df.iloc[r, 20]),
                "Timor": safe_int(df.iloc[r, 22]),
                "Papua": safe_int(df.iloc[r, 24]),
                "Lain-lain": safe_int(df.iloc[r, 26])
            })
            
        # Table 3: Pendidikan
        for r in range(23, 26):
            if str(df.iloc[r, 0]) == "nan": break
            diri_data["pendidikan"].append({
                "Tahun": str(df.iloc[r, 0]),
                "Tidak Tamat SD": safe_int(df.iloc[r, 4]),
                "SD": safe_int(df.iloc[r, 6]),
                "SMP": safe_int(df.iloc[r, 8]),
                "SMA": safe_int(df.iloc[r, 10]),
                "Kejuruan": safe_int(df.iloc[r, 12]),
                "D-1": safe_int(df.iloc[r, 14]),
                "D-2": safe_int(df.iloc[r, 16]),
                "D-3": safe_int(df.iloc[r, 18]),
                "D-4/S-1": safe_int(df.iloc[r, 20]),
                "S-2": safe_int(df.iloc[r, 22]),
                "S-3": safe_int(df.iloc[r, 24]),
                "Lain-lain": safe_int(df.iloc[r, 26])
            })

        # Table 4: Profesi
        for r in range(31, 34):
            if str(df.iloc[r, 0]) == "nan": break
            diri_data["profesi"].append({
                "Tahun": str(df.iloc[r, 0]),
                "Wirausaha": safe_int(df.iloc[r, 4]),
                "Pegawai Swasta": safe_int(df.iloc[r, 6]),
                "Pegawai Negeri": safe_int(df.iloc[r, 8]),
                "Profesional": safe_int(df.iloc[r, 10]),
                "Pensiunan": safe_int(df.iloc[r, 12]),
                "Ibu Rumah Tangga": safe_int(df.iloc[r, 14]),
                "Pelajar/Mahasiswa": safe_int(df.iloc[r, 17]),
                "Petani/Peternak": safe_int(df.iloc[r, 20]),
                "Lain-lain": safe_int(df.iloc[r, 22])
            })

        # Table 5: Massa
        for r in range(39, 42):
            if str(df.iloc[r, 0]) == "nan": break
            diri_data["massa"].append({
                "Tahun": str(df.iloc[r, 0]),
                "Anak (0-12)": safe_int(df.iloc[r, 4]),
                "Pra Remaja (13-15)": safe_int(df.iloc[r, 7]),
                "Remaja (16-19)": safe_int(df.iloc[r, 10]),
                "Pemuda (20-30)": safe_int(df.iloc[r, 13]),
                "Dewasa Muda (31-39)": safe_int(df.iloc[r, 16]),
                "Dewasa (40-59)": safe_int(df.iloc[r, 19]),
                "Senior (>60)": safe_int(df.iloc[r, 22])
            })
            
    except Exception as e:
        print(f"Error parsing DIRI: {e}")
        
    return diri_data

df = pd.read_excel('Form LKKJ v3.1 2025-2026.xlsx', sheet_name='DIRI', header=None)
print(json.dumps(parse_diri_data(df), indent=2))
