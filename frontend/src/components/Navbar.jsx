import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/classes', label: 'Classes' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/assignments', label: 'Assignments' }
  ],
  teacher: [
    { to: '/teacher', label: 'Assignments', end: true },
    { to: '/teacher/submissions', label: 'Submissions' }
  ],
  student: [
    { to: '/student', label: 'Assignments', end: true },
    { to: '/student/submissions', label: 'My Submissions' }
  ]
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const links = NAV_LINKS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-5">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl font-semibold text-ink-800">Ledger</span>
          <span className="hidden font-mono text-xs uppercase tracking-widest text-slate sm:inline">
            Assignment &amp; Submission Register
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-ink-700">{user.name}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-slate">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-3 text-xs">
            Log out
          </button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 px-6">
        <div className="tab-strip w-full">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `tab-strip-item ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
