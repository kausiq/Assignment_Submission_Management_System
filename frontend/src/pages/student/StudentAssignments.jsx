import { useEffect, useState } from 'react';
import { assignmentsApi, submissionsApi } from '../../api/resources';
import { getErrorMessage } from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import StatusStamp from '../../components/StatusStamp';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState(null);
  const [mySubmissions, setMySubmissions] = useState({});
  const [active, setActive] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [assignmentList, submissionList] = await Promise.all([assignmentsApi.list(), submissionsApi.list()]);
    setAssignments(assignmentList);
    const map = {};
    submissionList.forEach((s) => {
      map[s.assignmentId?._id || s.assignmentId] = s;
    });
    setMySubmissions(map);
  };

  useEffect(() => {
    load();
  }, []);

  const openAssignment = (assignment) => {
    setActive(assignment);
    const existing = mySubmissions[assignment._id];
    setAnswerText(existing?.answerText || '');
    setAttachmentUrl(existing?.attachmentUrl || '');
    setError('');
  };

  const isPastDeadline = active && new Date() > new Date(active.deadline);
  const existingSubmission = active ? mySubmissions[active._id] : null;
  const canEdit =
    !existingSubmission ||
    (existingSubmission.status !== 'graded' && (!isPastDeadline || false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (existingSubmission) {
        await submissionsApi.update(existingSubmission._id, { answerText, attachmentUrl });
      } else {
        await assignmentsApi.submit(active._id, { answerText, attachmentUrl });
      }
      setActive(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
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
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold">Assignments</h1>
        <p className="text-sm text-slate">Published assignments for your class.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {assignments.map((a) => {
          const submission = mySubmissions[a._id];
          const overdue = new Date() > new Date(a.deadline);
          return (
            <div key={a._id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-semibold text-ink-800">{a.title}</p>
                  <p className="text-xs text-slate">{a.subjectId?.name} · {a.teacherId?.name}</p>
                </div>
                {submission ? <StatusStamp status={submission.status} /> : overdue ? (
                  <span className="stamp stamp-late">Overdue</span>
                ) : (
                  <span className="stamp stamp-draft">Pending</span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink-600">{a.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate">
                <span className="font-mono">Due {new Date(a.deadline).toLocaleString()}</span>
                <span className="font-mono">Max {a.maxMarks} marks</span>
              </div>
              {submission?.marks != null && (
                <p className="mt-2 font-mono text-sm text-gold-600">Marks: {submission.marks} / {a.maxMarks}</p>
              )}
              <div className="mt-3 border-t border-ink-100 pt-3">
                <button className="text-xs font-medium text-teal-600 hover:underline" onClick={() => openAssignment(a)}>
                  {submission ? 'View / update submission' : 'View & submit'}
                </button>
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && <p className="text-slate">No assignments published for your class yet.</p>}
      </div>

      <Modal open={!!active} title={active?.title || ''} onClose={() => setActive(null)} width="max-w-xl">
        {active && (
          <>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">Description</p>
            <p className="mb-4 whitespace-pre-wrap text-sm text-ink-700">{active.description}</p>
            <div className="mb-4 flex gap-4 text-xs text-slate">
              <span className="font-mono">Due {new Date(active.deadline).toLocaleString()}</span>
              <span className="font-mono">Max {active.maxMarks} marks</span>
              {isPastDeadline && !active.allowLateSubmission && !existingSubmission && (
                <span className="font-medium text-rose-500">Deadline has passed — submissions closed</span>
              )}
            </div>

            {existingSubmission?.status === 'graded' && (
              <div className="mb-4 rounded border border-gold-100 bg-gold-100/40 p-3">
                <p className="text-sm font-semibold text-gold-600">Graded: {existingSubmission.marks} / {active.maxMarks}</p>
                {existingSubmission.feedback && <p className="mt-1 text-sm text-ink-700">{existingSubmission.feedback}</p>}
              </div>
            )}

            <Alert variant="error">{error}</Alert>

            {(!existingSubmission && (!isPastDeadline || active.allowLateSubmission)) ||
            (existingSubmission && existingSubmission.status !== 'graded' && !isPastDeadline) ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Your answer</label>
                  <textarea className="input" rows={6} required value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
                </div>
                <div>
                  <label className="label">Attachment link (optional)</label>
                  <input className="input" type="url" placeholder="https://…" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="btn-secondary" onClick={() => setActive(null)}>Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Submitting…' : existingSubmission ? 'Update submission' : 'Submit'}
                  </button>
                </div>
              </form>
            ) : existingSubmission ? (
              <div className="rounded border border-ink-100 bg-ink-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">Your submitted answer</p>
                <p className="whitespace-pre-wrap text-sm text-ink-700">{existingSubmission.answerText}</p>
              </div>
            ) : (
              <p className="text-sm text-rose-500">This assignment can no longer accept submissions.</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default StudentAssignments;
