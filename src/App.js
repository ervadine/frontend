import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import ProtectedRoute from './utils/ProtectedRoutes';

// Import the AdminNotificationProvider
import { AdminNotificationProvider } from './context/AdminNotificationContext';

import { getProfile } from "./store/redux/authSlice";

// Authentication Pages
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Search = lazy(() => import("./pages/Search"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const About = lazy(() => import("./pages/About"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// New Pages for Payment Confirmation
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));


// Admin Pages
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminAddProduct = lazy(() => import("./pages/AdminAddProduct"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminAddCategory = lazy(() => import("./pages/AdminAddCategory"));
const AdminSalesReport = lazy(() => import("./pages/AdminSalesReport"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminInventory = lazy(() => import("./pages/AdminInventory"));
const AdminBrands = lazy(() => import("./pages/AdminBrands"));
const AdminNewBrand = lazy(() => import("./pages/AdminNewBrand"));
const AdminEditBrand = lazy(() => import("./pages/AdminEditBrand"));
const AdminOrderEdit = lazy(() => import("./pages/AdminOrderEdit"));
const AdminOrderView = lazy(() => import("./pages/AdminOrderView"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));

// User Pages
const Account = lazy(() => import("./pages/Account"));

// Public Policy Pages
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Policy = lazy(() => import("./pages/Policy"));

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// NotFound Component
const NotFound = () => (
  <div className="container text-center py-5">
    <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary px-6 py-3">
      Go Home
    </a>
  </div>
);

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Routing Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center py-5">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// AppContent component to handle authentication initialization
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuthUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // If token exists, get user profile
          console.log('Token found, fetching user profile...');
          await dispatch(getProfile()).unwrap();
          console.log('User profile loaded successfully');
        } else {
          // No token found, user is not authenticated
          console.log('No token found, user is not authenticated');
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      }
    };

    initAuthUser();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/products" element={<CategoryPage />} />
            <Route path="/tos" element={<TermsOfService />} />
            <Route path="/privacy" element={<Policy />} />
           
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Payment Confirmation Routes */}
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
      
           
            {/* Authentication Routes (only accessible when not logged in) */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />

 <Route  path="/cart"  

 element={
   
                  <Cart />
            
 }
            />


            {/* Protected User Routes (any authenticated user) */}
            
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } 
            />
            <Route  
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes (require admin role) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProducts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products/new" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products/edit/:productId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCategories />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories/new" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddCategory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories/edit/:categoryId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddCategory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics/sales" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSalesReport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminOrders />
                </ProtectedRoute>
              }  
            />
            <Route 
              path="/admin/settings/general" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/customers" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCustomers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/inventory" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminInventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/brands" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminBrands />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/brands/new" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminNewBrand />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/brands/edit/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEditBrand />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/:orderId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminOrderView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/:orderId/edit" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminOrderEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/messages" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminMessages />
                </ProtectedRoute>
              } 
            />

            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </ErrorBoundary>
  );
};

// Main App component - Wrap with AdminNotificationProvider
function App() {
  return (
    <Provider store={store}>
      <AdminNotificationProvider>
        <AppContent />
      </AdminNotificationProvider>
    </Provider>
  );
}

export default App;