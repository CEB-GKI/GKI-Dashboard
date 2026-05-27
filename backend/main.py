import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd
import requests
import json
import os
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_DIR = "cache"
CACHE_FILE = os.path.join(CACHE_DIR, "data.json")
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

class URLRequest(BaseModel):
    url: str

FOCUS_SHEETS = [
    "Keb. Minggu",
    "Keb. Kategorial",
    "Pers. Kategorial",
    "Pers. Lainnya",
    "Perayaan",
    "RAPAT",
    "UANG",
    "DIRI",
    "TENAGA",
    "Mutasi"
]

def transform_url(url: str) -> str:
    if "/edit" in url:
        return re.sub(r'\/edit.*', '/export?format=xlsx', url)
    return url

def parse_kebaktian(df, sheet_type="Keb. Minggu"):
    cleaned = []
    current_date = "Unknown Date"
    
    mapping = {
        "Keb. Minggu": {
            "anggota": 9, "simpatisan": 12, "gki_lain": 15, "penatua": 18,
            "gsm": None, "pemusik": 21, "multimedia": 24, "subtotal": 27,
            "onsite": 30, "total": 33
        },
        "Keb. Kategorial": {
            "anggota": 8, "simpatisan": 11, "gki_lain": 14, "penatua": 17,
            "gsm": 20, "pemusik": 23, "multimedia": 26, "subtotal": 29,
            "onsite": 32, "total": 35
        },
        "Pers. Kategorial": {
            "anggota": 7, "simpatisan": 10, "gki_lain": 13, "penatua": 16,
            "gsm": 19, "pemusik": 22, "multimedia": 25, "subtotal": 28,
            "onsite": 31, "total": 34
        },
        "Perayaan": {
            "anggota": 9, "simpatisan": 12, "gki_lain": 15, "penatua": 18,
            "gsm": None, "pemusik": 21, "multimedia": 24, "subtotal": 27,
            "onsite": 30, "total": 33
        }
    }
    
    cfg = mapping.get(sheet_type, mapping["Keb. Minggu"])
    
    def safe_float(val):
        try:
            if pd.notna(val) and str(val).strip() != "":
                return float(val)
            return 0.0
        except:
            return 0.0

    for idx, row in df.iterrows():
        col0 = str(row[0]).strip()
        col1 = str(row[1]).strip()
        
        if "resume" in col0.lower() or "resume" in col1.lower():
            break
        
        # Skip rata-rata, jumlah, or literal "KU" rows
        if "rata-rata" in col0.lower() or "rata-rata" in col1.lower() or "jumlah" in col0.lower() or "jumlah" in col1.lower():
            continue
        if col1.strip().upper() == "KU":
            continue
            
        # Keep track of date if it's merged
        if col0 != "nan" and col0 != "None" and col0 != "":
            if "202" in col0 or "-" in col0:
                current_date = col0.split()[0] # remove timestamp
                
        process_row = False
        if sheet_type == "Keb. Minggu":
            if "KU" in col1 or col1 in ["1", "2", "3", "4", "5"] or "Tahun Baru" in col0:
                process_row = True
        elif sheet_type == "Perayaan":
            if col1 != "nan" and col1 != "None" and col1 != "":
                process_row = True
        else:
            # For Kategorial sheets, "Jenis Kebaktian/Persekutuan" is any non-empty string in col1
            if col1 != "nan" and col1 != "None" and col1 != "":
                process_row = True
                
        if process_row:
            jam = col1 if col1 != "nan" else "Umum"
            
            # Map columns according to the precise index
            # J-L(9-11): Anggota Jemaat (Pria, Wnt, Jml)
            # M-O(12-14): Simpatisan (Pria, Wnt, Jml)
            # P-R(15-17): Anggota GKI Lain (Pria, Wnt, Jml)
            # S-U(18-20): Penatua (Pria, Wnt, Jml)
            # V-X(21-23): Pemusik Gerejawi (Pria, Wnt, Jml)
            # Y-AA(24-26): Multi Media & Sound System (Pria, Wnt, Jml)
            # AB-AD(27-29): Sub Total Anggota (Pria, Wnt, Jml)
            # AE-AG(30-32): Total Hadir On-site (Pria, Wnt, Jml)
            # AH(33): Total Kehadiran
            
            row_vals = row.values
            def get_val(i):
                if i < len(row_vals):
                    return safe_float(row_vals[i])
                return 0.0
                
            total_hadir = get_val(cfg["total"])
            if total_hadir <= 0:
                total_hadir = get_val(cfg["onsite"] + 2)
                
            if total_hadir > 0 or get_val(cfg["onsite"] + 2) > 0:
                record = {
                    "Tanggal": current_date,
                    "Jam": jam,
                    "Anggota Jemaat Pria": get_val(cfg["anggota"]),
                    "Anggota Jemaat Wanita": get_val(cfg["anggota"] + 1),
                    "Anggota Jemaat Jumlah": get_val(cfg["anggota"] + 2),
                    
                    "Simpatisan Pria": get_val(cfg["simpatisan"]),
                    "Simpatisan Wanita": get_val(cfg["simpatisan"] + 1),
                    "Simpatisan Jumlah": get_val(cfg["simpatisan"] + 2),
                    
                    "Anggota GKI Lain Pria": get_val(cfg["gki_lain"]),
                    "Anggota GKI Lain Wanita": get_val(cfg["gki_lain"] + 1),
                    "Anggota GKI Lain Jumlah": get_val(cfg["gki_lain"] + 2),
                    
                    "Penatua Pria": get_val(cfg["penatua"]),
                    "Penatua Wanita": get_val(cfg["penatua"] + 1),
                    "Penatua Jumlah": get_val(cfg["penatua"] + 2),
                }
                
                if cfg["gsm"] is not None:
                    record["GSM Pria"] = get_val(cfg["gsm"])
                    record["GSM Wanita"] = get_val(cfg["gsm"] + 1)
                    record["GSM Jumlah"] = get_val(cfg["gsm"] + 2)
                
                record.update({
                    "Pemusik Gerejawi Pria": get_val(cfg["pemusik"]),
                    "Pemusik Gerejawi Wanita": get_val(cfg["pemusik"] + 1),
                    "Pemusik Gerejawi Jumlah": get_val(cfg["pemusik"] + 2),
                    
                    "Multi Media Pria": get_val(cfg["multimedia"]),
                    "Multi Media Wanita": get_val(cfg["multimedia"] + 1),
                    "Multi Media Jumlah": get_val(cfg["multimedia"] + 2),
                    
                    "Sub Total Anggota Pria": get_val(cfg["subtotal"]),
                    "Sub Total Anggota Wanita": get_val(cfg["subtotal"] + 1),
                    "Sub Total Anggota Jumlah": get_val(cfg["subtotal"] + 2),
                    
                    "Total On-site Pria": get_val(cfg["onsite"]),
                    "Total On-site Wanita": get_val(cfg["onsite"] + 1),
                    "Total On-site Jumlah": get_val(cfg["onsite"] + 2),
                    
                    "Total Kehadiran": total_hadir
                })
                cleaned.append(record)
    return cleaned

