import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './layouts/AppLayout';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
const ContactsPage = lazy(() =>
  import('./pages/ContactsPage').then((module) => ({
    default: module.ContactsPage,
  })),
);
const ContactDetailsPage = lazy(() =>
  import('./pages/ContactDetailsPage').then((module) => ({
    default: module.ContactDetailsPage,
  })),
);
const LoansPage = lazy(() =>
  import('./pages/LoansPage').then((module) => ({
    default: module.LoansPage,
  })),
);
const LoanDetailsPage = lazy(() =>
  import('./pages/LoanDetailsPage').then((module) => ({
    default: module.LoanDetailsPage,
  })),
);
const PaymentsPage = lazy(() =>
  import('./pages/PaymentsPage').then((module) => ({
    default: module.PaymentsPage,
  })),
);
const MonthlyCashFlowPage = lazy(() =>
  import('./pages/MonthlyCashFlowPage').then((module) => ({
    default: module.MonthlyCashFlowPage,
  })),
);

function App() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#f6f8f7] dark:bg-[#0b100e]"
          aria-label="Loading page"
        />
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:contactId" element={<ContactDetailsPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/:loanId" element={<LoanDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="cash-flow" element={<MonthlyCashFlowPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
