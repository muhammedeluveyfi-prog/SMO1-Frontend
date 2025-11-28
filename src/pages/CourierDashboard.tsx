import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import './CourierDashboard.css';

export default function CourierDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: newOrders } = useQuery('courier-new-orders', async () => {
    const response = await axios.get('/orders', { 
      params: { status: 'assigned' } 
    });
    return response.data.filter((o: any) => o.assigned_to === user?.id);
  }, {
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });

  const { data: inDeliveryOrders } = useQuery('courier-in-delivery', async () => {
    const response = await axios.get('/orders', { 
      params: { status: 'in_delivery' } 
    });
    return response.data.filter((o: any) => o.assigned_to === user?.id);
  }, {
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });

  const receiveMutation = useMutation(
    (orderId: number) => axios.post(`/orders/${orderId}/receive`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courier-new-orders');
        queryClient.invalidateQueries('courier-in-delivery');
        queryClient.invalidateQueries('orders-stats');
      }
    }
  );

  const handleReceive = (orderId: number) => {
    receiveMutation.mutate(orderId);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; class: string } } = {
      assigned: { text: 'جديد', class: 'badge-info' },
      in_delivery: { text: 'قيد التوصيل', class: 'badge-info' },
      delivered: { text: 'تم التسليم', class: 'badge-success' },
      device_received: { text: 'تم الاستلام', class: 'badge-success' }
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
    <div className="courier-dashboard">
      <h1>لوحة المندوب</h1>

      <div className="courier-sections">
        <div className="card">
          <h2>طلبات جديدة محوّلة لي ({newOrders?.length || 0})</h2>
          {newOrders && newOrders.length > 0 ? (
            <div className="orders-list">
              {newOrders.map((order: any) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-number">#{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="order-info">
                    <p><strong>الزبون:</strong> {order.customer_name}</p>
                    <p><strong>الهاتف:</strong> {order.customer_phone}</p>
                    <p><strong>النوع:</strong> {getServiceTypeName(order.service_type)}</p>
                    <p><strong>العنوان:</strong> {order.address}</p>
                  </div>
                  <div className="order-actions">
                    <button
                      onClick={() => handleReceive(order.id)}
                      className="btn btn-success"
                      disabled={receiveMutation.isLoading}
                    >
                      {receiveMutation.isLoading ? 'جاري الاستلام...' : 'استلام الطلب'}
                    </button>
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-primary"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>لا توجد طلبات جديدة</p>
          )}
        </div>

        <div className="card">
          <h2>طلبات قيد التوصيل ({inDeliveryOrders?.length || 0})</h2>
          {inDeliveryOrders && inDeliveryOrders.length > 0 ? (
            <div className="orders-list">
              {inDeliveryOrders.map((order: any) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-number">#{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="order-info">
                    <p><strong>الزبون:</strong> {order.customer_name}</p>
                    <p><strong>الهاتف:</strong> {order.customer_phone}</p>
                    <p><strong>النوع:</strong> {getServiceTypeName(order.service_type)}</p>
                    <p><strong>العنوان:</strong> {order.address}</p>
                  </div>
                  <div className="order-actions">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-primary"
                    >
                      متابعة الطلب
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>لا توجد طلبات قيد التوصيل</p>
          )}
        </div>
      </div>
    </div>
  );
}

