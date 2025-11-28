import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import './Orders.css';

export default function PreparingOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery('preparing-orders', async () => {
    const response = await axios.get('/orders', { params: { status: 'preparing' } });
    return response.data;
  }, {
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });

  const { data: couriers } = useQuery('couriers', async () => {
    const response = await axios.get('/users', { params: { role: 'courier' } });
    return response.data;
  }, { enabled: user?.role === 'admin' || user?.role === 'employee' });

  const assignMutation = useMutation(
    ({ orderId, courierId }: { orderId: number; courierId: number }) =>
      axios.post(`/orders/${orderId}/assign`, { assigned_to: courierId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('preparing-orders');
        queryClient.invalidateQueries('orders-stats');
      }
    }
  );

  const handleAssign = (orderId: number, courierId: number) => {
    if (window.confirm('هل أنت متأكد من تعيين هذا الطلب للمندوب؟')) {
      assignMutation.mutate({ orderId, courierId });
    }
  };

  const handlePrint = (orderId: number) => {
    window.open(`/orders/${orderId}?print=true`, '_blank');
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
        <h1>الطلبات قيد التجهيز</h1>
        <Link to="/orders/new" className="btn btn-primary">
          إنشاء طلب جديد
        </Link>
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
                  <th>المنتج/الجهاز</th>
                  <th>العنوان</th>
                  <th>المندوب</th>
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
                    <td>
                      {order.details?.product_name || 
                       order.details?.device_name || 
                       '-'}
                    </td>
                    <td>{order.address}</td>
                    <td>{order.assigned_to_name || 'غير معين'}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '14px' }}
                        >
                          عرض
                        </Link>
                        {!order.assigned_to && (user?.role === 'admin' || user?.role === 'employee') && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssign(order.id, parseInt(e.target.value));
                                e.target.value = '';
                              }
                            }}
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '14px', marginRight: '5px' }}
                            disabled={assignMutation.isLoading}
                          >
                            <option value="">تعيين مندوب</option>
                            {couriers?.map((courier: any) => (
                              <option key={courier.id} value={courier.id}>
                                {courier.full_name}
                              </option>
                            ))}
                          </select>
                        )}
                        {order.assigned_to && (
                          <button
                            onClick={() => handlePrint(order.id)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '14px', marginRight: '5px' }}
                          >
                            طباعة
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>لا توجد طلبات قيد التجهيز</p>
        )}
      </div>
    </div>
  );
}

