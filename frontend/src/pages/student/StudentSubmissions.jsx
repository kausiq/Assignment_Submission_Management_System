import { useEffect, useState } from 'react';
import { submissionsApi } from '../../api/resources';
import Spinner from '../../components/Spinner';
import StatusStamp from '../../components/StatusStamp';

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState(null);

  useEffect(() => {
    submissionsApi.list().then(setSubmissions);
  }, []);

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
        <h1 className="font-display text-2xl font-semibold">My Submissions</h1>
        <p className="text-sm text-slate">Track the status, marks, and feedback for everything you've submitted.</p>
      </div>

      <div className="space-y-3">
        {submissions.map((s) => (
          <div key={s._id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold text-ink-800">{s.assignmentId?.title}</p>
                <p className="text-xs text-slate">
                  {s.assignmentId?.subjectId?.name} · Submitted {new Date(s.submittedAt).toLocaleString()}
                </p>
              </div>
              <StatusStamp status={s.status} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600">{s.answerText}</p>
            {s.status === 'graded' && (
              <div className="mt-3 rounded border border-gold-100 bg-gold-100/40 p-3">
                <p className="text-sm font-semibold text-gold-600">
                  Marks: {s.marks} / {s.assignmentId?.maxMarks}
                </p>
                {s.feedback && <p className="mt-1 text-sm text-ink-700">{s.feedback}</p>}
              </div>
            )}
          </div>
        ))}
        {submissions.length === 0 && <p className="text-slate">You haven't submitted anything yet.</p>}
      </div>
    </div>
  );
};

export default StudentSubmissions;
