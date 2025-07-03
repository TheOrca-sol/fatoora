import { useAuth } from './AuthContext'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import Invoices from './pages/Invoices.jsx'
import ExportPage from './pages/Export.jsx'
import Team from './pages/Team.jsx'
import './App.css'
import { Home, Users, FileText, Download, Shield, LogOut, ChevronDown, Menu, X, Bell, Settings } from 'lucide-react';
import { Button } from './components/ui/button'
import { cn } from './lib/utils'
import { useState } from 'react'

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
        className="appearance-none bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
      >
        <option value="fr" className="text-gray-900">Français</option>
        <option value="en" className="text-gray-900">English</option>
        <option value="ar" className="text-gray-900">العربية</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-blue-600 font-medium">Loading your workspace...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SidebarNav({ isMobile, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  
  const nav = [
    { label: t('dashboard'), href: '/', icon: Home },
    { label: t('clients'), href: '/clients', icon: Users },
    { label: t('invoices'), href: '/invoices', icon: FileText },
    { label: t('export'), href: '/export', icon: Download },
    { label: t('team'), href: '/team', icon: Shield },
  ];

  return (
    <nav className="flex flex-col gap-2 px-4">
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={isMobile ? onClose : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-white text-blue-600 shadow-lg shadow-blue-600/20" 
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={20} className={cn(
              "transition-transform duration-200",
              isActive ? "text-blue-600" : "text-white/70 group-hover:text-white"
            )} />
            <span className="font-semibold">{item.label}</span>
            {isActive && (
              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col shadow-2xl z-50 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🧾</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Fatoora</span>
                <p className="text-blue-200 text-xs">Invoice Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-6">
          <SidebarNav isMobile={true} onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 space-y-4">
          <LanguageSwitcher />
          <Button 
            variant="destructive" 
            onClick={logout}
            className="w-full justify-start bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-400/30"
            size="sm"
          >
            <LogOut size={16} className="mr-2" />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={20} />
            </Button>
            <div className="hidden lg:block">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-semibold text-gray-900">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-full border-2 border-blue-200 shadow-sm" 
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-sm">
                  <div className="font-semibold text-gray-900">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();
  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/export" element={<ExportPage />} />
                    <Route path="/team" element={<Team />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App
