import { useEffect, useState } from 'react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Trash2, Phone, Building, Hash, Search, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

function SkeletonRow() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function ClientCard({ client, onDelete }) {
  const { t } = useTranslation();
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
              <div className="flex flex-col gap-1 mt-1">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
                {client.ice && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    ICE: {client.ice}
                  </div>
                )}
                {client.if_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    IF: {client.if_number}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(client.id)}
            className="hover:bg-red-600 shadow-md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', ice: '', if_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await api.get('/clients/');
      setClients(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/clients/', form);
      setForm({ name: '', phone: '', ice: '', if_number: '' });
      setShowForm(false);
      fetchClients();
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.includes(searchQuery)) ||
    (client.ice && client.ice.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 py-6 px-4 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="h-10 w-10 text-blue-600" />
            {t('clients')}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your client relationships and contact information
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm"
            />
          </div>
          
          {/* Add Client Button */}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {t('add')} {t('client') || t('name')}
          </Button>
        </div>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-3">
              <Plus className="h-6 w-6" />
              Add New Client
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('name')} *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    required
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('phone')}
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('ice')}
                  </label>
                  <input
                    name="ice"
                    value={form.ice}
                    onChange={handleChange}
                    placeholder="ICE number"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('if')}
                  </label>
                  <input
                    name="if_number"
                    value={form.if_number}
                    onChange={handleChange}
                    placeholder="IF number"
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
                  {submitting ? 'Adding...' : `${t('add')} ${t('client') || t('name')}`}
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

      {/* Clients List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filteredClients.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No clients match "${searchQuery}". Try a different search term.`
                  : 'Start by adding your first client to begin managing your business relationships.'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Clients; 