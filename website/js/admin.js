// Admin Portal JavaScript
import { supabase } from './supabase.js';
import { checkUser } from './auth.js';

// Check if user is admin
async function checkAdminAccess() {
  const user = await checkUser();
  if (!user) {
    window.location.href = 'auth.html';
    return false;
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!data?.is_admin) {
      alert('Access denied. Admin privileges required.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    alert('Error verifying admin access.');
    window.location.href = 'index.html';
    return false;
  }
}

// Tab switching
function initTabs() {
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all tabs
      tabLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab
      link.classList.add('active');
      const tabId = link.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      // Load tab content
      loadTabContent(tabId);
    });
  });
}

// Load content for each tab
async function loadTabContent(tabId) {
  switch(tabId) {
    case 'dashboard':
      await loadDashboardStats();
      break;
    case 'products':
      await loadProductsManagement();
      break;
    case 'orders':
      await loadOrdersManagement();
      break;
    case 'users':
      await loadUsersManagement();
      break;
  }
}

// Dashboard Stats
async function loadDashboardStats() {
  try {
    // Get total products
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total orders
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total users
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Update stats
    document.getElementById('total-products').textContent = productsCount || 0;
    document.getElementById('total-orders').textContent = ordersCount || 0;
    document.getElementById('total-users').textContent = usersCount || 0;
    document.getElementById('total-revenue').textContent = '$0'; // Would need order data

    // Load recent activity
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const activityDiv = document.getElementById('recent-activity');
    if (recentOrders && recentOrders.length > 0) {
      activityDiv.innerHTML = recentOrders.map(order =>
        `<div style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>Order #${order.id}</strong> - ${order.status} - $${order.total_amount}
          <br><small>${new Date(order.created_at).toLocaleDateString()}</small>
        </div>`
      ).join('');
    } else {
      activityDiv.innerHTML = '<p>No recent activity</p>';
    }

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

// Products Management
async function loadProductsManagement() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const productsList = document.getElementById('products-list');
    if (products && products.length > 0) {
      productsList.innerHTML = `
        <table class="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Color</th>
              <th>Thickness</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.size || '-'}</td>
                <td>${product.color || '-'}</td>
                <td>${product.thickness_microns || '-'} microns</td>
                <td>$${product.price_per_1000}</td>
                <td>
                  <button class="btn btn-small" onclick="editProduct(${product.id})">Edit</button>
                  <button class="btn btn-small" style="background: #ff3b30;" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      productsList.innerHTML = '<p>No products found</p>';
    }

    // Add product form handler
    const addForm = document.getElementById('add-product-form');
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const productData = {
        name: document.getElementById('product-name').value,
        size: document.getElementById('product-size').value,
        color: document.getElementById('product-color').value,
        thickness_microns: parseInt(document.getElementById('product-thickness').value),
        price_per_1000: parseFloat(document.getElementById('product-price').value),
        default_order_quantity: parseInt(document.getElementById('product-quantity').value),
        description: document.getElementById('product-description').value
      };

      try {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;

        alert('Product added successfully!');
        addForm.reset();
        loadProductsManagement(); // Reload the list
        loadDashboardStats(); // Update stats

      } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
      }
    });

  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Delete product
window.deleteProduct = async function(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    alert('Product deleted successfully!');
    loadProductsManagement();
    loadDashboardStats();

  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product: ' + error.message);
  }
};

// Edit product (placeholder - would need a modal)
window.editProduct = function(productId) {
  alert('Edit functionality would open a modal to edit product #' + productId);
};

// Orders Management
async function loadOrdersManagement() {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (
          full_name,
          phone,
          email
        )
      `)
      .order('created_at', { ascending: false });

    const ordersList = document.getElementById('orders-list');
    if (orders && orders.length > 0) {
      ordersList.innerHTML = `
        <table class="product-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.id}</td>
                <td>${order.profiles?.full_name || 'N/A'}</td>
                <td><span class="status ${order.status}">${order.status}</span></td>
                <td>$${order.total_amount}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <button class="btn btn-small" onclick="viewOrder(${order.id})">View</button>
                  <button class="btn btn-small" onclick="updateOrderStatus(${order.id}, '${order.status}')">Update</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      ordersList.innerHTML = '<p>No orders found</p>';
    }

  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

// Users Management
async function loadUsersManagement() {
  try {
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const usersList = document.getElementById('users-list');
    if (users && users.length > 0) {
      usersList.innerHTML = `
        <table class="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Admin</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.full_name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.is_admin ? 'Yes' : 'No'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button class="btn btn-small" onclick="toggleAdmin(${user.user_id}, ${user.is_admin})">
                    ${user.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      usersList.innerHTML = '<p>No users found</p>';
    }

  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Toggle admin status
window.toggleAdmin = async function(userId, currentStatus) {
  const action = currentStatus ? 'remove admin privileges from' : 'grant admin privileges to';
  if (!confirm(`Are you sure you want to ${action} this user?`)) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('user_id', userId);

    if (error) throw error;

    alert(`User ${action.replace('privileges ', '')} successfully!`);
    loadUsersManagement();

  } catch (error) {
    console.error('Error updating admin status:', error);
    alert('Error updating user: ' + error.message);
  }
};

// Order functions
window.viewOrder = function(orderId) {
  alert('View order details for order #' + orderId);
};

window.updateOrderStatus = function(orderId, currentStatus) {
  const newStatus = prompt('Enter new status (pending/processing/ready/completed):', currentStatus);
  if (!newStatus) return;

  // Would implement status update logic here
  alert('Order status update functionality would be implemented here');
};

// Initialize admin panel
async function initAdminPanel() {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) return;

  initTabs();
  loadTabContent('dashboard'); // Load dashboard by default
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
  initAdminPanel();
}

export { initAdminPanel };