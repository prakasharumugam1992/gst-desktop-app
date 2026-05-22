import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ShoppingCart,
  FileBarChart,
  Receipt,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/business', icon: Building2, label: 'Business Profile' },
  { to: '/parties', icon: Users, label: 'Parties' },
  { to: '/invoices/sales', icon: FileText, label: 'Sales Invoices' },
  { to: '/invoices/purchase', icon: ShoppingCart, label: 'Purchase Invoices' },
  { to: '/returns', icon: Receipt, label: 'GST Returns' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      className={`bg-gradient-to-b from-primary-900 to-primary-800 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-primary-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Receipt className="w-8 h-8 text-primary-300" />
            <div>
              <h1 className="text-lg font-bold">GST Filing</h1>
              <p className="text-xs text-primary-300">Desktop App</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={item.label}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`p-4 border-t border-primary-700 space-y-3 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed && user && (
          <p className="text-xs text-primary-300 truncate">{user.name}</p>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors ${
            collapsed ? 'justify-center w-full' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
