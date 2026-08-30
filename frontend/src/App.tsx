import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './auth/useAuth';
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
  import('./pages/LoanDetailsPageNew').then((module) => ({
    default: module.LoanDetailsPage,
  })),
);
const MonthlyCashFlowPage = lazy(() =>
  import('./pages/MonthlyCashFlowPage').then((module) => ({
    default: module.MonthlyCashFlowPage,
  })),
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })),
);

function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div
        className="min-h-screen bg-[#f6f8f7] dark:bg-[#0b100e]"
        aria-label="Restoring session"
      />
    );
  return user ? <AppLayout /> : <Navigate to="/login" replace />;
}

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
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:contactId" element={<ContactDetailsPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/:loanId" element={<LoanDetailsPage />} />
          <Route path="payments" element={<Navigate to="/loans" replace />} />
          <Route path="cash-flow" element={<MonthlyCashFlowPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
