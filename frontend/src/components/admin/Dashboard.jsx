import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown,
  Users,
  TrendingUp 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    revenue: { total: 0, monthlyGrowth: 0 },
    orders: { total: 0, monthlyGrowth: 0 },
    customers: { total: 0, monthlyGrowth: 0 },
    products: { lowStock: 0 },
    recentOrders: [],
    lowStockProducts: []
  });
  const [salesData, setSalesData] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('monthly');
  const [ordersPeriod, setOrdersPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesAnalytics();
  }, [salesPeriod]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesAnalytics = async () => {
    try {
      const startDate = getStartDate(salesPeriod);
      const response = await api.get('/analytics/sales', {
        params: {
          startDate,
          endDate: new Date().toISOString(),
          groupBy: salesPeriod
        }
      });
      setSalesData(response.data);
    } catch (error) {
      toast.error('Failed to load sales analytics');
    }
  };

  const getStartDate = (period) => {
    const date = new Date();
    switch (period) {
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    return date.toISOString();
  };

  const formatCurrency = (value) => {
    return `Rs. ${value.toLocaleString()}`;
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', changePeriod = 'vs last month' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' && title.includes('Sales') 
              ? formatCurrency(value)
              : value?.toLocaleString() || '0'}
          </h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {changeType === 'positive' ? (
            <ArrowUp className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}%
          </span>
          <span className="text-sm text-gray-500 ml-1.5">{changePeriod}</span>
        </div>
      )}
    </div>
  );

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchDashboardData}>
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Sales"
          value={dashboardData.revenue.total}
          icon={DollarSign}
          change={dashboardData.revenue.monthlyGrowth}
          changeType={dashboardData.revenue.monthlyGrowth >= 0 ? 'positive' : 'negative'}
        />
        <StatCard 
          title="Total Orders"
          value={dashboardData.orders.total}
          icon={ShoppingCart}
          change={dashboardData.orders.monthlyGrowth}
          changeType={dashboardData.orders.monthlyGrowth >= 0 ? 'positive' : 'negative'}
        />
        <StatCard 
          title="Total Customers"
          value={dashboardData.customers.total}
          icon={Users}
          change={dashboardData.customers.monthlyGrowth}
          changeType={dashboardData.customers.monthlyGrowth >= 0 ? 'positive' : 'negative'}
        />
        <StatCard 
          title="Low Stock Items"
          value={dashboardData.products.lowStock}
          icon={AlertTriangle}
          changeType="negative"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Sales Overview</h2>
            <select
              value={salesPeriod}
              onChange={(e) => setSalesPeriod(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="h-80">
            {salesData?.salesData && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.date" />
                  <YAxis tickFormatter={(value) => `Rs.${value/1000}k`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Orders Overview</h2>
            <select
              value={ordersPeriod}
              onChange={(e) => setOrdersPeriod(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="h-80">
            {salesData?.salesData && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {(dashboardData?.recentOrders || []).map((order) => (
              <div key={order._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">
                        #{order._id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {(dashboardData?.lowStockProducts || []).map((product) => (
              <div key={product._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Threshold: {product.stockThreshold} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      product.stock <= product.stockThreshold / 2 
                        ? 'text-red-600' 
                        : 'text-orange-600'
                    }`}>
                      {product.stock} units left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;