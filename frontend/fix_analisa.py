import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Analisa15
# Replace `y.match(/\\d{4}\\s*-\\s*(\\d{4})/);` with `y.match(/\d{4}\s*-\s*(\d{4})/);`
content = content.replace("y.match(/\\\\d{4}\\\\s*-\\\\s*(\\\\d{4})/);", r"y.match(/\d{4}\s*-\s*(\d{4})/);")

# Delete Analisa6
content = re.sub(r"  const analisa6 = useMemo\(\(\) => \{.*?(?=  const analisa7 = useMemo)", "", content, flags=re.DOTALL)

# Update allModules array
content = content.replace("const allModules = [analisa2, analisa3, analisa4, analisa6, analisa7, analisa8, analisa10, analisa12, analisa13, analisa15, analisa18]", "const allModules = [analisa2, analisa3, analisa4, analisa7, analisa8, analisa10, analisa12, analisa13, analisa15, analisa18]")

# Re-order the `<Bar>` and `<Line>` elements to explicitly match what should be the logical display order.
# Actually, the user says "legenda sumbu X juga berurutan dengan penampilan data tersebut di chart."
# In Recharts, if the legend is rendering out of order, it might be due to `reverseStackOrder` or something?
# I'll just leave the Bar order as is, but wait! What if I add `wrapperStyle={{ display: 'flex', flexDirection: 'row' }}` to `<Legend>`?
# Let's replace `<Legend />` with `<Legend wrapperStyle={{ display: 'flex', justifyContent: 'center', gap: '20px' }} />`?
# No, Recharts Legend uses an unordered list (ul). Let's see if we can just explicitly order them.

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixes applied.")
