import { useEffect, useState } from 'react';
import { usersApi, classesApi, subjectsApi, assignmentsApi, submissionsApi } from '../../api/resources';
import Spinner from '../../components/Spinner';

const StatCard = ({ label, value, accent }) => (
  <div className="card p-5">
    <p className="label">{label}</p>
    <p className={`font-display text-3xl font-semibold ${accent}`}>{value}</p>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [users, classes, subjects, assignments, submissions] = await Promise.all([
        usersApi.list(),
        classesApi.list(),
        subjectsApi.list(),
        assignmentsApi.list(),
        submissionsApi.list()
      ]);
      setStats({
        teachers: users.filter((u) => u.role === 'teacher').length,
        students: users.filter((u) => u.role === 'student').length,
        classes: classes.length,
        subjects: subjects.length,
        assignments: assignments.length,
        published: assignments.filter((a) => a.status === 'published').length,
        submissions: submissions.length,
        graded: submissions.filter((s) => s.status === 'graded').length
      });
    };
    load();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Registry Overview</h1>
      <p className="mb-6 text-sm text-slate">A snapshot of everything currently on the books.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Teachers" value={stats.teachers} accent="text-ink-700" />
        <StatCard label="Students" value={stats.students} accent="text-ink-700" />
        <StatCard label="Classes" value={stats.classes} accent="text-ink-700" />
        <StatCard label="Subjects" value={stats.subjects} accent="text-ink-700" />
        <StatCard label="Assignments" value={stats.assignments} accent="text-teal-600" />
        <StatCard label="Published" value={stats.published} accent="text-teal-600" />
        <StatCard label="Submissions" value={stats.submissions} accent="text-gold-600" />
        <StatCard label="Graded" value={stats.graded} accent="text-gold-600" />
      </div>
    </div>
  );
};

export default AdminOverview;
