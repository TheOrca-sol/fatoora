import { useEffect, useState } from 'react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Download, Trash2, DollarSign, Calendar, User, MoreVertical, Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

function StatusBadge({ status }) {
  const { t } = useTranslation();
  
  const statusConfig = {
    paid: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✓',
      label: t('paid')
    },
    unpaid: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '○',
      label: t('unpaid')
    },
    overdue: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '!',
      label: t('overdue')
    }
  };

  const config = statusConfig[status] || statusConfig.unpaid;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}

function InvoiceCard({ invoice, client, onDelete, onStatusChange, onDownload }) {
  const { t } = useTranslation();
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              #{invoice.number}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Invoice #{invoice.number}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <User className="h-4 w-4" />
                {client ? client.name : 'Unknown Client'}
              </div>
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">{invoice.amount} {invoice.currency}</span>
          </div>
          {invoice.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Due:</span>
              <span className="font-semibold text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={invoice.status === 'paid' ? 'outline' : 'default'}
              onClick={() => onStatusChange(invoice.id, invoice.status === 'paid' ? 'unpaid' : 'paid')}
              className="text-xs"
            >
              {t('mark_as')} {t(invoice.status === 'paid' ? 'unpaid' : 'paid')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(invoice.id)}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(invoice.id)}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Invoices() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ client_id: '', amount: '', due_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inv, cli] = await Promise.all([
        api.get('/invoices/'),
        api.get('/clients/'),
      ]);
      setInvoices(inv);
      setClients(cli);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/invoices/', {
        ...form,
        amount: parseFloat(form.amount),
        currency: 'MAD',
      });
      setForm({ client_id: '', amount: '', due_date: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      if (!res.ok) {
        alert('Failed to download PDF');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filterStatus);

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    unpaid: invoices.filter(inv => inv.status === 'unpaid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
  };

  return (
    <div className="space-y-8 py-6 px-4 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="h-10 w-10 text-blue-600" />
            {t('invoices')}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Create, manage, and track your invoices
          </p>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('add')} {t('invoice')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.unpaid}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Invoice Form */}
      {showForm && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-3">
              <Plus className="h-6 w-6" />
              Create New Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('client')} *
                  </label>
                  <select
                    name="client_id"
                    value={form.client_id}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  >
                    <option value="">Select a client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('amount')} (MAD) *
                  </label>
                  <input
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('due_date')}
                  </label>
                  <input
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    type="date"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 shadow-lg"
                >
                  {submitting ? 'Creating...' : `${t('add')} ${t('invoice')}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-full">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'paid', 'unpaid', 'overdue'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            className="capitalize"
          >
            {status === 'all' ? 'All Invoices' : t(status)}
            {status !== 'all' && (
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                {stats[status]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? 'Start by creating your first invoice to track your business revenue.'
                  : `No ${filterStatus} invoices at the moment.`
                }
              </p>
              {filterStatus === 'all' && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInvoices.map((invoice) => {
                const client = clients.find((c) => c.id === invoice.client_id);
                return (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    client={client}
                    onDelete={handleDelete}
                    onStatusChange={handleStatus}
                    onDownload={handleDownload}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Invoices; 