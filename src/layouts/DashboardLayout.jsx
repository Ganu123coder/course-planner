import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  PlusCircle,
  History,
  Calendar
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'trainer' 
    ? [
        { name: 'Dashboard', path: '/trainer', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Create Course', path: '/trainer/courses/new', icon: <PlusCircle className="w-5 h-5" /> },
      ]
    : [
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'All Courses', path: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'My Attendance', path: '/student/attendance', icon: <History className="w-5 h-5" /> },
    { name: 'Day Planner', path: '/student/day-planner', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">IT Techie</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Management System</p>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-8"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-bold">{user?.name}</span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700 capitalize">
                {user?.role}
              </span>
            </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;