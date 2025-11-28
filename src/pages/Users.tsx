import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../config/axios';
import './Users.css';

export default function Users() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'employee',
    phone: ''
  });

  const { data: users, isLoading } = useQuery('users', async () => {
    const response = await axios.get('/users');
    return response.data;
  });

  const createMutation = useMutation(
    (data: any) => axios.post('/users', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setShowForm(false);
        resetForm();
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => axios.put(`/users/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setEditingUser(null);
        resetForm();
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => axios.delete(`/users/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'employee',
      phone: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || ''
    });
    setShowForm(true);
  };

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: 'المدير',
      employee: 'الموظف',
      courier: 'المندوب'
    };
    return roles[role] || role;
  };

  if (isLoading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>إدارة المستخدمين</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingUser(null);
            resetForm();
          }}
          className="btn btn-primary"
        >
          إضافة مستخدم جديد
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>اسم المستخدم *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>كلمة المرور {!editingUser && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>الاسم الكامل *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>الدور *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="employee">موظف</option>
                  <option value="courier">مندوب</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>قائمة المستخدمين</h2>
        <table className="table">
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>الاسم الكامل</th>
              <th>الدور</th>
              <th>رقم الهاتف</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.full_name}</td>
                <td>{getRoleName(user.role)}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={user.is_active ? 'badge badge-success' : 'badge badge-danger'}>
                    {user.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(user)}
                    className="btn btn-primary"
                    style={{ padding: '5px 10px', fontSize: '14px', marginLeft: '5px' }}
                  >
                    تعديل
                  </button>
                  {user.is_active && (
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      حذف
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

