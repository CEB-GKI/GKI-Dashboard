import re

def process_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: '{old[:30]}...' not found in {filepath}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Dashboard.tsx
process_file('frontend/src/components/Dashboard.tsx', [
    (
        "<div ref={chartRef} style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>",
        '<FullscreenWrapper className="glass-panel" style={{ padding: \'0\', background: \'transparent\', marginBottom: \'24px\' }}>\n                <div ref={chartRef} style={{ background: \'var(--glass-bg)\', padding: \'16px\', borderRadius: \'12px\', height: \'100%\' }}>'
    ),
    (
        "            </div>\n\n            {chartKeys.length > 0 && (",
        "                </div>\n              </FullscreenWrapper>\n\n            {chartKeys.length > 0 && ("
    ),
    (
        "                  <>\n                    <div style={{ width: '100%', height: '400px', marginBottom: '24px' }}>",
        "                  <FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>\n                    <div style={{ width: '100%', height: '400px', marginBottom: '24px' }}>"
    ),
    (
        "                <div className=\"table-responsive-wrapper\" style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px' }}>",
        "                </FullscreenWrapper>\n\n                <div className=\"table-responsive-wrapper\" style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px' }}>"
    )
])

# 2. DiriDashboard.tsx
process_file('frontend/src/components/DiriDashboard.tsx', [
    (
        "<div className=\"glass-panel\" style={{ padding: '24px' }}>\n        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>\n          Grafik {tableOptions.find(o => o.id === activeTable)?.label.substring(3)}",
        "<FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px' }}>\n        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>\n          Grafik {tableOptions.find(o => o.id === activeTable)?.label.substring(3)}"
    ),
    (
        "          )}\n        </div>\n      </div>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>",
        "          )}\n        </div>\n      </FullscreenWrapper>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>"
    )
])

# 3. MutasiDashboard.tsx
process_file('frontend/src/components/MutasiDashboard.tsx', [
    (
        "      <div className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>\n        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Grafik {activeMenu === 'alasan' ? 'Alasan Mutasi' : activeMenu === 'pertambahan' ? 'Pertambahan Jemaat' : activeMenu === 'pengurangan' ? 'Pengurangan Jemaat' : 'Rekapitulasi Mutasi Tahunan'}</h3>\n        <div style={{ width: '100%', height: '500px' }}>",
        "      <FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>\n        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Grafik {activeMenu === 'alasan' ? 'Alasan Mutasi' : activeMenu === 'pertambahan' ? 'Pertambahan Jemaat' : activeMenu === 'pengurangan' ? 'Pengurangan Jemaat' : 'Rekapitulasi Mutasi Tahunan'}</h3>\n        <div style={{ width: '100%', height: '500px' }}>"
    ),
    (
        "          )}\n        </div>\n      </div>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>",
        "          )}\n        </div>\n      </FullscreenWrapper>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>"
    )
])

# 4. TenagaDashboard.tsx
process_file('frontend/src/components/TenagaDashboard.tsx', [
    (
        "      <div className=\"glass-panel\" style={{ padding: '24px' }}>\n        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>\n          Grafik {activeTab === 'rasio_penatua' ? 'Perbandingan Penatua dan Jemaat' : activeTab === 'rasio_gsm' ? 'Perbandingan GSM dan ASM' : 'Rekapitulasi Aktivis'}",
        "      <FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px' }}>\n        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>\n          Grafik {activeTab === 'rasio_penatua' ? 'Perbandingan Penatua dan Jemaat' : activeTab === 'rasio_gsm' ? 'Perbandingan GSM dan ASM' : 'Rekapitulasi Aktivis'}"
    ),
    (
        "          )}\n        </div>\n      </div>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>",
        "          )}\n        </div>\n      </FullscreenWrapper>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>"
    )
])

# 5. UangDashboard.tsx
process_file('frontend/src/components/UangDashboard.tsx', [
    (
        "        <div className=\"glass-panel\" style={{ padding: '24px', flex: '1', minWidth: '300px' }}>\n          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>1. Total Penerimaan (Kebaktian & Non-Kebaktian)</h3>\n          <ResponsiveContainer",
        "        <FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px', flex: '1', minWidth: '300px' }}>\n          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>1. Total Penerimaan (Kebaktian & Non-Kebaktian)</h3>\n          <ResponsiveContainer"
    ),
    (
        "            </PieChart>\n          </ResponsiveContainer>\n        </div>\n\n        <div className=\"glass-panel\" style={{ padding: '24px', flex: '2', minWidth: '600px' }}>",
        "            </PieChart>\n          </ResponsiveContainer>\n        </FullscreenWrapper>\n\n        <div className=\"glass-panel\" style={{ padding: '24px', flex: '2', minWidth: '600px' }}>"
    ),
    (
        "        <div className=\"glass-panel\" style={{ padding: '24px', flex: '2', minWidth: '600px' }}>\n          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>",
        "        <FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px', flex: '2', minWidth: '600px' }}>\n          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>"
    ),
    (
        "            </ComposedChart>\n          </ResponsiveContainer>\n        </div>\n      </div>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>",
        "            </ComposedChart>\n          </ResponsiveContainer>\n        </FullscreenWrapper>\n      </div>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>"
    ),
    (
        "      <div className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>",
        "      <FullscreenWrapper className=\"glass-panel\" style={{ padding: '24px', marginBottom: '24px' }}>\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>"
    ),
    (
        "          </ComposedChart>\n        </ResponsiveContainer>\n      </div>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>",
        "          </ComposedChart>\n        </ResponsiveContainer>\n      </FullscreenWrapper>\n\n      <div className=\"glass-panel\" style={{ padding: '24px', overflowX: 'auto' }}>"
    )
])

print("Dashboards modified!")
