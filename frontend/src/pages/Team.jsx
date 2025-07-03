import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';

function Team() {
  const { t } = useTranslation();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInput = useRef();

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await api.get('/teams/me');
      setTeam(data);
      setNewName(data.name);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/teams/invite', { email: inviteEmail });
      setInviteEmail('');
      fetchTeam();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (user_id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await api.post('/teams/remove', { user_id });
      fetchTeam();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/teams/update', { name: newName });
      fetchTeam();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      await fetch('/api/teams/logo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
        body: formData,
      });
      fetchTeam();
    } catch (err) {
      setError(t('upload_logo') + ' ' + t('failed'));
    }
    setLogoUploading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{t('team')}</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>{t('loading')}</div>
      ) : team ? (
        <>
          <div className="mb-4 flex items-center gap-4">
            {team.logo_url && <img src={team.logo_url} alt="logo" className="w-16 h-16 rounded" />}
            <form onSubmit={handleUpdateName} className="flex gap-2 items-center">
              <input value={newName} onChange={e => setNewName(e.target.value)} className="p-2 rounded border" />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{t('update')} {t('name')}</button>
            </form>
            <input type="file" ref={fileInput} style={{ display: 'none' }} accept="image/*" onChange={handleLogoUpload} />
            <button onClick={() => fileInput.current.click()} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700" disabled={logoUploading}>{logoUploading ? t('uploading') : t('upload_logo')}</button>
          </div>
          <div className="mb-4">
            <form onSubmit={handleInvite} className="flex gap-2 items-center">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder={t('invite') + ' ' + t('members')} className="p-2 rounded border" />
              <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">{t('invite')}</button>
            </form>
          </div>
          <div>
            <div className="font-bold mb-2">{t('members')}</div>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">{t('name')}</th>
                  <th className="p-2">{t('email')}</th>
                  <th className="p-2">{t('role')}</th>
                  <th className="p-2">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2">{m.name}</td>
                    <td className="p-2">{m.email}</td>
                    <td className="p-2">{m.role}</td>
                    <td className="p-2">
                      <button onClick={() => handleRemove(m.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">{t('delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
export default Team; 