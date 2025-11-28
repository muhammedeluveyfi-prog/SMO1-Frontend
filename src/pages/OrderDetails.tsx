import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../config/axios';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../contexts/AuthContext';
import './OrderDetails.css';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: order, isLoading } = useQuery(
    ['order', id],
    async () => {
      const response = await axios.get(`/orders/${id}`);
      return response.data;
    }
  );

  const updateStatusMutation = useMutation(
    (status: string) => axios.post(`/orders/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries('orders');
      }
    }
  );

  const receiveMutation = useMutation(
    () => axios.post(`/orders/${id}/receive`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries('orders');
      }
    }
  );

  const paymentMutation = useMutation(
    (amount: number) => axios.post(`/orders/${id}/payment`, { amount }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setPaymentAmount('');
      }
    }
  );

  const signatureMutation = useMutation(
    (signatureData: string) => axios.post(`/upload/signature/${id}`, { signature_data: signatureData }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setShowSignature(false);
        if (signatureRef.current) {
          signatureRef.current.clear();
        }
      }
    }
  );

  const imageUploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('image_type', 'device_condition');
      return axios.post(`/upload/order-image/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setSelectedFile(null);
      }
    }
  );

  const handleStatusChange = (status: string) => {
    if (window.confirm('هل أنت متأكد من تغيير حالة الطلب؟')) {
      updateStatusMutation.mutate(status);
    }
  };

  const handleReceive = () => {
    if (window.confirm('هل أنت متأكد من استلام هذا الطلب؟')) {
      receiveMutation.mutate();
    }
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      paymentMutation.mutate(amount);
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      signatureMutation.mutate(signatureData);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      imageUploadMutation.mutate(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageDownload = async (imagePath: string, imageId: number) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${id}-image-${imageId}.jpg`; // Set download filename
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: try direct download
      const link = document.createElement('a');
      link.href = imagePath;
      link.download = `order-${id}-image-${imageId}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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

  const formatDetailValue = (key: string, value: string) => {
    // Add currency symbol for price and cost fields
    if ((key.includes('السعر') || key.includes('price') || key.includes('كلفة') || key.includes('cost')) && !isNaN(parseFloat(value))) {
      return `${value} د.ع`;
    }
    return value;
  };

  if (isLoading) return <div className="loading">جاري التحميل...</div>;
  if (!order) return <div>الطلب غير موجود</div>;

  return (
    <div className="order-details">
      <div className="page-header">
        <h1>تفاصيل الطلب #{order.id}</h1>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-secondary">
            طباعة
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            العودة
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="card">
          <h2>البيانات الأساسية</h2>
          <div className="detail-item">
            <strong>اسم الزبون:</strong> {order.customer_name}
          </div>
          <div className="detail-item">
            <strong>رقم الهاتف:</strong> {order.customer_phone}
          </div>
          <div className="detail-item">
            <strong>العنوان:</strong> {order.address}
          </div>
          <div className="detail-item">
            <strong>نوع الخدمة:</strong> {getServiceTypeName(order.service_type)}
          </div>
          <div className="detail-item">
            <strong>الحالة:</strong> {getStatusBadge(order.status)}
          </div>
          <div className="detail-item">
            <strong>المندوب:</strong> {order.assigned_to_name || 'غير معين'}
          </div>
          <div className="detail-item">
            <strong>تاريخ الإنشاء:</strong> {new Date(order.created_at).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="card">
          <h2>تفاصيل الطلب</h2>
          {Object.entries(order.details || {}).map(([key, value]) => (
            <div key={key} className="detail-item">
              <strong>{key}:</strong> {formatDetailValue(key, String(value))}
            </div>
          ))}
        </div>
      </div>

      {/* Actions for employees/admins */}
      {(user?.role === 'admin' || user?.role === 'employee') && (
        <div className="card">
          <h2>الإجراءات</h2>
          <div className="form-group">
            <label>تغيير الحالة</label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updateStatusMutation.isLoading}
            >
              <option value="preparing">قيد التجهيز</option>
              <option value="assigned">معين</option>
              <option value="in_delivery">قيد التوصيل</option>
              <option value="delivered">تم التسليم</option>
              <option value="device_received">تم الاستلام</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      )}

      {/* Actions for courier users */}
      {user?.role === 'courier' && order.assigned_to === user.id && (
        <>
          {order.status === 'assigned' && (
              <div className="card">
                <h2>استلام الطلب</h2>
                <button
                  onClick={handleReceive}
                  className="btn btn-success"
                  disabled={receiveMutation.isLoading}
                >
                  استلام الطلب
                </button>
              </div>
          )}

          {(order.status === 'in_delivery') && (
            <>
              <div className="card">
                <h2>تحديث حالة الطلب</h2>
                <div className="status-buttons">
                  {order.service_type === 'receive_for_repair' ? (
                    <button
                      onClick={() => handleStatusChange('device_received')}
                      className="btn btn-success"
                      disabled={updateStatusMutation.isLoading}
                    >
                      تم استلام الجهاز
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('delivered')}
                      className="btn btn-success"
                      disabled={updateStatusMutation.isLoading}
                    >
                      تم التسليم
                    </button>
                  )}
                </div>
              </div>

              <div className="card">
                <h2>رفع صورة للجهاز</h2>
                <div className="image-upload-container">
                  <label htmlFor="image-upload" className="image-upload-btn">
                    اضغط لتحميل الصورة
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="image-upload-input"
                    disabled={imageUploadMutation.isLoading}
                  />
                  {imageUploadMutation.isLoading && (
                    <span className="upload-status">جاري الرفع...</span>
                  )}
                </div>
              </div>

              <div className="card">
                <h2>التوقيع الإلكتروني</h2>
                {!showSignature ? (
                  <button
                    onClick={() => setShowSignature(true)}
                    className="btn btn-primary"
                  >
                    إضافة توقيع
                  </button>
                ) : (
                  <div>
                    <div style={{ border: '1px solid #ddd', marginBottom: '10px', borderRadius: '12px' }}>
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
                      />
                    </div>
                    <div className="signature-actions">
                      <button
                        onClick={handleSaveSignature}
                        className="btn btn-success"
                        disabled={signatureMutation.isLoading}
                      >
                        حفظ التوقيع
                      </button>
                      <button
                        onClick={() => {
                          setShowSignature(false);
                          if (signatureRef.current) {
                            signatureRef.current.clear();
                          }
                        }}
                        className="btn btn-secondary"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
                {order.signature && (
                  <div style={{ marginTop: '20px' }}>
                    <strong>التوقيع المحفوظ:</strong>
                    <img src={order.signature.signature_data} alt="توقيع" style={{ maxWidth: '100%', marginTop: '10px', border: '2px solid #ddd', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <div className="card">
                <h2>تسجيل المبلغ المستلم</h2>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="المبلغ"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <button
                    onClick={handlePayment}
                    className="btn btn-success"
                    disabled={paymentMutation.isLoading || !paymentAmount}
                  >
                    تسجيل الدفع
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Images */}
      {order.images && order.images.length > 0 && (
        <div className="card">
          <h2>الصور</h2>
          <div className="images-grid">
            {order.images.map((img: any) => (
              <div key={img.id} className="image-wrapper" onClick={() => handleImageDownload(img.image_path, img.id)}>
                <img
                  src={img.image_path}
                  alt="صورة الطلب"
                  className="downloadable-image"
                />
                <div className="image-overlay">
                  <span className="download-icon">⬇</span>
                  <span className="download-text">اضغط للتحميل</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {order.payments && order.payments.length > 0 && (
        <div className="card">
          <h2>المدفوعات</h2>
          <table className="table">
            <thead>
              <tr>
                <th>المبلغ</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {order.payments.map((payment: any) => (
                <tr key={payment.id}>
                  <td>{payment.amount} د.ع</td>
                  <td>{new Date(payment.payment_date).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

