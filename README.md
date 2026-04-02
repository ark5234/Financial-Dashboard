# Finance Dashboard UI

A clean, interactive, and responsive finance dashboard built to track and understand financial activity. This project was developed to evaluate frontend development skills, emphasizing user interface design, state management, and component architecture.

## 🚀 Live Demo | Quick Start
To run this project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## ✨ Core Features

1. **Dashboard Overview**
   * **Summary Cards:** Dynamically calculates and displays Total Balance, Total Income, and Total Expenses.
   * **Spending Breakdown:** A categorical `PieChart` visualizing exactly where money is going.
   * **Balance Trend:** A time-based `AreaChart` illustrating the cumulative balance trend over time.
   * **Insights:** Automatic calculations of the highest spending category and recent income history.

2. **Transactions Management**
   * **List & Details:** View an ordered list of transactions including Date, Amount, Category, and Type (Income/Expense).
   * **CRUD Operations:** Easily add new transactions, edit existing ones, or delete them.
   * **Filtering & Search:** Real-time search by description/category, and dropdown filters to isolate Income vs. Expense.
   * **CSV Export:** One-click export of the currently filtered transactions to a `.csv` file.

3. **Role-Based Access Control (RBAC) UI**
   * Simulated frontend roles (`Admin` and `Viewer`) managed via global state.
   * **Viewer:** Read-only access to the dashboard and transaction data.
   * **Admin:** Full read/write access (can add, edit, and delete transactions).

4. **Robust State Management & Persistence**
   * Powered by **Zustand** for lightweight, scalable global state.
   * **Local Storage Persistence:** All transactions, selected roles, and themes are persisted across browser reloads using Zustand's `persist` middleware.

5. **Dark Mode & Responsive Design**
   * Full Tailwind CSS dark mode integration.
   * Fully responsive across mobile, tablet, and desktop screens.

## 🛠️ Tech Stack & Architecture

* **Framework:** React 18 (Vite)
* **Language:** TypeScript 
* **Styling:** Tailwind CSS (for rapid, utility-first styling and dark mode)
* **State Management:** Zustand (chosen for its simplicity and built-in local storage persistence capabilities over Context/Redux)
* **Charts:** Recharts (composable and highly responsive)
* **Icons:** Phosphor Icons
* **Dates:** date-fns (for reliable and lightweight date formatting)

## 📐 Why This Approach?
* **Why Zustand?** It provided the exact right level of complexity for this dashboard without the boilerplate of Redux, while natively handling LocalStorage persistence for the mock data.
* **Why Tailwind?** Allowed for incredibly fast iteration of the UI and seamless dark-mode implementation using the `dark:` variant.
* **Why Recharts?** Native React integration makes it simple to bind our dynamic Zustand state directly into beautiful, responsive SVG charts.
