## 2024-05-19 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found several icon-only buttons (like the trash icon for history deletion and 'Reset Default Link', or modal close buttons like '✕' and 'Minimize2') that lacked `aria-label` attributes. Screen reader users would just hear "button" without context of what the button does.
**Action:** Ensure all `<button>` elements containing only an icon or symbol receive an explicit `aria-label` attribute describing their function. This is critical for basic accessibility compliance.
