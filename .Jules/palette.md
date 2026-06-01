## 2024-05-19 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found several icon-only buttons (like the trash icon for history deletion and 'Reset Default Link', or modal close buttons like '✕' and 'Minimize2') that lacked `aria-label` attributes. Screen reader users would just hear "button" without context of what the button does.
**Action:** Ensure all `<button>` elements containing only an icon or symbol receive an explicit `aria-label` attribute describing their function. This is critical for basic accessibility compliance.
## 2024-06-01 - Global Focus Styles & Icon Buttons
**Learning:** Added global `:focus-visible` to base elements (buttons, links, inputs) in index.css as it's cleaner than adding classes to every interactive element. Found another icon-only button (×) in MutasiDashboard lacking an aria-label.
**Action:** Ensure global focus states cover all interactive elements via CSS reset, and continue auditing modals/toasts for missing close button aria-labels.
