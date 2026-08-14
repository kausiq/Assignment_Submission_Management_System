import { useEffect, useState } from 'react';
import { subjectsApi, classesApi, usersApi } from '../../api/resources';
import { getErrorMessage } from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

const emptyForm = { name: '', code: '', classId: '', teachers: [] };

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [subjectList, classList, teacherList] = await Promise.all([
      subjectsApi.list(),
      classesApi.list(),
      usersApi.list({ role: 'teacher' })
    ]);
    setSubjects(subjectList);
    setClasses(classList);
    setTeachers(teacherList);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setForm({
      name: subject.name,
      code: subject.code || '',
      classId: subject.classId?._id || '',
      teachers: subject.teachers?.map((t) => t._id) || []
    });
    setError('');
    setModalOpen(true);
  };

  const toggleTeacher = (id) => {
    setForm((f) => ({
      ...f,
      teachers: f.teachers.includes(id) ? f.teachers.filter((t) => t !== id) : [...f.teachers, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await subjectsApi.update(editing._id, form);
      else await subjectsApi.create(form);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Delete subject "${subject.name}"?`)) return;
    try {
      await subjectsApi.remove(subject._id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (!subjects) {
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
          <h1 className="font-display text-2xl font-semibold">Subjects</h1>
          <p className="text-sm text-slate">Assign teachers to subjects for each class.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ New subject</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Teachers</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id} className="border-t border-ink-100">
                <td className="px-4 py-2.5 font-medium text-ink-700">{s.name} <span className="font-mono text-xs text-slate">{s.code}</span></td>
                <td className="px-4 py-2.5">{s.classId ? `${s.classId.name} ${s.classId.section || ''}` : '—'}</td>
                <td className="px-4 py-2.5">{s.teachers?.map((t) => t.name).join(', ') || '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <button className="mr-3 text-xs font-medium text-teal-600 hover:underline" onClick={() => openEdit(s)}>Edit</button>
                  <button className="text-xs font-medium text-rose-500 hover:underline" onClick={() => handleDelete(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate">No subjects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit subject' : 'New subject'} onClose={() => setModalOpen(false)}>
        <Alert variant="error">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Code</label>
            <input className="input" placeholder="e.g. MATH101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" required value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">Select a class…</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name} {c.section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Teachers</label>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-ink-200 p-2">
              {teachers.map((t) => (
                <label key={t._id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-ink-50">
                  <input
                    type="checkbox"
                    checked={form.teachers.includes(t._id)}
                    onChange={() => toggleTeacher(t._id)}
                  />
                  {t.name} <span className="font-mono text-xs text-slate">{t.email}</span>
                </label>
              ))}
              {teachers.length === 0 && <p className="p-2 text-xs text-slate">No teachers available yet.</p>}
            </div>
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

export default AdminSubjects;