def parse_rapat(df):
    cleaned = []
    current_date = "Unknown Date"
    
    for idx, row in df.iterrows():
        row_vals = row.values
        if len(row_vals) < 10:
            continue
            
        col0 = row_vals[0]
        if pd.api.types.is_numeric_dtype(type(col0)) and col0 > 40000:
            current_date = pd.to_datetime(col0, unit='D', origin='1899-12-30').strftime('%Y-%m-%d')
        else:
            col0_str = str(col0).strip()
            if col0_str and col0_str != "nan" and col0_str != "None":
                if "202" in col0_str or "-" in col0_str:
                    current_date = col0_str.split(" ")[0]
                    
        if current_date != "Unknown Date":
            jam = str(row_vals[1]).strip()
            jam_lower = jam.lower()
            if not jam or "rata-rata" in jam_lower or "jumlah" in jam_lower or "diperiksa" in jam_lower or "pnt." in jam_lower or "pic " in jam_lower or "jenis persidangan" in jam_lower:
                continue
                
            def get_val(i):
                if i < len(row_vals):
                    v = row_vals[i]
                    if pd.notna(v) and str(v).strip() != "":
                        try: return float(v)
                        except: return 0.0
                return 0.0
                
            pria = get_val(7)
            wanita = get_val(8)
            total = get_val(9)
            anggota = get_val(6)
            
            if pria == 0 and wanita == 0 and total == 0 and anggota == 0:
                continue
                
            cleaned.append({
                "Tanggal": current_date,
                "Jam": jam,
                "Jumlah Kehadiran Pria": pria,
                "Jumlah Kehadiran Wanita": wanita,
                "Jumlah Kehadiran": total,
                "Jumlah Anggota": anggota
            })
    return cleaned

