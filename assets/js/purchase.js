// assets/js/purchase.js
class PurchaseManager {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.init();
    }

    init() {
        this.loadUser();
        this.loadOrders();
    }

    loadUser() {
        const saved = localStorage.getItem('current_user');
        this.currentUser = saved ? JSON.parse(saved) : null;
        if (!this.currentUser) {
            alert('Please login to view your purchases.');
            window.location.href = '../login/login.html';
        }
    }

    async loadOrders() {
        try {
            // ប្រសិនបើអ្នកមាន API ពិតប្រាកដ ប្រើ៖
            // const res = await fetch(`${API_URL}/orders?email=${encodeURIComponent(this.currentUser.email)}`);
            // this.orders = await res.json();

            // សម្រាប់ Demo (Local Storage)
            this.orders = JSON.parse(localStorage.getItem('ahnajak_orders')) || [];
            
            this.renderOrders();
        } catch (e) {
            console.error('Failed to load orders:', e);
            this.orders = [];
            this.renderOrders();
        }
    }

    renderOrders() {
        const container = document.getElementById('ordersList');
        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-clock-history" style="font-size: 5rem; opacity: 0.3;"></i>
                    <h3 class="mt-3">No Orders Yet</h3>
                    <p class="text-muted">Start shopping to see your order history here.</p>
                    <a href="../index.html" class="btn btn-primary mt-3">
                        <i class="bi bi-shop"></i> Shop Now
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.orders.map(order => `
            <div class="order-card" data-order-id="${order.order_id}">
                <div class="order-header">
                    <div>
                        <span class="order-id">#${order.order_id}</span>
                        <span class="order-date ms-3"><i class="bi bi-calendar3 me-1"></i>${this.formatDate(order.created_at)}</span>
                    </div>
                    <span class="order-status status-${order.status || 'completed'}">
                        ${order.status || 'Completed'}
                    </span>
                </div>

                <div class="order-details">
                    ${(order.items || []).map(item => `
                        <div class="order-item">
                            <div>
                                <strong>${item.name || 'Product'}</strong>
                                <div class="qty">x${item.quantity}</div>
                            </div>
                            <div>$${((item.price || 0) * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-summary">
                    <div><span>Subtotal:</span> <span>$${order.subtotal.toFixed(2)}</span></div>
                    ${order.discount_amount > 0 ? `<div><span>Discount:</span> <span>-$${order.discount_amount.toFixed(2)}</span></div>` : ''}
                    <div class="order-total"><span>Total:</span> <span>$${order.total_price.toFixed(2)}</span></div>
                </div>

                <button class="btn-invoice" onclick="purchaseManager.downloadInvoice('${order.order_id}')">
                    <i class="bi bi-file-earmark-pdf"></i> Download Invoice
                </button>
            </div>
        `).join('');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    downloadInvoice(orderId) {
        const order = this.orders.find(o => o.order_id === orderId);
        if (!order) return;

        // បង្កើត Modal សម្រាប់ Invoice Preview
        const modalHtml = `
            <div class="modal fade invoice-modal" id="invoiceModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Invoice #${order.order_id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="invoice-header">
                                <img src="../assets/images/logo-website.png" alt="Logo" class="invoice-logo">
                                <h2 class="invoice-title">AHNAJAK CODE</h2>
                                <p>Online Shopping Platform</p>
                            </div>
                            
                            <div class="invoice-info">
                                <div>
                                    <div class="invoice-item">Customer</div>
                                    <div class="invoice-value">${this.currentUser?.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div class="invoice-item">Email</div>
                                    <div class="invoice-value">${this.currentUser?.email || 'N/A'}</div>
                                </div>
                                <div>
                                    <div class="invoice-item">Order Date</div>
                                    <div class="invoice-value">${this.formatDate(order.created_at)}</div>
                                </div>
                                <div>
                                    <div class="invoice-item">Status</div>
                                    <div class="invoice-value">${order.status || 'Completed'}</div>
                                </div>
                            </div>

                            <table class="table mt-4">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(order.items || []).map(item => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>${item.quantity}</td>
                                            <td>$${item.price.toFixed(2)}</td>
                                            <td>$${((item.price || 0) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <div class="mt-4 p-3 bg-light rounded">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>$${order.subtotal.toFixed(2)}</span>
                                </div>
                                ${order.discount_amount > 0 ? `
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Discount:</span>
                                    <span>-$${order.discount_amount.toFixed(2)}</span>
                                </div>
                                ` : ''}
                                <div class="d-flex justify-content-between fw-bold fs-5">
                                    <span>Total:</span>
                                    <span>$${order.total_price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                            <button class="btn btn-success" onclick="purchaseManager.generatePDF('${order.order_id}')">
                                <i class="bi bi-download"></i> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // បន្ថែម modal ទៅ body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // បើក modal
        const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
        modal.show();

        // លុប modal នៅពេលបិទ
        modal._element.addEventListener('hidden.bs.modal', () => {
            document.getElementById('invoiceModal').remove();
        });
    }

    generatePDF(orderId) {
        const element = document.querySelector(`[data-order-id="${orderId}"]`);
        if (!element) return;

        // ប្រើ html2pdf.js (ត្រូវដំឡើងជាមុន)
        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: 1,
                filename: `Invoice_${orderId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().from(element).set(opt).save();
        } else {
            alert('PDF generation requires html2pdf.js. Please include it in your project.');
        }
    }
}

// Global instance
window.purchaseManager = new PurchaseManager(); 
