import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionsView } from './features/transactions/TransactionsView';

function App() {
  return (
    <AppLayout>
      <div className="space-y-12">
        <DashboardView />
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8" />
        <TransactionsView />
      </div>
    </AppLayout>
  );
}

export default App;
