import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './Admin.module.css';
import { Order, OrderStatus } from '@/types/order';
import { checkAdminSession } from '../../utils/auth';
import AdminNavigation from '@/components/AdminNav/AdminNavigation';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await checkAdminSession();
      if (!isAdmin) {
        router.push('/login');
      }
    };
    
    checkAdmin();
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Add status filter to URL if not 'all'
      let url = `/api/orders?page=${currentPage}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdateStatusLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        
        // Update the order in state
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        // If it's the selected order in detail view, update that too
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        setSuccess(`Order status updated to ${newStatus} successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update order status');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Error updating order status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdateStatusLoading(false);
    }
  };
  
  // Format date to local date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get appropriate status badge class
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const handleLogout = () => {
    router.push('/admin');
  };

  return (
    <>
      <Head>
        <title>Order Management | Admin | Cakelandia</title>
      </Head>
      <div className={styles.adminContainer}>
        <header className={styles.adminHeader}>
          <h1>Order Management</h1>
          <div className={styles.headerButtons}>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </header>
        
        <AdminNavigation />
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <div className={styles.adminContent}>
          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OrderStatus | 'all');
                  setCurrentPage(1); // Reset to page 1 on filter change
                }}
                className={styles.filterSelect}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.noOrdersMessage}>
              <p>No orders found{statusFilter !== 'all' ? ` with status: ${statusFilter}` : ''}.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.trackingNumber}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.customerName}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.viewButton}
                            onClick={() => handleViewOrder(order)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Order Detail Modal */}
        {isDetailModalOpen && selectedOrder && (
          <div className={styles.modalBackdrop} onClick={handleCloseModal}>
            <div 
              className={styles.modalContent} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Order #{selectedOrder.trackingNumber}</h2>
                <button 
                  onClick={handleCloseModal} 
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.orderInfo}>
                  <div className={styles.infoSection}>
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    {selectedOrder.customerPhone && (
                      <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                    )}
                    <p><strong>Address:</strong> {selectedOrder.address}</p>
                  </div>

                  <div className={styles.infoSection}>
                    <h3>Order Details</h3>
                    <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p>
                      <strong>Status:</strong> 
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    {selectedOrder.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p className={styles.orderNotes}>{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.orderItems}>
                  <h3>Items</h3>
                  <table className={styles.orderItemsTable}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className={styles.productInfo}>
                              <div className={styles.productImage}>
                                <img src={item.product.image} alt={item.product.name} />
                              </div>
                              <span>{item.product.name}</span>
                            </div>
                          </td>
                          <td>${item.product.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className={styles.orderTotal}>Total:</td>
                        <td>${selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className={styles.statusActions}>
                  <h3>Update Status</h3>
                  <div className={styles.statusButtons}>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')}
                      className={`${styles.statusButton} ${selectedOrder.status === 'pending' ? styles.activeStatus : ''}`}
                      disabled={updateStatusLoading || selectedOrder.status === 'pending'}
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                      className={`${styles.statusButton} ${selectedOrder.status === 'processing' ? styles.activeStatus : ''}`}
                      disabled={updateStatusLoading || selectedOrder.status === 'processing'}
                    >
                      Processing
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                      className={`${styles.statusButton} ${selectedOrder.status === 'shipped' ? styles.activeStatus : ''}`}
                      disabled={updateStatusLoading || selectedOrder.status === 'shipped'}
                    >
                      Shipped
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className={`${styles.statusButton} ${selectedOrder.status === 'delivered' ? styles.activeStatus : ''}`}
                      disabled={updateStatusLoading || selectedOrder.status === 'delivered'}
                    >
                      Delivered
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      className={`${styles.statusButton} ${selectedOrder.status === 'cancelled' ? styles.activeStatus : ''}`}
                      disabled={updateStatusLoading || selectedOrder.status === 'cancelled'}
                    >
                      Cancelled
                    </button>
                  </div>
                  {updateStatusLoading && (
                    <div className={styles.loadingIndicator}>Updating status...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
