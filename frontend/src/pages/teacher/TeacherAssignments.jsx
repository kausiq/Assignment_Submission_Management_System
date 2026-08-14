import { useEffect, useState } from 'react';
import { assignmentsApi, subjectsApi } from '../../api/resources';
import { getErrorMessage } from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import StatusStamp from '../../components/StatusStamp';

const emptyForm = {
  title: '',
  description: '',
  subjectId: '',
  deadline: '',
  maxMarks: 100,
  status: 'draft',
  allowLateSubmission: false,
  allowResubmissionBeforeDeadline: true
};

const toLocalInputValue = (isoString) => {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [assignmentList, subjectList] = await Promise.all([assignmentsApi.list(), subjectsApi.list()]);
    setAssignments(assignmentList);
    setSubjects(subjectList);
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

  const openEdit = (assignment) => {
    setEditing(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description,
      subjectId: assignment.subjectId?._id,
      deadline: toLocalInputValue(assignment.deadline),
      maxMarks: assignment.maxMarks,
      status: assignment.status,
      allowLateSubmission: assignment.allowLateSubmission,
      allowResubmissionBeforeDeadline: assignment.allowResubmissionBeforeDeadline
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await assignmentsApi.update(editing._id, {
          title: form.title,
          description: form.description,
          deadline: new Date(form.deadline).toISOString(),
          maxMarks: Number(form.maxMarks),
          status: form.status,
          allowLateSubmission: form.allowLateSubmission,
          allowResubmissionBeforeDeadline: form.allowResubmissionBeforeDeadline
        });
      } else {
        const subject = subjects.find((s) => s._id === form.subjectId);
        await assignmentsApi.create({
          title: form.title,
          description: form.description,
          classId: subject?.classId?._id,
          subjectId: form.subjectId,
          deadline: new Date(form.deadline).toISOString(),
          maxMarks: Number(form.maxMarks),
          status: form.status,
          allowLateSubmission: form.allowLateSubmission,
          allowResubmissionBeforeDeadline: form.allowResubmissionBeforeDeadline
        });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Delete assignment "${assignment.title}"? All submissions will also be removed.`)) return;
    try {
      await assignmentsApi.remove(assignment._id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const togglePublish = async (assignment) => {
    try {
      await assignmentsApi.update(assignment._id, {
        status: assignment.status === 'published' ? 'draft' : 'published'
      });
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (!assignments) {
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
          <h1 className="font-display text-2xl font-semibold">My Assignments</h1>
          <p className="text-sm text-slate">Create, publish, and manage assignments for your subjects.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} disabled={subjects.length === 0}>+ New assignment</button>
      </div>

      {subjects.length === 0 && (
        <Alert variant="info">You have not been assigned to any subjects yet. Ask an admin to assign you to a subject before creating assignments.</Alert>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {assignments.map((a) => (
          <div key={a._id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold text-ink-800">{a.title}</p>
                <p className="text-xs text-slate">{a.subjectId?.name} · {a.classId?.name} {a.classId?.section}</p>
              </div>
              <StatusStamp status={a.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink-600">{a.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate">
              <span className="font-mono">Due {new Date(a.deadline).toLocaleString()}</span>
              <span className="font-mono">Max {a.maxMarks} marks</span>
            </div>
            <div className="mt-3 flex gap-3 border-t border-ink-100 pt-3">
              <button className="text-xs font-medium text-teal-600 hover:underline" onClick={() => openEdit(a)}>Edit</button>
              <button className="text-xs font-medium text-gold-600 hover:underline" onClick={() => togglePublish(a)}>
                {a.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button className="text-xs font-medium text-rose-500 hover:underline" onClick={() => handleDelete(a)}>Delete</button>
            </div>
          </div>
        ))}
        {assignments.length === 0 && <p className="text-slate">No assignments yet.</p>}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit assignment' : 'New assignment'} onClose={() => setModalOpen(false)} width="max-w-xl">
        <Alert variant="error">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {!editing && (
            <div>
              <label className="label">Subject</label>
              <select className="input" required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">Select a subject…</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} — {s.classId?.name} {s.classId?.section}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="datetime-local" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="label">Max marks</label>
              <input className="input" type="number" min={1} required value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.allowLateSubmission} onChange={(e) => setForm({ ...form, allowLateSubmission: e.target.checked })} />
              Allow late submissions
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.allowResubmissionBeforeDeadline} onChange={(e) => setForm({ ...form, allowResubmissionBeforeDeadline: e.target.checked })} />
              Allow students to update their submission before the deadline
            </label>
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

export default TeacherAssignments;
