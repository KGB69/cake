import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNavigation from '@/components/admin/AdminNavigation';
import styles from '@/styles/Admin.module.css';
import dashboardStyles from '@/styles/Dashboard.module.css';
import { Order } from '@/types/order';
import { Product } from '@/types/product';

type AnalyticsData = {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  topProducts: Array<{id: string; name: string; totalSold: number; revenue: number}>;
  lowStockProducts: Array<{id: string; name: string; stock: number}>;
  outOfStockProducts: number;
  totalInventoryValue: number;
};

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    topProducts: [],
    lowStockProducts: [],
    outOfStockProducts: 0,
    totalInventoryValue: 0
  });
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    
    // Fetch data
    Promise.all([
      fetch('/api/orders').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ])
      .then(([ordersData, productsData]) => {
        if (ordersData.orders && productsData.products) {
          setOrders(ordersData.orders);
          setProducts(productsData.products);
          calculateAnalytics(ordersData.orders, productsData.products, timeRange);
        }
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router, timeRange]);

  const calculateAnalytics = (ordersData: Order[], productsData: Product[], range: TimeRange) => {
    // Filter orders by time range
    const filteredOrders = filterOrdersByTimeRange(ordersData, range);
    
    // Calculate basic metrics
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const pendingOrders = filteredOrders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length;
    const completedOrders = filteredOrders.filter(order => 
      order.status === 'shipped' || order.status === 'delivered'
    ).length;
    
    // Calculate top products
    const productSales = new Map<string, { totalSold: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const currentStats = productSales.get(item.product.id) || { totalSold: 0, revenue: 0 };
        productSales.set(item.product.id, {
          totalSold: currentStats.totalSold + item.quantity,
          revenue: currentStats.revenue + (item.product.price * item.quantity)
        });
      });
    });
    
    const topProducts = Array.from(productSales.entries())
      .map(([id, stats]) => {
        const product = productsData.find(p => p.id === id);
        return {
          id,
          name: product ? product.name : 'Unknown Product',
          totalSold: stats.totalSold,
          revenue: stats.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Inventory analysis
    const lowStockProducts = productsData
      .filter(product => {
        const stock = product.stock || 0;
        return stock > 0 && stock <= 5;
      })
      .map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock || 0
      }))
      .sort((a, b) => a.stock - b.stock); // Sort by lowest stock first
    
    const outOfStockProducts = productsData.filter(product => (product.stock || 0) === 0).length;
    
    const totalInventoryValue = productsData.reduce((sum, product) => {
      return sum + ((product.stock || 0) * product.price);
    }, 0);
    
    setAnalytics({
      totalSales,
      totalOrders,
      averageOrderValue,
      pendingOrders,
      completedOrders,
      topProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue
    });
  };

  const filterOrdersByTimeRange = (orders: Order[], range: TimeRange): Order[] => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        return orders;
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    calculateAnalytics(orders, products, newRange);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - Cakelandia</title>
      </Head>
      
      <div className={styles.adminContainer}>
        <AdminNavigation activePage="dashboard" />
        
        <div className={styles.adminContent}>
          <div className={styles.adminHeader}>
            <h1>Dashboard</h1>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
          
          <div className={dashboardStyles.timeRangeSelector}>
            <span>Time Range:</span>
            <div className={dashboardStyles.timeButtons}>
              <button 
                className={timeRange === 'today' ? dashboardStyles.active : ''}
                onClick={() => handleTimeRangeChange('today')}
              >
                Today
              </button>
              <button 
                className={timeRange === 'week' ? dashboardStyles.active : ''}
                onClick={() => handleTimeRangeChange('week')}
              >
                Last Week
              </button>
              <button 
                className={timeRange === 'month' ? dashboardStyles.active : ''}
                onClick={() => handleTimeRangeChange('month')}
              >
                Last Month
              </button>
              <button 
                className={timeRange === 'year' ? dashboardStyles.active : ''}
                onClick={() => handleTimeRangeChange('year')}
              >
                Last Year
              </button>
              <button 
                className={timeRange === 'all' ? dashboardStyles.active : ''}
                onClick={() => handleTimeRangeChange('all')}
              >
                All Time
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className={styles.loadingSpinner}>Loading dashboard data...</div>
          ) : (
            <div className={dashboardStyles.dashboardGrid}>
              {/* Summary Cards */}
              <div className={dashboardStyles.card}>
                <h3>Total Sales</h3>
                <div className={dashboardStyles.cardValue}>${analytics.totalSales.toFixed(2)}</div>
              </div>
              
              <div className={dashboardStyles.card}>
                <h3>Orders</h3>
                <div className={dashboardStyles.cardValue}>{analytics.totalOrders}</div>
              </div>
              
              <div className={dashboardStyles.card}>
                <h3>Avg. Order Value</h3>
                <div className={dashboardStyles.cardValue}>
                  ${analytics.averageOrderValue.toFixed(2)}
                </div>
              </div>
              
              <div className={dashboardStyles.card}>
                <h3>Pending Orders</h3>
                <div className={dashboardStyles.cardValue}>{analytics.pendingOrders}</div>
              </div>
              
              {/* Top Products */}
              <div className={`${dashboardStyles.wideCard} ${dashboardStyles.productPerformance}`}>
                <h3>Top Products</h3>
                {analytics.topProducts.length > 0 ? (
                  <table className={dashboardStyles.productTable}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topProducts.map(product => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.totalSold}</td>
                          <td>${product.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={dashboardStyles.noData}>No product sales data available for this period.</p>
                )}
              </div>
              
              {/* Order Status */}
              <div className={dashboardStyles.wideCard}>
                <h3>Order Status</h3>
                <div className={dashboardStyles.orderStatusChart}>
                  <div className={dashboardStyles.chartBar}>
                    <div
                      className={dashboardStyles.completedBar}
                      style={{
                        width: `${analytics.totalOrders > 0 
                          ? (analytics.completedOrders / analytics.totalOrders) * 100 
                          : 0}%`
                      }}
                    />
                    <div
                      className={dashboardStyles.pendingBar}
                      style={{
                        width: `${analytics.totalOrders > 0 
                          ? (analytics.pendingOrders / analytics.totalOrders) * 100 
                          : 0}%`
                      }}
                    />
                  </div>
                  <div className={dashboardStyles.chartLegend}>
                    <div className={dashboardStyles.legendItem}>
                      <div className={dashboardStyles.completedIndicator} />
                      <span>Completed ({analytics.completedOrders})</span>
                    </div>
                    <div className={dashboardStyles.legendItem}>
                      <div className={dashboardStyles.pendingIndicator} />
                      <span>Pending/Processing ({analytics.pendingOrders})</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Inventory Alerts */}
              <div className={`${dashboardStyles.wideCard} ${dashboardStyles.inventoryAlerts}`}>
                <h3>Inventory Alerts</h3>
                <div className={dashboardStyles.inventoryCards}>
                  <div className={dashboardStyles.inventoryCard}>
                    <h4>Out of Stock</h4>
                    <div className={`${dashboardStyles.cardValue} ${dashboardStyles.outOfStockValue}`}>
                      {analytics.outOfStockProducts}
                    </div>
                    <p>Products</p>
                  </div>
                  <div className={dashboardStyles.inventoryCard}>
                    <h4>Low Stock</h4>
                    <div className={`${dashboardStyles.cardValue} ${dashboardStyles.lowStockValue}`}>
                      {analytics.lowStockProducts.length}
                    </div>
                    <p>Products</p>
                  </div>
                  <div className={dashboardStyles.inventoryCard}>
                    <h4>Inventory Value</h4>
                    <div className={`${dashboardStyles.cardValue}`}>
                      ${analytics.totalInventoryValue.toFixed(2)}
                    </div>
                    <p>Total Value</p>
                  </div>
                </div>
                
                {analytics.lowStockProducts.length > 0 && (
                  <div className={dashboardStyles.lowStockTable}>
                    <h4>Low Stock Items</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Stock</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.lowStockProducts.map(product => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>
                              <span className={dashboardStyles.stockBadge}>
                                {product.stock}
                              </span>
                            </td>
                            <td>
                              <a href={`/admin/products?edit=${product.id}#productForm`} className={dashboardStyles.editLink}>
                                Update Stock
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {analytics.lowStockProducts.length === 0 && analytics.outOfStockProducts === 0 && (
                  <p className={dashboardStyles.noAlerts}>No inventory alerts at this time.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
