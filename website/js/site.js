import { supabase } from './supabase.js';

// general utilities used across the site

document.addEventListener('DOMContentLoaded', () => {
  // scroll-to-top button
  const scrollBtn = document.createElement('div');
  scrollBtn.id = 'scrollTop';
  scrollBtn.className = 'scroll-top';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.textContent = '↑';
  document.body.appendChild(scrollBtn);
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  // newsletter submission
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async e => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type=email]');
      const email = (input && input.value.trim()) || '';
      if (!email) return;
      try {
        if (supabase) {
          const { error } = await supabase.from('newsletter').insert([{ email }]);
          if (error) throw error;
        } else {
          console.log('newsletter subscribe (mock)', email);
        }
        alert('Thank you for subscribing!');
        newsletterForm.reset();
      } catch (err) {
        console.error('newsletter error', err);
        alert('Subscription failed, please try again later.');
      }
    });
  }

  // lightbox for gallery
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="close-btn" aria-label="Close">&times;</button>
    <div class="lightbox-content"></div>
  `;
  document.body.appendChild(lightbox);
  lightbox.querySelector('.close-btn').addEventListener('click', () => {
    lightbox.style.display = 'none';
  });
  document.body.addEventListener('click', e => {
    const card = e.target.closest('.media-card');
    if (card) {
      const img = card.querySelector('img');
      const vid = card.querySelector('video');
      const content = lightbox.querySelector('.lightbox-content');
      content.innerHTML = '';
      if (img) {
        content.appendChild(img.cloneNode());
      } else if (vid) {
        const clone = vid.cloneNode();
        clone.controls = true;
        content.appendChild(clone);
      }
      lightbox.style.display = 'flex';
    }
  });

  // FAQ toggles
  document.querySelectorAll('.faq-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.nextElementSibling;
      const open = ans.style.display === 'block';
      ans.style.display = open ? 'none' : 'block';
      btn.textContent = btn.textContent.replace(open ? '-' : '+', open ? '+' : '-');
    });
  });

  // simple testimonial slider if present
  const testimonials = [
    {
      text: 'Triple A always delivers on time and the quality is unmatched.',
      author: '– Mekdes, logistics manager'
    },
    {
      text: 'Their custom-thickness films helped us reduce material costs.',
      author: '– Yosef, packaging supplier'
    },
    {
      text: 'Customer service is friendly and responsive. A true Ethiopian success story.',
      author: '– Hana, procurement officer'
    }
  ];
  let currentTest = 0;
  const testContainer = document.querySelector('.testimonial-card');
  const controls = document.querySelectorAll('.testimonial-controls button');
  function renderTest(idx) {
    if (!testContainer) return;
    testContainer.querySelector('p').textContent = testimonials[idx].text;
    testContainer.querySelector('h4').textContent = testimonials[idx].author;
    controls.forEach((b, i) => b.classList.toggle('active', i === idx));
    currentTest = idx;
  }
  if (controls.length && testimonials.length) {
    controls.forEach((btn, i) => btn.addEventListener('click', () => renderTest(i)));
    renderTest(0);
    setInterval(() => renderTest((currentTest + 1) % testimonials.length), 8000);
  }

  // Cart management for products
  window.cart = JSON.parse(localStorage.getItem('cart') || '[]');
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(window.cart));
  }
  function renderCart() {
    const panel = document.querySelector('.cart-panel');
    if (!panel) return;
    const list = panel.querySelector('.cart-items');
    list.innerHTML = '';
    let total = 0;
    window.cart.forEach(item => {
      const row = document.createElement('div');
      row.style.marginBottom = '12px';
      row.innerHTML = `<strong>${item.name}</strong> x${item.qty} - $${(
        item.price * (item.qty / 1000)
      ).toFixed(2)}`;
      list.appendChild(row);
      total += item.price * (item.qty / 1000);
    });
    panel.querySelector('.cart-total').textContent = `Total: $${total.toFixed(2)}`;
  }
  window.addToCart = function (id, name, price, qty = 1) {
    const existing = window.cart.find(i => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      window.cart.push({ id, name, price, qty });
    }
    saveCart();
    renderCart();
    showCart();
  };
  window.showCart = function () {
    const panel = document.querySelector('.cart-panel');
    if (panel) panel.classList.add('open');
  };
  window.hideCart = function () {
    const panel = document.querySelector('.cart-panel');
    if (panel) panel.classList.remove('open');
  };
  renderCart();
});