def parse_uang(df):
    cleaned = []
    current_date = "Unknown Date"
    month_names = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des']
    
    for idx, row in df.iterrows():
        row_vals = row.values
        if len(row_vals) < 10:
            continue
            
        jam_raw = str(row_vals[1]).strip()
        jam_lower = jam_raw.lower()
        
        is_date_row = False
        col8 = row_vals[8]
        
        if pd.api.types.is_numeric_dtype(type(col8)) and col8 > 40000 and col8 < 50000 and (not jam_raw or "bulan" in jam_lower):
            current_date = pd.to_datetime(col8, unit='D', origin='1899-12-30').strftime('%Y-%m-%d')
            is_date_row = True
        else:
            col8_str = str(col8).strip()
            if col8_str and col8_str != "nan" and col8_str != "None":
                col8_lower = col8_str.lower()
                has_month = any(m in col8_lower for m in month_names)
                
                if has_month and ("202" in col8_str or "203" in col8_str) and (not jam_raw or "bulan" in jam_lower):
                    for mi, m in enumerate(month_names):
                        if m in col8_lower:
                            match = re.search(r'20\d\d', col8_str)
                            if match:
                                yyyy = match.group()
                                mm = str(mi + 1).zfill(2)
                                current_date = f"{yyyy}-{mm}-01"
                                is_date_row = True
                            break
                elif re.match(r'^\d{4}-\d{2}-\d{2}', col8_str) and not jam_raw:
                    current_date = col8_str.split(" ")[0]
                    is_date_row = True
                    
        if is_date_row:
            continue
            
        if current_date != "Unknown Date" and jam_raw:
            if "jumlah" in jam_lower or "total" in jam_lower or "subtotal" in jam_lower or jam_lower == "jam" or "rata-rata" in jam_lower or "jenis persidangan" in jam_lower or "jenis penerimaan" in jam_lower:
                continue
                
            def get_val(i):
                if i < len(row_vals):
                    v = row_vals[i]
                    if pd.notna(v) and str(v).strip() != "":
                        try: return float(v)
                        except: return 0.0
                return 0.0
                
            accum = get_val(8)
            curr = get_val(6)
            prev = get_val(2)
            
            if accum == 0 and curr == 0 and prev == 0:
                continue
                
            clean_jam = jam_raw.rstrip('*').strip()
            
            cleaned.append({
                "Tanggal": current_date,
                "Jam": clean_jam,
                "Penerimaan": get_val(6),
                "Rata-rata Penerimaan": get_val(7),
                "Penerimaan (Tahun Lalu)": get_val(2),
                "Rata-rata Penerimaan (Tahun Lalu)": get_val(3),
                "Akumulasi": get_val(8),
                "Rata-rata Akumulasi": get_val(9)
            })
    return cleaned

