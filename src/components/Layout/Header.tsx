import { Bell, Search, User } from 'lucide-react';
import { getBusinessProfile } from '../../store/store';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const business = getBusinessProfile();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="page-title">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800">
              {business?.businessName || 'Set Up Business'}
            </p>
            {business?.gstin && (
              <p className="text-xs text-gray-500">{business.gstin}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
