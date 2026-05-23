import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import BusinessProfile from './components/Business/BusinessProfile';
import PartyList from './components/Parties/PartyList';
import PartyForm from './components/Parties/PartyForm';
import InvoiceList from './components/Invoices/InvoiceList';
import InvoiceForm from './components/Invoices/InvoiceForm';
import InvoiceView from './components/Invoices/InvoiceView';
import GSTReturns from './components/Returns/GSTReturns';
import Reports from './components/Reports/Reports';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import QuickBilling from './components/Billing/QuickBilling';
import BillHistory from './components/Billing/BillHistory';
import IndustrySettingsPage from './components/Billing/IndustrySettings';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="business" element={<BusinessProfile />} />
        <Route path="parties" element={<PartyList />} />
        <Route path="parties/new" element={<PartyForm />} />
        <Route path="parties/edit/:id" element={<PartyForm />} />
        <Route path="invoices/:type" element={<InvoiceList />} />
        <Route path="invoices/:type/new" element={<InvoiceForm />} />
        <Route path="invoices/:type/view/:id" element={<InvoiceView />} />
        <Route path="returns" element={<GSTReturns />} />
        <Route path="reports" element={<Reports />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="billing" element={<QuickBilling />} />
        <Route path="bill-history" element={<BillHistory />} />
        <Route path="industry-settings" element={<IndustrySettingsPage />} />
      </Route>
    </Routes>
  );
}
