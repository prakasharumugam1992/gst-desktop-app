import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
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
      </Route>
    </Routes>
  );
}