def clean_sheet_data(df, sheet_name):
    if sheet_name in ["Keb. Minggu", "Keb. Kategorial", "Pers. Kategorial", "Pers. Lainnya", "Perayaan"]:
        return parse_kebaktian(df, sheet_type=sheet_name)
    elif sheet_name == "RAPAT":
        return parse_rapat(df)
    elif sheet_name == "UANG":
        return parse_uang(df)

    # Generic Cleaner for other sheets
    header_idx = -1
    for idx, row in df.iterrows():
        row_str = " ".join([str(x) for x in row.values])
        if re.search(r'20\d\d\s*-\s*20\d\d|20\d\d', row_str) or "ALASAN" in row_str or "JENIS" in row_str:
            if "Tahun Pelayanan" not in row_str and "DATA LAPORAN" not in row_str:
                header_idx = idx
                break
                
    if header_idx == -1:
        df = df.dropna(axis=1, how='all').fillna("")
        return df.to_dict(orient="records")
        
    new_df = df.iloc[header_idx+1:].copy()
    headers = []
    
    for col_idx, col_name in enumerate(df.iloc[header_idx].values):
        col_name = str(col_name).strip()
        if col_name == 'nan' or col_name == 'None' or col_name == '':
            parent = ""
            for i in range(max(0, header_idx-2), header_idx):
                val = str(df.iloc[i, col_idx]).strip()
                if val != 'nan' and val != 'None' and val != '':
                    parent = val
            col_name = parent if parent else f"Kolom_{col_idx}"
            
        final_name = col_name
        counter = 1
        while final_name in headers:
            final_name = f"{col_name}_{counter}"
            counter += 1
        headers.append(final_name)
        
    new_df.columns = headers
    new_df = new_df.dropna(how='all')
    
    # Drop columns that have 'Kolom_' and are completely empty
    cols_to_drop = [c for c in new_df.columns if "Kolom_" in c and new_df[c].isna().all()]
    new_df = new_df.drop(columns=cols_to_drop)
    
    new_df = new_df.fillna("")
    
    for col in new_df.columns:
        converted = pd.to_numeric(new_df[col], errors='coerce')
        new_df[col] = new_df[col].where(converted.isna(), converted)
        
    # Remove keys starting with Kolom_ if they are meaningless to the frontend
    records = new_df.to_dict(orient="records")
    clean_records = []
    for rec in records:
        clean_rec = {k: v for k, v in rec.items() if not (str(k).startswith("Kolom_") and v == "")}
        clean_records.append(clean_rec)
        
    return clean_records

