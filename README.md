# TradeFi — Trade Finance Frontend Dashboard

A professional, production-ready trade finance dashboard built with vanilla HTML, CSS, and JavaScript — no frameworks required.

## 🚀 Quick Start

Open `index.html` in any modern browser. You'll be redirected to the login page automatically.

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

## 📁 File Structure

```
trade_fi_frontend/
├── index.html          # Entry point (redirects based on auth)
├── login.html          # Authentication page
├── dashboard.html      # Main dashboard with metrics & recent transactions
├── operations.html     # International transfer management
├── credits.html        # Credit/loan management with amortization
├── documents.html      # Document upload & management
├── reports.html        # Reports, analytics & transaction history
├── settings.html       # User profile, company, API keys & security
├── assets/
│   ├── css/
│   │   ├── style.css       # Main styles, layout, design system
│   │   ├── components.css  # Component library (buttons, forms, tables, modals...)
│   │   └── responsive.css  # Media queries for mobile/tablet/desktop
│   └── js/
│       ├── mock-data.js    # Mock data module (window.MockData)
│       ├── calculator.js   # FX, fee & amortization calculator (window.Calculator)
│       ├── forms.js        # Form validation & state helpers (window.Forms)
│       ├── ui.js           # UI utilities: toasts, modals, tables (window.UI)
│       └── main.js         # App initialization & page-specific logic
└── .gitignore
```

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#191C46` (dark navy) |
| Accent | `#D05C46` (coral) |
| Text | `#191C46` |
| Light text | `#5C5C73` |
| Background | `#FFFFFF` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#3B82F6` |
| Font | Outfit (Google Fonts) |

## ✨ Features

### Pages
- **Dashboard** — KPI metric cards, recent transactions, quick action shortcuts
- **Operations** — Create & track international wire/ACH transfers with fee calculator, detail modal
- **Credits** — Apply for trade finance credit, amortization schedule table, payment tracking
- **Documents** — Drag & drop file upload, type/status filtering, delete with confirmation
- **Reports** — Transaction history with pagination, date/status filters, summary statistics
- **Settings** — Profile editing, company data, API key management, notification toggles, password change

### Technical
- **Authentication** — `localStorage`-based session with redirect guard on all protected pages
- **Responsive** — Fully responsive: mobile sidebar drawer, collapsible desktop sidebar
- **Modals** — Close on backdrop click, X button, and `data-modal-close` attributes
- **Toast Notifications** — 4 types (success, error, warning, info), auto-dismiss after 4s
- **Form Validation** — Inline error messages with field highlighting
- **FX Calculator** — Live exchange rate calculation using mock rates
- **Amortization** — Full schedule generator with monthly breakdown

## 🛠️ Architecture

All JavaScript is organized into module objects attached to `window`:

- `window.MockData` — Static mock data (users, operations, credits, documents, transactions)
- `window.Calculator` — Financial calculations (FX, fees, amortization, currency formatting)
- `window.Forms` — Form utilities (validation, loading states, error display)
- `window.UI` — UI utilities (toasts, modals, table rendering, pagination, confirm dialogs)

Page-specific logic lives in `main.js`, dispatched by pathname.

## 📱 Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| `< 480px` | Brand name hidden, compact buttons |
| `< 768px` | Sidebar becomes off-canvas drawer |
| `768–1024px` | Sidebar narrows to 220px, 2-column grids |
| `> 1024px` | Full 260px sidebar, 4-column grids |
| `> 1440px` | Extra padding, full grid columns |

## 🔧 Customization

CSS custom properties are defined in `style.css` `:root`. Change colors, spacing, and shadow variables there to restyle the entire app.

## 📖 Documentation

For a deep-dive into the architecture, design decisions, data structures, and step-by-step guides for making changes, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

It covers:
- Why each file exists and what it's responsible for
- The data flow from mock data to rendered UI
- JSDoc for every public function
- How to add a new page, connect a real API, change the design, and more

