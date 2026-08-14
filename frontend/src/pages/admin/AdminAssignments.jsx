import { useEffect, useState } from 'react';
import { assignmentsApi, submissionsApi } from '../../api/resources';
import StatusStamp from '../../components/StatusStamp';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [submissions, setSubmissions] = useState(null);

  useEffect(() => {
    assignmentsApi.list({ all: true }).then(setAssignments);
  }, []);

  const openSubmissions = async (assignment) => {
    setViewing(assignment);
    setSubmissions(null);
    const data = await submissionsApi.list({ assignmentId: assignment._id });
    setSubmissions(data);
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
        <h1 className="font-display text-2xl font-semibold">All Assignments</h1>
        <p className="text-sm text-slate">Every assignment across every class and teacher.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5">Teacher</th>
              <th className="px-4 py-2.5">Deadline</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id} className="border-t border-ink-100">
                <td className="px-4 py-2.5 font-medium text-ink-700">{a.title}</td>
                <td className="px-4 py-2.5">{a.classId?.name} {a.classId?.section}</td>
                <td className="px-4 py-2.5">{a.subjectId?.name}</td>
                <td className="px-4 py-2.5">{a.teacherId?.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{new Date(a.deadline).toLocaleString()}</td>
                <td className="px-4 py-2.5"><StatusStamp status={a.status} /></td>
                <td className="px-4 py-2.5 text-right">
                  <button className="text-xs font-medium text-teal-600 hover:underline" onClick={() => openSubmissions(a)}>
                    View submissions
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate">No assignments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewing} title={`Submissions — ${viewing?.title || ''}`} onClose={() => setViewing(null)} width="max-w-2xl">
        {!submissions ? (
          <div className="flex h-32 items-center justify-center"><Spinner /></div>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-slate">No submissions yet for this assignment.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s._id} className="rounded border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink-700">{s.studentId?.name}</p>
                  <StatusStamp status={s.status} />
                </div>
                <p className="mt-1 text-xs text-slate">
                  {s.marks != null ? `Marks: ${s.marks} / ${viewing.maxMarks}` : 'Not yet graded'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAssignments;
