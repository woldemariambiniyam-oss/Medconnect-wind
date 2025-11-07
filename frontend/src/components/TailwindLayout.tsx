import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

interface Props {
  children: React.ReactNode;
}

const TailwindLayout: React.FC<Props> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-semibold text-indigo-600">Medconnect</Link>
              <nav className="hidden sm:flex gap-3">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/doctors" className="text-gray-600 hover:text-gray-900">Doctors</Link>
                <Link to="/pharmacies" className="text-gray-600 hover:text-gray-900">Pharmacies</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{user.name} ({user.role})</span>
                  <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Logout</button>
                </>
              ) : (
                <Link to="/login" className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default TailwindLayout;
