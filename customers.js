/**
 * Simple Banking Management System - Customers Module Controller
 */

const Customers = {
  customerList: [],

  async init() {
    await this.loadCustomers();
  },

  async loadCustomers(query = '') {
    try {
      const res = query 
        ? await API.customers.search(query) 
        : await API.customers.getAll();

      if (res.success && res.data) {
        this.customerList = res.data;
        this.renderTable(this.customerList);
      }
    } catch (err) {
      console.warn('Customer API load failed, using fallback list:', err);
      this.renderFallback();
    }
  },

  renderTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (!customers.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;">No customer records found.</td></tr>';
      return;
    }

    tbody.innerHTML = customers.map(c => {
      const statusClass = c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
      return `
        <tr>
          <td><strong style="color:var(--navy-900); font-family:monospace;">${c.customerCode}</strong></td>
          <td>
            <div style="font-weight:600; color:var(--slate-800);">${c.firstName} ${c.lastName}</div>
            <div style="font-size:11px; color:var(--slate-500);">${c.identityNumber}</div>
          </td>
          <td>${c.email}</td>
          <td>${c.phone}</td>
          <td><span class="badge badge-info">${c.accountsCount || 0} Accounts</span></td>
          <td><span class="badge ${statusClass}">${c.status}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="Customers.viewDetails(${c.id})">
                Profile
              </button>
              ${Auth.hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE') ? `
                <button class="btn btn-sm btn-secondary" onclick="Customers.toggleStatus(${c.id})">
                  ${c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async viewDetails(id) {
    try {
      const res = await API.customers.getById(id);
      if (res.success && res.data) {
        const c = res.data;
        
        // Fetch linked accounts
        let accounts = [];
        try {
          const accRes = await API.accounts.getByCustomerId(id);
          if (accRes.success) accounts = accRes.data || [];
        } catch (e) {}

        const modalBody = document.getElementById('customerDetailModalBody');
        if (modalBody) {
          modalBody.innerHTML = `
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; border-bottom:1px solid var(--slate-200); padding-bottom:16px;">
              <div style="width:52px; height:52px; border-radius:50%; background:var(--blue-50); color:var(--blue-600); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700;">
                ${c.firstName.charAt(0)}${c.lastName.charAt(0)}
              </div>
              <div>
                <h3 style="font-size:18px; color:var(--navy-900);">${c.firstName} ${c.lastName}</h3>
                <p style="font-size:12px; color:var(--slate-500);">${c.customerCode} &bull; Member since ${new Date(c.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div style="margin-left:auto;">
                <span class="badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${c.status}</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px;">
              <div>
                <div class="receipt-item-label">Email Address</div>
                <div class="receipt-item-val">${c.email}</div>
              </div>
              <div>
                <div class="receipt-item-label">Phone Number</div>
                <div class="receipt-item-val">${c.phone}</div>
              </div>
              <div>
                <div class="receipt-item-label">National Identity (Aadhaar/SSN)</div>
                <div class="receipt-item-val">${c.identityNumber}</div>
              </div>
              <div>
                <div class="receipt-item-label">Date of Birth</div>
                <div class="receipt-item-val">${c.dateOfBirth || 'N/A'}</div>
              </div>
              <div style="grid-column: span 2;">
                <div class="receipt-item-label">Residential Address</div>
                <div class="receipt-item-val">${c.address || ''}, ${c.city || ''}, ${c.state || ''} ${c.postalCode || ''}</div>
              </div>
            </div>

            <h4 style="font-size:14px; font-weight:700; color:var(--navy-900); margin-bottom:12px; border-top:1px solid var(--slate-200); padding-top:16px;">
              Linked Bank Accounts (${accounts.length})
            </h4>

            ${accounts.length ? `
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${accounts.map(a => `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--slate-50); border:1px solid var(--slate-200); border-radius:var(--radius-sm);">
                    <div>
                      <div style="font-weight:700; font-family:monospace; color:var(--navy-900);">${a.accountNumber}</div>
                      <div style="font-size:11px; color:var(--slate-500);">${a.accountType} &bull; Min Bal: $${a.minimumBalance}</div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-weight:700; color:var(--emerald-600); font-size:15px;">$${parseFloat(a.balance).toFixed(2)}</div>
                      <span class="badge ${a.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}" style="font-size:10px;">${a.status}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color:var(--slate-500); font-size:12px;">No bank accounts linked to this profile yet.</p>'}
          `;
          App.openModal('customerDetailModal');
        }
      }
    } catch (err) {
      App.showToast('error', 'Profile Error', err.message);
    }
  },

  async handleCreate(e) {
    e.preventDefault();
    const form = e.target;
    const customer = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      identityNumber: form.identityNumber.value.trim(),
      dateOfBirth: form.dateOfBirth.value || null,
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      postalCode: form.postalCode.value.trim()
    };

    try {
      const res = await API.customers.create(customer);
      if (res.success) {
        App.showToast('success', 'Customer Created', `Customer ${res.data.customerCode} registered successfully!`);
        App.closeModal('newCustomerModal');
        form.reset();
        await this.loadCustomers();
        await Accounts.loadCustomerDropdown();
      }
    } catch (err) {
      App.showToast('error', 'Registration Failed', err.message);
    }
  },

  async toggleStatus(id) {
    if (!confirm('Are you sure you want to change this customer\'s status?')) return;
    try {
      const res = await API.customers.toggleStatus(id);
      if (res.success) {
        App.showToast('success', 'Status Updated', `Customer is now ${res.data.status}`);
        await this.loadCustomers();
      }
    } catch (err) {
      App.showToast('error', 'Status Update Failed', err.message);
    }
  },

  renderFallback() {
    this.renderTable([
      { id: 1, customerCode: 'CUST-1001', firstName: 'Johnathan', lastName: 'Doe', email: 'john.doe@gmail.com', phone: '+1-555-012-3456', identityNumber: 'NAT-ID-8849201', accountsCount: 2, status: 'ACTIVE' },
      { id: 2, customerCode: 'CUST-1002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@yahoo.com', phone: '+1-555-019-8765', identityNumber: 'NAT-ID-9928374', accountsCount: 1, status: 'ACTIVE' },
      { id: 3, customerCode: 'CUST-1003', firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@techcorp.io', phone: '+1-555-014-9988', identityNumber: 'NAT-ID-3382910', accountsCount: 1, status: 'ACTIVE' }
    ]);
  }
};
