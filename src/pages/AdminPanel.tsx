import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import './AdminPanel.css';

export default function AdminPanel() {
  const [filters, setFilters] = useState({
    search: '',
    service_type: '',
    status: '',
    courier: ''
  });

  const { data: orders } = useQuery(
    ['admin-orders', filters],
    async () => {
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.service_type) params.service_type = filters.service_type;
      if (filters.status) params.status = filters.status;
      if (filters.courier) params.courier_id = filters.courier;

      const response = await axios.get('/orders', { params });
      return response.data;
    }
  );

  const { data: couriers } = useQuery('all-couriers', async () => {
    const response = await axios.get('/users', { params: { role: 'courier' } });
    return response.data;
  });

  const { data: stats } = useQuery('admin-stats', async () => {
    const response = await axios.get('/orders');
    const orders = response.data;
    
    const statsByType: any = {};
    const statsByStatus: any = {};
    const statsByCourier: any = {};

    orders.forEach((order: any) => {
      // By type
      statsByType[order.service_type] = (statsByType[order.service_type] || 0) + 1;
      
      // By status
      statsByStatus[order.status] = (statsByStatus[order.status] || 0) + 1;
      
      // By courier
      if (order.assigned_to_name) {
        statsByCourier[order.assigned_to_name] = (statsByCourier[order.assigned_to_name] || 0) + 1;
      }
    });

    return { byType: statsByType, byStatus: statsByStatus, byCourier: statsByCourier };
  });

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; class: string } } = {
      preparing: { text: 'قيد التجهيز', class: 'badge-warning' },
      assigned: { text: 'معين', class: 'badge-info' },
      in_delivery: { text: 'قيد التوصيل', class: 'badge-info' },
      delivered: { text: 'تم التسليم', class: 'badge-success' },
      device_received: { text: 'تم الاستلام', class: 'badge-success' },
      cancelled: { text: 'ملغي', class: 'badge-danger' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getServiceTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      sale: 'بيع',
      send_after_repair: 'إرسال بعد الصيانة',
      receive_for_repair: 'استلام للصيانة'
    };
    return types[type] || type;
  };

  return (
    <div className="admin-panel">
      <h1>لوحة المدير</h1>

      {/* Statistics */}
      <div className="stats-section">
        <div className="card">
          <h2>إحصائيات حسب نوع الخدمة</h2>
          <div className="stats-grid">
            {stats?.byType && Object.entries(stats.byType).map(([type, count]: [string, any]) => (
              <div key={type} className="stat-item">
                <span className="stat-label">{getServiceTypeName(type)}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>إحصائيات حسب الحالة</h2>
          <div className="stats-grid">
            {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]: [string, any]) => (
              <div key={status} className="stat-item">
                <span className="stat-label">{getStatusBadge(status)}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>إحصائيات حسب المندوب</h2>
          <div className="stats-grid">
            {stats?.byCourier && Object.entries(stats.byCourier).map(([courier, count]: [string, any]) => (
              <div key={courier} className="stat-item">
                <span className="stat-label">{courier}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h2>البحث والفلترة</h2>
        <div className="filters">
          <div className="form-group">
            <label>البحث</label>
            <input
              type="text"
              placeholder="اسم الزبون أو رقم الهاتف"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>نوع الخدمة</label>
            <select
              value={filters.service_type}
              onChange={(e) => setFilters({ ...filters, service_type: e.target.value })}
            >
              <option value="">الكل</option>
              <option value="sale">بيع</option>
              <option value="send_after_repair">إرسال بعد الصيانة</option>
              <option value="receive_for_repair">استلام للصيانة</option>
            </select>
          </div>
          <div className="form-group">
            <label>الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">الكل</option>
              <option value="preparing">قيد التجهيز</option>
              <option value="assigned">معين</option>
              <option value="in_delivery">قيد التوصيل</option>
              <option value="delivered">تم التسليم</option>
              <option value="device_received">تم الاستلام</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div className="form-group">
            <label>المندوب</label>
            <select
              value={filters.courier}
              onChange={(e) => setFilters({ ...filters, courier: e.target.value })}
            >
              <option value="">الكل</option>
              {couriers?.map((courier: any) => (
                <option key={courier.id} value={courier.id}>
                  {courier.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <h2>جميع الطلبات ({orders?.length || 0})</h2>
        {orders && orders.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الزبون</th>
                  <th>رقم الهاتف</th>
                  <th>نوع الخدمة</th>
                  <th>المندوب</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>{getServiceTypeName(order.service_type)}</td>
                    <td>{order.assigned_to_name || '-'}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                    <td>
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>لا توجد طلبات</p>
        )}
      </div>
    </div>
  );
}

