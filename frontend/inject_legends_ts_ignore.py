import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

def process_chart(match):
    chart_block = match.group(0)
    
    if "<Legend />" not in chart_block and "<Legend" not in chart_block:
        return chart_block
        
    elements = re.findall(r"<(Bar|Line|Area)\s+([^>]+)/>", chart_block)
    
    payload_items = []
    for el_type, attrs in elements:
        name_match = re.search(r'name=(?:\{`([^`]+)`\}|"([^"]+)")', attrs)
        name = ""
        if name_match:
            name = name_match.group(1) or name_match.group(2)
        else:
            dk_match = re.search(r'dataKey="([^"]+)"', attrs)
            if dk_match:
                name = dk_match.group(1)
                
        color_match = re.search(r'(?:fill|stroke)=\{([^}]+)\}', attrs)
        color = "COLORS.blue"
        if color_match:
            color = color_match.group(1)
            
        p_type = "'rect'" if el_type == 'Bar' else "'line'"
        
        payload_items.append(f"{{ value: `{name}`, type: {p_type}, id: `{name}`, color: {color} }}")
        
    if payload_items:
        payload_str = "payload={[\n            " + ",\n            ".join(payload_items) + "\n          ]}"
        # Add @ts-ignore
        new_legend = f"{{/* @ts-ignore */}}\n          <Legend {payload_str} />"
        chart_block = re.sub(r"<Legend\s*/>", new_legend, chart_block)
        
    return chart_block

new_content = re.sub(r"<ResponsiveContainer.*?</ResponsiveContainer>", process_chart, content, flags=re.DOTALL)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Legend payloads injected with @ts-ignore.")
