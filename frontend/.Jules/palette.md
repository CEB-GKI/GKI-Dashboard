## 2024-05-18 - Missing ARIA Labels on Buttons with Icons
**Learning:** Found several buttons that contain only icons (or primarily serve an action) but lack proper 'aria-label' attributes. This makes them inaccessible to screen readers, which won't be able to describe the button's function to the user.
**Action:** When finding buttons like this, add an appropriate 'aria-label' attribute that concisely describes the action the button performs (e.g., 'Tarik Data', 'Reset Default Link', 'Unggah Lokal', dll.).

## 2024-05-18 - Missing ARIA Labels on Select Inputs
**Learning:** Select dropdowns used as filters do not have an 'aria-label' or an associated '<label>' tag. Screen readers need this context to tell the user what they are selecting.
**Action:** Always ensure that form inputs, especially '<select>' elements used for filtering, either have a visible '<label>' with 'htmlFor' or an 'aria-label' explaining their purpose.
