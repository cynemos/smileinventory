import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Clipboard, Calculator, Settings, Bluetooth as Tooth, HelpCircle, User } from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', icon: LayoutDashboard, href: '/' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Inventaire', icon: Package, href: '/inventory' },
  { name: 'Traitements', icon: Clipboard, href: '/treatments' },
  { name: 'Finance', icon: Calculator, href: '/finance' },
];

function Sidebar() {
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <Tooth className="h-8 w-8 text-primary-600" />
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">Smile.Inventory</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`
                }
              >
                <item.icon
                  className={({ isActive }) =>
                    `mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`
                  }
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto px-2 space-y-1">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`
              }
            >
              <User className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
              Profile
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`
              }
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
              Paramètres
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`
              }
            >
              <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
              À Propos
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
