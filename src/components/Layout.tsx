import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: 'المدير',
      employee: 'الموظف',
      courier: 'المندوب'
    };
    return roles[role] || role;
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>نظام إدارة التوصيل</h2>
          </div>
          <div className="nav-menu">
            <Link to="/" className="nav-link">
              الرئيسية
            </Link>
            {(user?.role === 'admin' || user?.role === 'employee') && (
              <>
                <Link to="/orders/preparing" className="nav-link">
                  قيد التجهيز
                </Link>
                <Link to="/orders/sent" className="nav-link">
                  المرسلة
                </Link>
                <Link to="/orders/to-receive" className="nav-link">
                  المراد استلامها
                </Link>
              </>
            )}
            {user?.role === 'courier' && (
              <Link to="/courier" className="nav-link">
                لوحة المندوب
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="nav-link">
                  لوحة المدير
                </Link>
                <Link to="/users" className="nav-link">
                  المستخدمين
                </Link>
              </>
            )}
          </div>
          <div className="nav-user">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">({getRoleName(user?.role || '')})</span>
            <button onClick={handleLogout} className="btn btn-secondary">تسجيل الخروج</button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

