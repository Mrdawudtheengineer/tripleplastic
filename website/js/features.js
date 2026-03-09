// Quote Request & Bulk Calculator Functions

export function initQuoteModal() {
  const modal = document.getElementById('quote-modal');
  const openBtn = document.querySelector('[data-quote-open]');
  const closeBtn = document.querySelector('.quote-close');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('open');
    });
  }

  // Close on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  // Handle form submission
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(quoteForm);
      const message = `Quote Request: Product: ${formData.get('product')}, Quantity: ${formData.get('quantity')}, Details: ${formData.get('details')}`;
      
      // Send via Formspree or similar
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'message';
        hiddenInput.value = message;
        contactForm.appendChild(hiddenInput);
      }
      
      alert('Quote request submitted! We will contact you shortly.');
      if (modal) modal.classList.remove('open');
      quoteForm.reset();
    });
  }
}

export function initBulkCalculator() {
  const quantityInput = document.getElementById('bulk-quantity');
  const priceInput = document.getElementById('bulk-price');
  const resultElement = document.querySelector('.calculator-result');

  const updateCalculation = () => {
    const quantity = parseInt(quantityInput?.value) || 0;
    const price = parseFloat(priceInput?.value) || 0;
    const total = quantity * price;

    if (resultElement) {
      resultElement.innerHTML = `
        <div class="label">Total Cost</div>
        <div>$${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div style="font-size: 0.9rem; color: var(--gray); margin-top: 12px;">
          ${quantity.toLocaleString()} units × $${price.toFixed(2)} per 1k
        </div>
      `;
    }
  };

  if (quantityInput) quantityInput.addEventListener('input', updateCalculation);
  if (priceInput) priceInput.addEventListener('input', updateCalculation);
  
  // Initial calculation
  updateCalculation();
}

export function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
          }
        });
        
        // Toggle current item
        item.classList.toggle('open');
      });
    }
  });
}

// Initialize all on document ready
export function initializeInteractiveFeatures() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initQuoteModal();
      initBulkCalculator();
      initFAQAccordion();
    });
  } else {
    initQuoteModal();
    initBulkCalculator();
    initFAQAccordion();
  }
}

// Auto-initialize when imported
initializeInteractiveFeatures();
