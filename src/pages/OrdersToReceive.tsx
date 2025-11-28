import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import './Orders.css';

export default function OrdersToReceive() {
  const { data: orders } = useQuery('orders-to-receive', async () => {
    const response = await axios.get('/orders', { 
      params: { service_type: 'receive_for_repair' } 
    });
    return response.data.filter((o: any) => 
      o.status === 'assigned' || o.status === 'in_delivery' || o.status === 'device_received'
    );
  }, {
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; class: string } } = {
      assigned: { text: 'معين - بانتظار الاستلام', class: 'badge-warning' },
      in_delivery: { text: 'قيد الاستلام', class: 'badge-info' },
      device_received: { text: 'تم الاستلام', class: 'badge-success' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>الطلبات المراد استلامها</h1>
      </div>

      <div className="card">
        <h2>قائمة الطلبات</h2>
        <p className="help-text">
          هذه الصفحة تعرض الطلبات التي تحتاج إلى استلام جهاز من الزبون (طلبات استلام للصيانة)
        </p>
        {orders && orders.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الزبون</th>
                  <th>رقم الهاتف</th>
                  <th>اسم الجهاز</th>
                  <th>العنوان</th>
                  <th>المندوب</th>
                  <th>حالة الاستلام</th>
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
                    <td>{order.details?.device_name || '-'}</td>
                    <td>{order.address}</td>
                    <td>{order.assigned_to_name || 'غير معين'}</td>
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
          <p>لا توجد طلبات مراد استلامها</p>
        )}
      </div>
    </div>
  );
}

