import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import './CreateOrder.css';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    service_type: '',
    assigned_to: '',
    // Sale fields
    product_name: '',
    barcode: '',
    price: '',
    order_source: '',
    delivery_time: '',
    // Send after repair fields
    device_name_send: '',
    repair_report: '',
    repair_cost: '',
    repair_order_number_send: '',
    accessories: '',
    delivery_time_send: '',
    // Receive for repair fields
    device_name_receive: '',
    device_condition: '',
    initial_report: '',
    repair_order_number_receive: ''
  });

  // Fetch couriers list
  const { data: couriers } = useQuery('couriers', async () => {
    const response = await axios.get('/users', { params: { role: 'courier' } });
    return response.data;
  }, { enabled: user?.role === 'admin' || user?.role === 'employee' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        address: formData.address,
        service_type: formData.service_type
      };

      // Add assigned_to if selected
      if (formData.assigned_to) {
        payload.assigned_to = parseInt(formData.assigned_to);
      }

      // Add fields based on service type
      if (formData.service_type === 'sale') {
        payload.product_name = formData.product_name;
        payload.barcode = formData.barcode;
        payload.price = formData.price;
        payload.order_source = formData.order_source;
        payload.delivery_time = formData.delivery_time;
      } else if (formData.service_type === 'send_after_repair') {
        payload.device_name = formData.device_name_send;
        payload.repair_report = formData.repair_report;
        payload.repair_cost = formData.repair_cost;
        payload.repair_order_number = formData.repair_order_number_send;
        payload.accessories = formData.accessories;
        payload.delivery_time = formData.delivery_time_send;
      } else if (formData.service_type === 'receive_for_repair') {
        payload.device_name = formData.device_name_receive;
        payload.device_condition = formData.device_condition;
        payload.initial_report = formData.initial_report;
        payload.repair_order_number = formData.repair_order_number_receive;
      }

      await axios.post('/orders', payload);
      navigate('/orders/preparing');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order">
      <h1>إنشاء طلب جديد</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <h2>البيانات الأساسية</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label>اسم الزبون *</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>رقم الهاتف *</label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>العنوان *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>نوع الخدمة *</label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            required
          >
            <option value="">اختر نوع الخدمة</option>
            <option value="sale">بيع</option>
            <option value="send_after_repair">إرسال جهاز بعد الصيانة</option>
            <option value="receive_for_repair">استلام جهاز للصيانة</option>
          </select>
        </div>

        {(user?.role === 'admin' || user?.role === 'employee') && (
          <div className="form-group">
            <label>تحديد المندوب (اختياري)</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
            >
              <option value="">اختر المندوب</option>
              {couriers?.map((courier: any) => (
                <option key={courier.id} value={courier.id}>
                  {courier.full_name}
                </option>
              ))}
            </select>
            <p className="help-text">إذا تم تحديد مندوب، سيتم تعيين الطلب له مباشرة</p>
          </div>
        )}

        {/* Sale fields */}
        {formData.service_type === 'sale' && (
          <div className="service-fields">
            <h3>تفاصيل البيع</h3>
            <div className="form-row">
              <div className="form-group">
                <label>اسم المادة / الجهاز *</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>الباركود</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>السعر *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>طريقة الطلب</label>
                <select
                  name="order_source"
                  value={formData.order_source}
                  onChange={handleChange}
                >
                  <option value="">اختر المصدر</option>
                  <option value="phone">اتصال</option>
                  <option value="whatsapp">واتساب</option>
                  <option value="social_media">صفحات التواصل</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>وقت التوصيل (اختياري)</label>
              <input
                type="datetime-local"
                name="delivery_time"
                value={formData.delivery_time}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Send after repair fields */}
        {formData.service_type === 'send_after_repair' && (
          <div className="service-fields">
            <h3>تفاصيل إرسال الجهاز بعد الصيانة</h3>
            <div className="form-group">
              <label>اسم الجهاز *</label>
              <input
                type="text"
                name="device_name_send"
                value={formData.device_name_send}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>تقرير الجهاز (ملخص حالة الصيانة) *</label>
              <textarea
                name="repair_report"
                value={formData.repair_report}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>كلفة الصيانة *</label>
                <input
                  type="number"
                  name="repair_cost"
                  value={formData.repair_cost}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>رقم طلبية الصيانة</label>
                <input
                  type="text"
                  name="repair_order_number_send"
                  value={formData.repair_order_number_send}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>الملحقات (إن وجدت)</label>
                <input
                  type="text"
                  name="accessories"
                  value={formData.accessories}
                  onChange={handleChange}
                  placeholder="مثال: شاحن، كفر، إلخ"
                />
              </div>
              <div className="form-group">
                <label>وقت التوصيل</label>
                <input
                  type="datetime-local"
                  name="delivery_time_send"
                  value={formData.delivery_time_send}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>توثيق حالة الجهاز قبل التوصيل</label>
              <p className="help-text">يمكن رفع الصور بعد إنشاء الطلب من صفحة تفاصيل الطلب</p>
            </div>
          </div>
        )}

        {/* Receive for repair fields */}
        {formData.service_type === 'receive_for_repair' && (
          <div className="service-fields">
            <h3>تفاصيل استلام الجهاز للصيانة</h3>
            <div className="form-group">
              <label>اسم الجهاز *</label>
              <input
                type="text"
                name="device_name_receive"
                value={formData.device_name_receive}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>حالة الجهاز عند الاستلام *</label>
              <textarea
                name="device_condition"
                value={formData.device_condition}
                onChange={handleChange}
                required
                placeholder="مثلاً: مكسور شاشة، لا يعمل، إلخ"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>التقرير الأولي للحالة *</label>
              <textarea
                name="initial_report"
                value={formData.initial_report}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>رقم طلبية الصيانة (إن وجد)</label>
              <input
                type="text"
                name="repair_order_number_receive"
                value={formData.repair_order_number_receive}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ الطلب'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/orders/preparing')}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

