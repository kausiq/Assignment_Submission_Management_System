import { useEffect, useState } from 'react';
import { usersApi, classesApi } from '../../api/resources';
import { getErrorMessage } from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

const emptyForm = { name: '', email: '', password: '', role: 'student', classId: '' };

const AdminUsers = () => {
  const [users, setUsers] = useState(null);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState('');

  const load = async () => {
    const [userList, classList] = await Promise.all([
      usersApi.list(filterRole ? { role: filterRole } : undefined),
      classesApi.list()
    ]);
    setUsers(userList);
    setClasses(classList);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      classId: user.classId?._id || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingUser) {
        const payload = { name: form.name, role: form.role, classId: form.classId || null };
        if (form.password) payload.password = form.password;
        await usersApi.update(editingUser._id, payload);
      } else {
        await usersApi.create(form);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await usersApi.remove(user._id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (!users) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Users</h1>
          <p className="text-sm text-slate">Manage admin, teacher, and student accounts.</p>
        </div>
        <div className="flex gap-2">
          <select className="input !w-auto" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <button className="btn-primary" onClick={openCreate}>+ New user</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-ink-100">
                <td className="px-4 py-2.5 font-medium text-ink-700">{u.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate">{u.email}</td>
                <td className="px-4 py-2.5 capitalize">{u.role}</td>
                <td className="px-4 py-2.5">{u.classId ? `${u.classId.name} ${u.classId.section || ''}` : '—'}</td>
                <td className="px-4 py-2.5">{u.isActive ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-2.5 text-right">
                  <button className="mr-3 text-xs font-medium text-teal-600 hover:underline" onClick={() => openEdit(u)}>
                    Edit
                  </button>
                  <button className="text-xs font-medium text-rose-500 hover:underline" onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editingUser ? 'Edit user' : 'New user'} onClose={() => setModalOpen(false)}>
        <Alert variant="error">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              disabled={!!editingUser}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{editingUser ? 'New password (leave blank to keep current)' : 'Password'}</label>
            <input
              className="input"
              type="password"
              required={!editingUser}
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          {form.role === 'student' && (
            <div>
              <label className="label">Class</label>
              <select className="input" required value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
                <option value="">Select a class…</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
