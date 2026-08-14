import { useEffect, useState } from 'react';
import { classesApi } from '../../api/resources';
import { getErrorMessage } from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

const emptyForm = { name: '', section: '', description: '' };

const AdminClasses = () => {
  const [classes, setClasses] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => setClasses(await classesApi.list());

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cls) => {
    setEditing(cls);
    setForm({ name: cls.name, section: cls.section || '', description: cls.description || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await classesApi.update(editing._id, form);
      else await classesApi.create(form);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls) => {
    if (!window.confirm(`Delete class "${cls.name} ${cls.section}"?`)) return;
    try {
      await classesApi.remove(cls._id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (!classes) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Classes &amp; Courses</h1>
          <p className="text-sm text-slate">The groups students are enrolled into.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ New class</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <div key={c._id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-ink-800">{c.name} {c.section}</p>
                <p className="mt-1 text-xs text-slate">{c.description || 'No description'}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <button className="text-xs font-medium text-teal-600 hover:underline" onClick={() => openEdit(c)}>Edit</button>
              <button className="text-xs font-medium text-rose-500 hover:underline" onClick={() => handleDelete(c)}>Delete</button>
            </div>
          </div>
        ))}
        {classes.length === 0 && <p className="text-slate">No classes yet. Create one to get started.</p>}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit class' : 'New class'} onClose={() => setModalOpen(false)}>
        <Alert variant="error">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" required placeholder="e.g. Class 10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Section</label>
            <input className="input" placeholder="e.g. A" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminClasses;
