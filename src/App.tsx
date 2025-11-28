import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import PreparingOrders from './pages/PreparingOrders';
import SentOrders from './pages/SentOrders';
import OrdersToReceive from './pages/OrdersToReceive';
import OrderDetails from './pages/OrderDetails';
import CourierDashboard from './pages/CourierDashboard';
import AdminPanel from './pages/AdminPanel';
import Users from './pages/Users';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {(user?.role === 'admin' || user?.role === 'employee') && (
          <>
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="orders/preparing" element={<PreparingOrders />} />
            <Route path="orders/sent" element={<SentOrders />} />
            <Route path="orders/to-receive" element={<OrdersToReceive />} />
          </>
        )}
        {user?.role === 'courier' && (
          <Route path="courier" element={<CourierDashboard />} />
        )}
        {user?.role === 'admin' && (
          <>
            <Route path="admin" element={<AdminPanel />} />
            <Route path="users" element={<Users />} />
          </>
        )}
        <Route path="orders/:id" element={<OrderDetails />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;




