import { useEffect, useState } from 'react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Users, FileText, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function StatCard({ title, value, icon: Icon, trend, color = "text-primary", bgGradient = "from-blue-50 to-blue-100" }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50`}></div>
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {trend !== null && trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : trend < 0 ? (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-gray-400" />
            )}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend === 0 ? '0%' : `${Math.abs(trend).toFixed(1)}%`}
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-md" />
        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mb-2" />
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

function MonthlyRevenueTable({ data, loading }) {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
            <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  const monthNames = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December'
  };

  return (
    <div className="space-y-2">
      {Object.entries(data).length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Revenue Data</h3>
          <p className="text-gray-500">{t('no_data') || 'No revenue data available for this year'}</p>
        </div>
      ) : (
        Object.entries(data).map(([month, revenue]) => (
          <div key={month} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {month}
              </div>
              <span className="font-semibold text-gray-900">
                {monthNames[parseInt(month)] || `Month ${month}`}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {parseFloat(revenue).toLocaleString()} 
              </div>
              <div className="text-sm text-gray-500 font-medium">MAD</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Helper function to calculate trends
function calculateTrend(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Helper function to get month data from invoices
function getMonthlyData(invoices, targetMonth, targetYear) {
  return invoices.filter(invoice => {
    const date = new Date(invoice.created_at);
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
  });
}

function Dashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState({});
  const [allInvoices, setAllInvoices] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sum, mon, invoices] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/monthly-revenue'),
          api.get('/invoices/'),
        ]);
        setSummary(sum);
        setMonthly(mon);
        setAllInvoices(invoices);
        
        // Calculate trends
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // Current month data
        const currentMonthInvoices = getMonthlyData(invoices, currentMonth, currentYear);
        const lastMonthInvoices = getMonthlyData(invoices, lastMonth, lastMonthYear);
        
        // Calculate metrics for both months
        const currentMetrics = {
          total: currentMonthInvoices.length,
          paid: currentMonthInvoices.filter(i => i.status === 'paid').length,
          unpaid: currentMonthInvoices.filter(i => i.status === 'unpaid').length,
          overdue: currentMonthInvoices.filter(i => i.status === 'overdue').length,
          revenue: currentMonthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
        };
        
        const lastMetrics = {
          total: lastMonthInvoices.length,
          paid: lastMonthInvoices.filter(i => i.status === 'paid').length,
          unpaid: lastMonthInvoices.filter(i => i.status === 'unpaid').length,
          overdue: lastMonthInvoices.filter(i => i.status === 'overdue').length,
          revenue: lastMonthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
        };
        
        // Calculate trends
        setTrends({
          total_invoices: calculateTrend(currentMetrics.total, lastMetrics.total),
          total_revenue: calculateTrend(currentMetrics.revenue, lastMetrics.revenue),
          paid: calculateTrend(currentMetrics.paid, lastMetrics.paid),
          unpaid: calculateTrend(currentMetrics.unpaid, lastMetrics.unpaid),
          overdue: calculateTrend(currentMetrics.overdue, lastMetrics.overdue)
        });
        
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: t('total_invoices') || 'Total Invoices',
      value: summary?.total_invoices ?? '-',
      trend: trends.total_invoices,
      icon: FileText,
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      title: t('total_revenue') || 'Total Revenue',
      value: summary ? `${summary.total_revenue.toLocaleString()}` : '-',
      trend: trends.total_revenue,
      icon: DollarSign,
      color: "text-green-600",
      bgGradient: "from-green-50 to-green-100"
    },
    {
      title: t('paid') || 'Paid',
      value: summary?.paid ?? '-',
      trend: trends.paid,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100"
    },
    {
      title: t('unpaid') || 'Unpaid',
      value: summary?.unpaid ?? '-',
      trend: trends.unpaid,
      icon: XCircle,
      color: "text-amber-600",
      bgGradient: "from-amber-50 to-amber-100"
    },
    {
      title: t('overdue') || 'Overdue',
      value: summary?.overdue ?? '-',
      trend: trends.overdue,
      icon: AlertCircle,
      color: "text-red-600",
      bgGradient: "from-red-50 to-red-100"
    },
  ];

  return (
    <div className="space-y-8 py-6 px-4 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('dashboard')}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome back! Here's an overview of your business performance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live updates
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-full">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
      </div>

      {/* Monthly Revenue */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            {t('monthly_revenue') || 'Monthly Revenue'}
          </CardTitle>
          <p className="text-blue-100 mt-2">Track your revenue growth month by month</p>
        </CardHeader>
        <CardContent className="p-6">
          <MonthlyRevenueTable data={monthly} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard; 