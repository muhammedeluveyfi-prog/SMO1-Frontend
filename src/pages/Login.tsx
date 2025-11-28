import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>نظام إدارة التوصيل</h1>
        <h2>تسجيل الدخول</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <div className="login-features">
          <div className="feature-item">
            <div className="feature-icon">🚚</div>
            <div className="feature-text">
              <h3>تتبع الطلبات</h3>
              <p>تتبع حالة الطلبات في الوقت الفعلي</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📦</div>
            <div className="feature-text">
              <h3>إدارة الطلبات</h3>
              <p>إدارة شاملة لجميع الطلبات</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">👥</div>
            <div className="feature-text">
              <h3>إدارة المستخدمين</h3>
              <p>إدارة الموظفين والموصلين</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <h3>سرعة الأداء</h3>
              <p>نظام سريع وموثوق</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

