import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import './Orders.css';

export default function SentOrders() {
  const [filters, setFilters] = useState({
    search: '',
    service_type: '',
    courier: '',
    status: ''
  });

  const { data: orders } = useQuery(
    ['sent-orders', filters],
    async () => {
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.service_type) params.service_type = filters.service_type;
      if (filters.courier) params.assigned_to = filters.courier;
      if (filters.status) params.status = filters.status;

      const response = await axios.get('/orders', { params });
      // Filter out preparing orders
      return response.data.filter((o: any) => o.status !== 'preparing');
    },
    {
      refetchInterval: 5000 // تحديث كل 5 ثواني
    }
  );

  const { data: couriers } = useQuery('all-couriers', async () => {
    const response = await axios.get('/users', { params: { role: 'courier' } });
    return response.data;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; class: string } } = {
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
    <div className="orders-page">
      <div className="page-header">
        <h1>الطلبات المرسلة</h1>
      </div>

      <div className="card">
        <h2>فلترة الطلبات</h2>
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
          <div className="form-group">
            <label>الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">الكل</option>
              <option value="assigned">معين</option>
              <option value="in_delivery">قيد التوصيل</option>
              <option value="delivered">تم التسليم</option>
              <option value="device_received">تم الاستلام</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>قائمة الطلبات</h2>
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
          <p>لا توجد طلبات مرسلة</p>
        )}
      </div>
    </div>
  );
}

