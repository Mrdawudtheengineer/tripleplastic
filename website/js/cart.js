// Shopping Cart Management
export class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.initializeUI();
  }

  loadCart() {
    const saved = localStorage.getItem('tripleA_cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('tripleA_cart', JSON.stringify(this.items));
    this.updateCartCount();
  }

  addItem(productId, productName, price, quantity) {
    const existingItem = this.items.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      this.items.push({
        id: productId,
        name: productName,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
    }
    
    this.saveCart();
    this.showNotification(`${productName} added to cart!`);
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  initializeUI() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => this.toggleCart());
    }

    const closeBtn = document.querySelector('.cart-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleCart());
    }

    this.updateCartCount();
  }

  updateCartCount() {
    const countElement = document.querySelector('.cart-count');
    if (countElement) {
      const count = this.getItemCount();
      countElement.textContent = count > 0 ? count : '';
      countElement.style.display = count > 0 ? 'flex' : 'none';
    }
    this.renderCart();
  }

  toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
      modal.classList.toggle('open');
    }
  }

  renderCart() {
    const cartList = document.querySelector('.cart-items-list');
    if (!cartList) return;

    cartList.innerHTML = '';

    if (this.items.length === 0) {
      cartList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Your cart is empty</p>';
      return;
    }

    this.items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div>
          <div style="font-weight: 600; color: var(--black);">${item.name}</div>
          <div style="font-size: 0.9rem; color: var(--gray);">$${item.price} × ${item.quantity}</div>
          <div style="font-weight: 700; color: var(--blue);">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">Remove</button>
      `;
      cartList.appendChild(itemEl);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = parseInt(e.target.dataset.id);
        this.removeItem(productId);
      });
    });

    // Update total
    const totalEl = document.querySelector('.cart-total');
    if (totalEl) {
      totalEl.textContent = `$${this.getTotal().toFixed(2)}`;
    }
  }

  showNotification(message) {
    // Simple notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--blue);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 3000;
      animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize on load
const cart = new ShoppingCart();
export default cart;