def parse_yearly_data(df, sheet_name):
    yearly = []
    mapping = {
        "Keb. Minggu": { "yearIdx": 6, "jamOffset": None, "anggota": 9, "simpatisan": 12, "gki_lain": 15, "penatua": 18, "gsm": None, "pemusik": 21, "multimedia": 24, "subtotal": 27, "onsite": 30, "total": 33 },
        "Keb. Kategorial": { "yearIdx": 3, "jamOffset": 2, "anggota": 8, "simpatisan": 11, "gki_lain": 14, "penatua": 17, "gsm": 20, "pemusik": 23, "multimedia": 26, "subtotal": 29, "onsite": 32, "total": 35 },
        "Pers. Kategorial": { "yearIdx": 1, "jamOffset": 1, "anggota": 7, "simpatisan": 10, "gki_lain": 13, "penatua": 16, "gsm": 19, "pemusik": 22, "multimedia": 25, "subtotal": 28, "onsite": 31, "total": 34 },
        "Pers. Lainnya": { "yearIdx": 1, "jamOffset": 1, "anggota": 5, "simpatisan": 8, "gki_lain": 11, "penatua": 14, "gsm": 17, "pemusik": 20, "multimedia": 23, "subtotal": 26, "onsite": 29, "total": 32 },
        "Perayaan": { "yearIdx": 4, "jamOffset": 2, "anggota": 9, "simpatisan": 12, "gki_lain": 15, "penatua": 18, "gsm": None, "pemusik": 21, "multimedia": 24, "subtotal": 27, "onsite": 30, "total": 33 }
    }
    cfg = mapping.get(sheet_name)
    if not cfg:
        return []

    def get_val(row_vals, i):
        if i is None or i >= len(row_vals):
            return 0.0
        val = row_vals[i]
        try:
            if pd.notna(val) and str(val).strip() != "":
                return math.ceil(float(val))
        except:
            pass
        return 0.0

    # Scan from bottom, up to 150 rows
    start_idx = max(0, len(df) - 150)
    # df.iterrows gives (index, row)
    for idx in range(len(df)-1, start_idx-1, -1):
        row = df.iloc[idx].values
        if cfg["yearIdx"] < len(row):
            year_str = str(row[cfg["yearIdx"]]).strip()
            if re.match(r'^\d{4}\s*-\s*\d{4}$', year_str):
                jam_str = "Umum"
                if cfg["jamOffset"] is not None:
                    jam_idx = cfg["yearIdx"] + cfg["jamOffset"]
                    if jam_idx < len(row):
                        jam_str = str(row[jam_idx]).strip()
                
                if not jam_str or jam_str == '1' or "rata" in jam_str.lower() or jam_str == "nan":
                    continue

                record = {
                    "Tanggal": year_str,
                    "Jam": jam_str,
                    "Anggota Jemaat Pria": get_val(row, cfg["anggota"]),
                    "Anggota Jemaat Wanita": get_val(row, cfg["anggota"] + 1),
                    "Anggota Jemaat Jumlah": get_val(row, cfg["anggota"] + 2),
                    
                    "Simpatisan Pria": get_val(row, cfg["simpatisan"]),
                    "Simpatisan Wanita": get_val(row, cfg["simpatisan"] + 1),
                    "Simpatisan Jumlah": get_val(row, cfg["simpatisan"] + 2),
                    
                    "Anggota GKI Lain Pria": get_val(row, cfg["gki_lain"]),
                    "Anggota GKI Lain Wanita": get_val(row, cfg["gki_lain"] + 1),
                    "Anggota GKI Lain Jumlah": get_val(row, cfg["gki_lain"] + 2),
                    
                    "Penatua Pria": get_val(row, cfg["penatua"]),
                    "Penatua Wanita": get_val(row, cfg["penatua"] + 1),
                    "Penatua Jumlah": get_val(row, cfg["penatua"] + 2),
                }

                if cfg["gsm"] is not None:
                    record["GSM Pria"] = get_val(row, cfg["gsm"])
                    record["GSM Wanita"] = get_val(row, cfg["gsm"] + 1)
                    record["GSM Jumlah"] = get_val(row, cfg["gsm"] + 2)

                record.update({
                    "Pemusik Gerejawi Pria": get_val(row, cfg["pemusik"]),
                    "Pemusik Gerejawi Wanita": get_val(row, cfg["pemusik"] + 1),
                    "Pemusik Gerejawi Jumlah": get_val(row, cfg["pemusik"] + 2),
                    
                    "Multi Media Pria": get_val(row, cfg["multimedia"]),
                    "Multi Media Wanita": get_val(row, cfg["multimedia"] + 1),
                    "Multi Media Jumlah": get_val(row, cfg["multimedia"] + 2),
                    
                    "Sub Total Anggota Pria": get_val(row, cfg["subtotal"]),
                    "Sub Total Anggota Wanita": get_val(row, cfg["subtotal"] + 1),
                    "Sub Total Anggota Jumlah": get_val(row, cfg["subtotal"] + 2),
                    
                    "Total On-site Pria": get_val(row, cfg["onsite"]),
                    "Total On-site Wanita": get_val(row, cfg["onsite"] + 1),
                    "Total On-site Jumlah": get_val(row, cfg["onsite"] + 2),
                    
                    "Total Kehadiran": get_val(row, cfg["total"])
                })
                
                yearly.insert(0, record)
    return yearly

