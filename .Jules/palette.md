## 2024-05-19 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found several icon-only buttons (like the trash icon for history deletion and 'Reset Default Link', or modal close buttons like '✕' and 'Minimize2') that lacked `aria-label` attributes. Screen reader users would just hear "button" without context of what the button does.
**Action:** Ensure all `<button>` elements containing only an icon or symbol receive an explicit `aria-label` attribute describing their function. This is critical for basic accessibility compliance.
## 2024-06-01 - Global Focus Styles & Icon Buttons
**Learning:** Added global `:focus-visible` to base elements (buttons, links, inputs) in index.css as it's cleaner than adding classes to every interactive element. Found another icon-only button (×) in MutasiDashboard lacking an aria-label.
**Action:** Ensure global focus states cover all interactive elements via CSS reset, and continue auditing modals/toasts for missing close button aria-labels.

## 2024-06-03 - Loading States on Async Buttons
**Learning:** Found that secondary async actions like 'Unggah Lokal' lacked loading indicators, creating an inconsistent experience since 'Tarik Data' had one. Missing loading states on file processing can make users think the app is unresponsive.
**Action:** Add visual loading feedback (like a spinning icon) to all buttons that trigger asynchronous operations, especially those involving file parsing or network requests.

## 2026-06-03 - Structural Headers as Labels
**Learning:** Found an accessibility issue where a visually functional 'label' (Sumber Data) was marked up as a structural header (`<h3>`), leaving the adjacent input field detached from its descriptive text for screen readers. Using `aria-current="page"` on active sidebar links provides clear semantic context of the current state.
**Action:** Convert structural headers to functional `<label>` elements with `htmlFor` when they are intended to caption an input, and consistently apply `aria-current="page"` to active navigation items.
## 2024-05-18 - [Forms for Keyboard Submission]
**Learning:** Wrapping input and button in a form element enables native "Enter" key submission, significantly improving keyboard accessibility and general UX. Must remember to add `type="button"` to secondary buttons in the form to prevent accidental submission.
**Action:** Always evaluate if an input and button pairing should be a form.
## 2024-06-09 - Consistency in Localization for Prompts
**Learning:** Adding confirmation dialogs is a good micro-UX improvement to prevent data loss. However, it's crucial to match the language of the application's UI strings. While the target application uses mixed Indonesian, automated reviewers may expect standard English if surrounding attributes (like ARIA labels) are in English.
**Action:** When adding standard native dialogs like `window.confirm`, verify the surrounding localization context. Default to English if the specific UI strings interacting with it (like aria-labels) are also in English to ensure consistency.
