import { useEffect, useState } from 'react';
import { submissionsApi } from '../../api/resources';
import { getErrorMessage } from '../../api/axios';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import StatusStamp from '../../components/StatusStamp';

const TeacherSubmissions = () => {
  const [submissions, setSubmissions] = useState(null);
  const [grading, setGrading] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => setSubmissions(await submissionsApi.list());

  useEffect(() => {
    load();
  }, []);

  const openGrade = (submission) => {
    setGrading(submission);
    setMarks(submission.marks ?? '');
    setFeedback(submission.feedback || '');
    setError('');
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await submissionsApi.grade(grading._id, { marks: Number(marks), feedback });
      setGrading(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!submissions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold">Submissions</h1>
        <p className="text-sm text-slate">Review student work and record marks &amp; feedback.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2.5">Student</th>
              <th className="px-4 py-2.5">Assignment</th>
              <th className="px-4 py-2.5">Submitted</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Marks</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="border-t border-ink-100">
                <td className="px-4 py-2.5 font-medium text-ink-700">{s.studentId?.name}</td>
                <td className="px-4 py-2.5">{s.assignmentId?.title}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="px-4 py-2.5"><StatusStamp status={s.status} /></td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  {s.marks != null ? `${s.marks} / ${s.assignmentId?.maxMarks}` : '—'}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button className="text-xs font-medium text-teal-600 hover:underline" onClick={() => openGrade(s)}>
                    {s.status === 'graded' ? 'Update grade' : 'Grade'}
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">No submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!grading} title={`Grade — ${grading?.studentId?.name || ''}`} onClose={() => setGrading(null)}>
        {grading && (
          <>
            <div className="mb-4 rounded border border-ink-100 bg-ink-50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">Student's answer</p>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{grading.answerText}</p>
              {grading.attachmentUrl && (
                <a href={grading.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-teal-600 underline">
                  View attachment
                </a>
              )}
            </div>
            <Alert variant="error">{error}</Alert>
            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="label">Marks (out of {grading.assignmentId?.maxMarks})</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={grading.assignmentId?.maxMarks}
                  required
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Feedback</label>
                <textarea className="input" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setGrading(null)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-accent">{saving ? 'Saving…' : 'Save grade'}</button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TeacherSubmissions;
