# Implementation Plan - Monthly Returns Entry Page

Build a modern, fully responsive web application for managing monthly financial returns with dynamic receipt/payment entries, instant balance calculations, form validation, submit confirmation, and local storage persistence.

## User Review Required

> [!NOTE]
> The app will be created in `C:\Users\Unnati\.gemini\antigravity\scratch\monthly-returns-app`.
> It uses pure HTML5, modern CSS3 (with CSS variables, flexbox, grid, glassmorphism design system), and clean vanilla JavaScript ES6 (no external frameworks required).

## Proposed Architecture & Features

### 1. Design & Layout (`index.html`, `styles.css`)
- **Responsive Sidebar Navigation**: Collapsible sidebar with navigation items (Dashboard, Monthly Returns, Reports, Analytics, Settings), active highlight state, and mobile drawer toggle.
- **Top Header Bar**: Search bar, auto-save status indicator ("Draft auto-saved"), theme indicator, user profile avatar, and mobile menu hamburger button.
- **Financial Header & Overview Cards**:
  - Live summary stat cards for **Opening Balance**, **Total Receipts**, **Total Payments**, and **Closing Balance**.
  - Closing balance dynamically highlights in green (surplus) or rose/red (deficit).

### 2. Form & Dynamic Tables (`index.html`, `app.js`)
- **General Details Section**:
  - Reporting Month (Dropdown)
  - Financial Year (Dropdown)
  - Conference Name (Text Input)
  - Opening Balance (Number Input)
- **Dynamic Receipts Section**:
  - Dynamic table with columns: Income Head, Amount ($), Action (Delete).
  - Pre-filled with 3 sample rows.
  - `+ Add Income Head` button adding customized rows with suggestions.
  - Delete row buttons with instant recalculation.
- **Dynamic Payments Section**:
  - Dynamic table with columns: Expense Head, Amount ($), Action (Delete).
  - Pre-filled with 3 sample rows.
  - `+ Add Expense Head` button.
  - Delete row buttons with instant recalculation.

### 3. Financial Calculation Engine (`app.js`)
- Formula: `Closing Balance = Opening Balance + Total Receipts - Total Payments`
- Event listeners (`input`, `change`) trigger instant recalculations across all fields, table cells, and summary stat cards.

### 4. Real-time Validation & Submission (`app.js`)
- Tracks validity of required inputs and table rows.
- Displays inline validation feedback and clear status messages.
- Keeps the **Submit Return** button disabled until all criteria are satisfied.
- Handles submission without page refresh (`e.preventDefault()`).
- Shows an interactive success modal with return reference ID, detailed breakdown, and options to download/print or start a new return.

### 5. LocalStorage Persistence (`app.js`)
- Saves the entire form state (metadata + table rows) to `localStorage` on any user input.
- Automatically restores form data, table structure, and dynamic counts upon page reload.
- Provides a "Reset Form / Clear Draft" option.

## Proposed File Structure

- `monthly-returns-app/`
  - `index.html` — Semantic HTML5 markup with sidebar, header, form sections, dynamic tables, and modal dialogs.
  - `styles.css` — Modern design system with CSS custom properties, glassmorphism, animations, responsive grid/flexbox layouts.
  - `app.js` — ES6 modular JavaScript handling DOM manipulations, event delegation, dynamic row creation, live calculations, validation rules, modal toggles, and `localStorage` persistence.

## Verification Plan

### Automated & Sanity Checks
- Test HTML validity and structure.
- Verify browser execution with local static server (`npx http-server` or `npx vite` / `python -m http.server`).

### Manual Verification
1. **Dynamic Row Addition/Deletion**: Add new rows to Receipts and Payments tables, verify row count updates and deletion logic.
2. **Instant Calculation**: Change Opening Balance, Income Amounts, and Expense Amounts; verify Total Receipts, Total Payments, and Closing Balance update instantly.
3. **Form Validation**: Test empty required fields; verify Submit button remains disabled and error states appear. Complete form and verify Submit button unlocks.
4. **Submission**: Click Submit, verify success modal appears without page reload.
5. **LocalStorage Persistence**: Fill out form data, reload the page, and confirm all inputs and rows are restored.
