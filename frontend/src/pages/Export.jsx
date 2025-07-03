import { useTranslation } from 'react-i18next';
import { Download, FileText, Archive, FileSpreadsheet, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useEffect, useState } from 'react';
import { api } from '../api';

function ExportCard({ title, description, icon: Icon, type, color = "blue" }) {
  const { t } = useTranslation();
  
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/export/invoices/${type}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('jwt')}` 
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices.${type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export ${type.toUpperCase()} file. Please try again.`);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 group">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className={`w-20 h-20 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-10 w-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>
          
          <Button
            onClick={handleDownload}
            className={`w-full bg-gradient-to-r ${colorClasses[color]} shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-3`}
          >
            <Download className="h-5 w-5 mr-2" />
            {t('download')} {type.toUpperCase()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, icon: Icon, color = "text-blue-600", loading = false }) {
  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md" />
            </div>
            <div className="p-3 bg-gray-50 rounded-full">
              <div className="h-6 w-6 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-full">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Export() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    thisMonth: 0,
    exportReady: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [summary, invoices] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/invoices/')
        ]);
        
        // Calculate this month's invoices
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthInvoices = invoices.filter(invoice => {
          const invoiceDate = new Date(invoice.created_at);
          return invoiceDate.getMonth() === currentMonth && 
                 invoiceDate.getFullYear() === currentYear;
        }).length;
        
        setStats({
          totalInvoices: summary.total_invoices || 0,
          thisMonth: thisMonthInvoices,
          exportReady: summary.total_invoices > 0 ? 100 : 0
        });
      } catch (error) {
        console.error('Failed to fetch export stats:', error);
        // Fallback to zeros if API fails
        setStats({
          totalInvoices: 0,
          thisMonth: 0,
          exportReady: 0
        });
      }
      setLoading(false);
    };
    
    fetchStats();
  }, []);
  
  const exportOptions = [
    {
      title: "CSV Export",
      description: "Download all invoice data in a spreadsheet-friendly CSV format. Perfect for data analysis and reporting.",
      icon: FileSpreadsheet,
      type: "csv",
      color: "green"
    },
    {
      title: "PDF Archive",
      description: "Get a ZIP file containing all your invoices as individual PDF files. Great for record keeping and sharing.",
      icon: Archive,
      type: "zip",
      color: "purple"
    }
  ];

  return (
    <div className="space-y-8 py-6 px-4 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-4">
          <Download className="h-10 w-10 text-blue-600" />
          {t('export')} & Backup
        </h1>
        <p className="text-lg text-gray-600">
          Export your invoice data in various formats for backup, analysis, or integration with other systems.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices.toLocaleString()}
          icon={FileText}
          color="text-blue-600"
          loading={loading}
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth.toLocaleString()}
          icon={Calendar}
          color="text-green-600"
          loading={loading}
        />
        <StatCard
          title="Export Ready"
          value={`${stats.exportReady}%`}
          icon={TrendingUp}
          color="text-purple-600"
          loading={loading}
        />
      </div>

      {/* Export Options */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Export Format</h2>
          <p className="text-gray-600">Select the format that best suits your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exportOptions.map((option) => (
            <ExportCard
              key={option.type}
              {...option}
            />
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Export Information</h3>
            <p className="text-gray-600">Important details about your data exports</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                CSV Export Includes:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 ml-7">
                <li>• Invoice numbers and dates</li>
                <li>• Client information</li>
                <li>• Amounts and currency</li>
                <li>• Payment status</li>
                <li>• Due dates</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Archive className="h-5 w-5 text-purple-600" />
                PDF Archive Contains:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 ml-7">
                <li>• Individual PDF invoices</li>
                <li>• Professional formatting</li>
                <li>• Company branding</li>
                <li>• Complete invoice details</li>
                <li>• Ready for sharing</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-500 rounded-full mt-1">
                <span className="block w-2 h-2 bg-white rounded-full"></span>
              </div>
              <div>
                <p className="text-blue-900 font-medium text-sm">Privacy & Security</p>
                <p className="text-blue-800 text-sm mt-1">
                  All exports are generated securely and contain only your business data. 
                  Files are not stored on our servers after download.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Export; 