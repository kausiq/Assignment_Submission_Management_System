import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Spinner from './components/Spinner';

import Login from './pages/auth/Login';

import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClasses from './pages/admin/AdminClasses';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminAssignments from './pages/admin/AdminAssignments';

import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherSubmissions from './pages/teacher/TeacherSubmissions';

import StudentAssignments from './pages/student/StudentAssignments';
import StudentSubmissions from './pages/student/StudentSubmissions';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<Layout />}>
          <Route path="/teacher" element={<TeacherAssignments />} />
          <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<Layout />}>
          <Route path="/student" element={<StudentAssignments />} />
          <Route path="/student/submissions" element={<StudentSubmissions />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
