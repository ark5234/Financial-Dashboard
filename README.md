# Finance Dashboard UI

A premium, interactive, and responsive finance dashboard engineered to track financial activity, maintain budgets, and visualize spending. Originally developed as a frontend evaluation, it has evolved into a production-grade portfolio piece and a usable local-first personal finance app.

## 🚀 Live Demo | Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## 💼 Why "Admin" vs "Viewer" Roles?

In the context of a portfolio piece, the role system serves a dual purpose:
1. **Viewer (Demo Mode):** When recruiters or visitors land on the site, they are "Viewers" by default. They can explore the UI, interact with responsive charts, filter tables, and toggle themes. This provides a safe, curated experience of the dashboard without them accidentally deleting the mock data that fuels the visualizations.
2. **Admin (Personal Use / Full Test):** Switching to "Admin" unlocks the full CRUD (Create, Read, Update, Delete) capabilities. Reviewers can test the form validation and notification systems. Furthermore, because all data is securely persisted in your browser's `localStorage`, you can actually use this site in "Admin" mode as your own private, daily budget tracker without needing a backend database.

## ✨ Core Features & Roadmap

Inspired by comprehensive spreadsheet budgeting, this dashboard brings structured financial planning to the web.

1. **Dashboard Analytics (Spreadsheet-Level Insights)**
   * **Summary Metrics:** Real-time calculation of Total Balance, Income, and Expenses based on global currency state.
   * **Spending Breakdown:** A categorical `PieChart` mapping exact standard categories (Housing, Utilities, etc.) to specific color palettes.
   * **Month-over-Month Comparison:** Tracking financial flow over time to spot trends.
   * **Insights Engine:** Identifies highest spending categories, savings rates, and tracks performance against hypothetical budgets.

2. **Transaction Tracking (The Ledger)**
   * **Detailed Ledger:** View an ordered list of transactions including Date, Amount, Category, and Type.
   * **CRUD Operations (Admin Only):** Easily add, edit, or delete transactions. Deletions trigger global Toast notifications.
   * **Smart Formatting:** Global currency switching (USD, EUR, GBP, JPY, INR) via the `Intl.NumberFormat` API.
   * **CSV Export:** One-click export of data to `.csv` for external spreadsheet analysis.

3. **Premium UX / UI**
   * **Dark Mode & Responsive Design:** Full Tailwind CSS dark mode integration (`bg-slate-900`) and a responsive sidebar layout.
   * **Toast Notification System:** Custom-built, strict-typed floating notifications for user feedback.
   * **Role-Based Access Control:** Smooth simulated frontend role switching.

## 🛠️ Tech Stack & Architecture

* **Framework:** React 18 (Vite)
* **Language:** TypeScript (`verbatimModuleSyntax` strict mode enabled)
* **Styling:** Tailwind CSS
* **State Management:** Zustand (with LocalStorage persistence)
* **Charts:** Recharts 
* **Icons:** `@phosphor-icons/react`

## 📐 Architecture Highlights
* **Zustand Persistence:** Stores a complex global payload (Role, Theme, Currency, Toasts, and an 18-record mock dataset spanning 4 months) entirely natively in the browser. 
* **Centralized Configuration:** Strict mapping utilities for Categories, Icons, and Colors (`CATEGORY_CONFIG`) ensure the UI remains perfectly in sync between forms, tables, and charts.
* **Zero-Dependency UI Logic:** Built custom Toast notification and layout systems to demonstrate deep React knowledge without relying on heavy external component libraries.