@app.post("/api/data")
def fetch_data(req: URLRequest):
    export_url = transform_url(req.url)
    
    try:
        response = requests.get(export_url, timeout=15)
        response.raise_for_status()
        
        temp_file = os.path.join(CACHE_DIR, "temp.xlsx")
        with open(temp_file, "wb") as f:
            f.write(response.content)
            
        with pd.ExcelFile(temp_file) as excel_data:
            parsed_data = {}
            yearly_data = {}
            church_name = "Waha" # Default fallback
            
            if "ISIAN" in excel_data.sheet_names:
                try:
                    df_isian = pd.read_excel(excel_data, sheet_name="ISIAN", header=None)
                    val = str(df_isian.iloc[2, 3]).strip()
                    if val and val != "nan" and val != "None":
                        church_name = val
                except Exception as e:
                    print(f"Failed to read ISIAN D3: {e}")

            for sheet in FOCUS_SHEETS:
                if sheet in excel_data.sheet_names:
                    df = pd.read_excel(excel_data, sheet_name=sheet, header=None)
                    if sheet == "DIRI":
                        def safe_int(val):
                            try: return int(float(str(val).replace(',', '')))
                            except: return 0
                    
                        diri_data = {"usia_gender": [], "etnis": [], "pendidikan": [], "profesi": [], "massa": []}
                        for r in range(8, 11):
                            if str(df.iloc[r, 0]) == "nan": break
                            diri_data["usia_gender"].append({
                                "Tahun": str(df.iloc[r, 0]),
                                "Anak < 4 P": safe_int(df.iloc[r, 1]), "Anak < 4 W": safe_int(df.iloc[r, 2]),
                                "Anak 4-8 P": safe_int(df.iloc[r, 3]), "Anak 4-8 W": safe_int(df.iloc[r, 4]),
                                "Anak 9-12 P": safe_int(df.iloc[r, 5]), "Anak 9-12 W": safe_int(df.iloc[r, 6]),
                                "Anak 13-15 P": safe_int(df.iloc[r, 7]), "Anak 13-15 W": safe_int(df.iloc[r, 8]),
                                "Anak > 15 P": safe_int(df.iloc[r, 9]), "Anak > 15 W": safe_int(df.iloc[r, 10]),
                                "Dewasa < 16 P": safe_int(df.iloc[r, 14]), "Dewasa < 16 W": safe_int(df.iloc[r, 15]),
                                "Dewasa 16-19 P": safe_int(df.iloc[r, 16]), "Dewasa 16-19 W": safe_int(df.iloc[r, 17]),
                                "Dewasa 20-30 P": safe_int(df.iloc[r, 18]), "Dewasa 20-30 W": safe_int(df.iloc[r, 19]),
                                "Dewasa 31-39 P": safe_int(df.iloc[r, 20]), "Dewasa 31-39 W": safe_int(df.iloc[r, 21]),
                                "Dewasa 40-59 P": safe_int(df.iloc[r, 22]), "Dewasa 40-59 W": safe_int(df.iloc[r, 23]),
                                "Dewasa >= 60 P": safe_int(df.iloc[r, 24]), "Dewasa >= 60 W": safe_int(df.iloc[r, 25]),
                                "Jml_Anak": safe_int(df.iloc[r, 14]),
                                "Jml_Dewasa": safe_int(df.iloc[r, 28]),
                                "Total": safe_int(df.iloc[r, 29])
                            })
                        for r in range(15, 18):
                            if str(df.iloc[r, 0]) == "nan": break
                            diri_data["etnis"].append({
                                "Tahun": str(df.iloc[r, 0]), "Tionghoa": safe_int(df.iloc[r, 4]), "Sunda": safe_int(df.iloc[r, 6]),
                                "Batak": safe_int(df.iloc[r, 8]), "Jawa": safe_int(df.iloc[r, 10]), "Ambon": safe_int(df.iloc[r, 12]),
                                "Minahasa": safe_int(df.iloc[r, 14]), "Nias": safe_int(df.iloc[r, 16]), "Dayak": safe_int(df.iloc[r, 18]),
                                "Toraja": safe_int(df.iloc[r, 20]), "Timor": safe_int(df.iloc[r, 22]), "Papua": safe_int(df.iloc[r, 24]),
                                "Lain-lain": safe_int(df.iloc[r, 26]),
                                "Total": safe_int(df.iloc[r, 28])
                            })
                        for r in range(23, 26):
                            if str(df.iloc[r, 0]) == "nan": break
                            diri_data["pendidikan"].append({
                                "Tahun": str(df.iloc[r, 0]), "Tidak Tamat SD": safe_int(df.iloc[r, 4]), "SD": safe_int(df.iloc[r, 6]),
                                "SMP": safe_int(df.iloc[r, 8]), "SMA": safe_int(df.iloc[r, 10]), "Kejuruan": safe_int(df.iloc[r, 12]),
                                "D-1": safe_int(df.iloc[r, 14]), "D-2": safe_int(df.iloc[r, 16]), "D-3": safe_int(df.iloc[r, 18]),
                                "D-4/S-1": safe_int(df.iloc[r, 20]), "S-2": safe_int(df.iloc[r, 22]), "S-3": safe_int(df.iloc[r, 24]),
                                "Lain-lain": safe_int(df.iloc[r, 26]),
                                "Total": safe_int(df.iloc[r, 28])
                            })
                        for r in range(31, 34):
                            if str(df.iloc[r, 0]) == "nan": break
                            diri_data["profesi"].append({
                                "Tahun": str(df.iloc[r, 0]), "Wirausaha": safe_int(df.iloc[r, 4]), "Pegawai Swasta": safe_int(df.iloc[r, 6]),
                                "Pegawai Negeri": safe_int(df.iloc[r, 8]), "Profesional": safe_int(df.iloc[r, 10]), "Pensiunan": safe_int(df.iloc[r, 12]),
                                "Ibu Rumah Tangga": safe_int(df.iloc[r, 14]), "Pelajar/Mahasiswa": safe_int(df.iloc[r, 17]),
                                "Petani/Peternak": safe_int(df.iloc[r, 20]), "Lain-lain": safe_int(df.iloc[r, 22]),
                                "Total": safe_int(df.iloc[r, 24])
                            })
                        for r in range(39, 42):
                            if str(df.iloc[r, 0]) == "nan": break
                            diri_data["massa"].append({
                                "Tahun": str(df.iloc[r, 0]), "Anak (0-12)": safe_int(df.iloc[r, 1]), "Pra Remaja (13-15)": safe_int(df.iloc[r, 4]),
                                "Remaja (16-19)": safe_int(df.iloc[r, 7]), "Pemuda (20-30)": safe_int(df.iloc[r, 10]),
                                "Dewasa Muda (31-39)": safe_int(df.iloc[r, 13]), "Dewasa (40-59)": safe_int(df.iloc[r, 16]),
                                "Senior (>60)": safe_int(df.iloc[r, 19]),
                                "Total": safe_int(df.iloc[r, 22])
                            })
                        parsed_data[sheet] = diri_data
                        yearly_data[sheet] = []
                    elif sheet == "TENAGA":
                        def safe_float(val):
                            try: return float(str(val).replace(',', ''))
                            except: return 0.0
                        
                        tenaga_data = {"ratio_penatua": [], "ratio_gsm": [], "rekap_aktivis": []}
                        for r in range(11, 14):
                            if str(df.iloc[r, 0]) == "nan": break
                            tenaga_data["ratio_penatua"].append({
                                "Tahun": str(df.iloc[r, 0]),
                                "Total Jemaat": safe_int(df.iloc[r, 1]),
                                "Penatua P": safe_int(df.iloc[r, 2]), "Penatua W": safe_int(df.iloc[r, 3]),
                                "Pengurus P": safe_int(df.iloc[r, 4]), "Pengurus W": safe_int(df.iloc[r, 5]),
                                "GSM P": safe_int(df.iloc[r, 6]), "GSM W": safe_int(df.iloc[r, 7]),
                                "Pemusik P": safe_int(df.iloc[r, 8]), "Pemusik W": safe_int(df.iloc[r, 9]),
                                "Teologia P": safe_int(df.iloc[r, 10]), "Teologia W": safe_int(df.iloc[r, 11])
                            })
                        for r in range(18, 21):
                            if str(df.iloc[r, 0]) == "nan": break
                            tenaga_data["ratio_gsm"].append({
                                "Tahun": str(df.iloc[r, 0]),
                                "Anak SM": safe_int(df.iloc[r, 1]),
                                "Guru SM": safe_int(df.iloc[r, 5]),
                                "Ratio": safe_float(df.iloc[r, 9])
                            })
                        for r in range(25, 28):
                            if str(df.iloc[r, 0]) == "nan": break
                            tenaga_data["rekap_aktivis"].append({
                                "Tahun": str(df.iloc[r, 0]),
                                "Total Jemaat": safe_int(df.iloc[r, 1]),
                                "Aktivis": safe_int(df.iloc[r, 5]),
                                "Pengurus": safe_int(df.iloc[r, 7]),
                                "Ratio": safe_float(df.iloc[r, 9])
                            })
                        parsed_data[sheet] = tenaga_data
                        yearly_data[sheet] = []
                    elif sheet == "Mutasi":
                        def safe_int(val):
                            try: return int(float(str(val).replace(',', '')))
                            except: return 0

                        mutasi_data = {
                            "years": [str(df.iloc[6, 1]), str(df.iloc[6, 2]), str(df.iloc[6, 3])],
                            "alasan_mutasi": [],
                            "pertambahan": [],
                            "pengurangan": [],
                            "hasil": [],
                            "keterangan": []
                        }
                        
                        for r in range(9, 18):
                            if str(df.iloc[r, 0]) != "nan":
                                mutasi_data["alasan_mutasi"].append({
                                    "Kategori": str(df.iloc[r, 0]),
                                    mutasi_data["years"][0]: safe_int(df.iloc[r, 1]),
                                    mutasi_data["years"][1]: safe_int(df.iloc[r, 2]),
                                    mutasi_data["years"][2]: safe_int(df.iloc[r, 3])
                                })
                        
                        for r in range(20, 30):
                            if str(df.iloc[r, 0]) != "nan":
                                mutasi_data["pertambahan"].append({
                                    "Kategori": str(df.iloc[r, 0]),
                                    mutasi_data["years"][0]: safe_int(df.iloc[r, 1]),
                                    mutasi_data["years"][1]: safe_int(df.iloc[r, 2]),
                                    mutasi_data["years"][2]: safe_int(df.iloc[r, 3])
                                })
                        
                        for r in range(32, 42):
                            if str(df.iloc[r, 0]) != "nan":
                                mutasi_data["pengurangan"].append({
                                    "Kategori": str(df.iloc[r, 0]),
                                    mutasi_data["years"][0]: safe_int(df.iloc[r, 1]),
                                    mutasi_data["years"][1]: safe_int(df.iloc[r, 2]),
                                    mutasi_data["years"][2]: safe_int(df.iloc[r, 3])
                                })
                        
                        for r in range(45, 53):
                            if str(df.iloc[r, 0]) != "nan":
                                mutasi_data["hasil"].append({
                                    "Kategori": str(df.iloc[r, 0]),
                                    mutasi_data["years"][0]: safe_int(df.iloc[r, 1]),
                                    mutasi_data["years"][1]: safe_int(df.iloc[r, 2]),
                                    mutasi_data["years"][2]: safe_int(df.iloc[r, 3])
                                })
                        
                        for r in range(7, 54):
                            try:
                                k = str(df.iloc[r, 4])
                                v = str(df.iloc[r, 5])
                                k_str = "" if k == "nan" else k.strip()
                                v_str = "" if v == "nan" else v.strip()
                                
                                if k_str or v_str:
                                    if not k_str and len(mutasi_data["keterangan"]) > 0:
                                        mutasi_data["keterangan"][-1]["value"] += " " + v_str
                                    else:
                                        mutasi_data["keterangan"].append({
                                            "key": k_str,
                                            "value": v_str
                                        })
                            except IndexError:
                                pass
                                
                        parsed_data[sheet] = mutasi_data
                        yearly_data[sheet] = []
                    else:
                        parsed_data[sheet] = clean_sheet_data(df, sheet)
                        yearly_data[sheet] = parse_yearly_data(df, sheet)
            else:
                parsed_data[sheet] = []
                yearly_data[sheet] = []
            
            parsed_data["church_name"] = church_name
            parsed_data["yearlyData"] = yearly_data
                
        # Clean up temp file
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception as e:
                print(f"Warning: Could not remove temp file: {e}")
            
        result = {
            "is_cached": False,
            "data": parsed_data,
            "success": True,
            "message": "Data fetched live successfully."
        }
        
        # Save to cache
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(result["data"], f, ensure_ascii=False, default=str)
            
        return result

    except Exception as e:
        print(f"Error fetching live data: {e}")
        # Fallback to cache
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                return {
                    "is_cached": True,
                    "data": cached_data,
                    "success": True,
                    "message": "Failed to fetch live data. Using cached data. You are viewing offline data."
                }
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Failed to fetch data and local cache is corrupted.")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to fetch data and no cache found: {str(e)}")

@app.get("/api/cache")
def get_cached_data():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
            return {
                "is_cached": True,
                "data": cached_data,
                "success": True,
                "message": "Loaded from cache."
            }
        except json.JSONDecodeError:
            return {"success": False, "message": "Cache file is corrupted."}
    return {"success": False, "message": "No cache found."}

# Mount static files to serve the React frontend
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
