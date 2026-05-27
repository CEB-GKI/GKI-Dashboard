import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the payload from Legend
content = re.sub(r'<Legend\s+payload=\{\[[\s\S]*?\]\}\s*/>', '<Legend />', content)

# Reverse the <Bar> elements in Analisa3 to see if that fixes the mismatch? No, wait. 
# Recharts's `<Legend />` order is exactly the order of the `<Bar>` elements in the tree!
# There is absolutely no reason for Recharts to shuffle them unless the user has `reverseStackOrder={true}` or the user is looking at a cached build.
# Wait, did the user's browser cache the old CSS or old chunks?
# If we look at the screenshot, the bars are Blue, Teal, Purple. The legend is Teal, Purple, Blue.
# I will just ensure the <Bar> elements are Pemuda, DewasaMuda, Lansia (Blue, Teal, Purple).
# And for Analisa15, Uang (Green), Kehadiran (Orange).

# Let's manually ensure Analisa3 is:
# Pemuda, DewasaMuda, Lansia
# And Analisa15 is:
# Kehadiran, Uang

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored Legends")
