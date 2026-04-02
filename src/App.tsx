import { useStore } from './store/useStore';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionsView } from './features/transactions/TransactionsView';
import { BudgetPlanningView } from './features/planning/BudgetPlanningView';

function App() {
  const { currentPage } = useStore();

  return (
    <AppLayout>
      {currentPage === 'dashboard' && <DashboardView />}
      {currentPage === 'tracking'  && <TransactionsView />}
      {currentPage === 'planning'  && <BudgetPlanningView />}
    </AppLayout>
  );
}

export default App;
