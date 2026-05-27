import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Find all blocks of Recharts components
charts = re.findall(r"<(?:Line|Bar|Area|Composed)Chart.*?>.*?</(?:Line|Bar|Area|Composed)Chart>", content, re.DOTALL)
for i, chart in enumerate(charts):
    print(f"\n--- Chart {i+1} ---")
    items = re.findall(r"<(?:Line|Bar|Area) .*?/>", chart)
    for item in items:
        print(item)
