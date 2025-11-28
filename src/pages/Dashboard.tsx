import { useQuery } from 'react-query';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: ordersStats } = useQuery('orders-stats', async () => {
      const response = await axios.get('/orders');
    const orders = response.data;
    
    return {
      total: orders.length,
      preparing: orders.filter((o: any) => o.status === 'preparing').length,
      assigned: orders.filter((o: any) => o.status === 'assigned').length,
      in_delivery: orders.filter((o: any) => o.status === 'in_delivery').length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      device_received: orders.filter((o: any) => o.status === 'device_received').length,
      myOrders: user?.role === 'courier' 
        ? orders.filter((o: any) => o.assigned_to === user.id).length 
        : 0
    };
  }, {
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });

  const { data: recentOrders } = useQuery('recent-orders', async () => {
      const response = await axios.get('/orders');
    return response.data.slice(0, 5);
  }, {
    refetchInterval: 5000 // تحديث كل 5 ثواني
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
    <div className="dashboard">
      <h1>لوحة التحكم</h1>
      
      {(user?.role === 'admin' || user?.role === 'employee') && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>إجمالي الطلبات</h3>
            <p className="stat-number">{ordersStats?.total || 0}</p>
          </div>
          <div className="stat-card">
            <h3>قيد التجهيز</h3>
            <p className="stat-number">{ordersStats?.preparing || 0}</p>
          </div>
          <div className="stat-card">
            <h3>معين</h3>
            <p className="stat-number">{ordersStats?.assigned || 0}</p>
          </div>
          <div className="stat-card">
            <h3>قيد التوصيل</h3>
            <p className="stat-number">{ordersStats?.in_delivery || 0}</p>
          </div>
          <div className="stat-card">
            <h3>تم التسليم</h3>
            <p className="stat-number">{ordersStats?.delivered || 0}</p>
          </div>
        </div>
      )}

      {user?.role === 'courier' && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>طلباتي</h3>
            <p className="stat-number">{ordersStats?.myOrders || 0}</p>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        {(user?.role === 'admin' || user?.role === 'employee') && (
          <Link to="/orders/new" className="btn btn-primary">
            إنشاء طلب جديد
          </Link>
        )}
        {user?.role === 'courier' && (
          <Link to="/courier" className="btn btn-primary">
            عرض طلباتي
          </Link>
        )}
      </div>

      <div className="card">
        <h2>الطلبات الأخيرة</h2>
        {recentOrders && recentOrders.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم الزبون</th>
                <th>نوع الخدمة</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{getServiceTypeName(order.service_type)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '14px' }}>
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>لا توجد طلبات</p>
        )}
      </div>
    </div>
  );
}

