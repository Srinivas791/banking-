/**
 * Simple Banking Management System - Accounts Module Controller
 */

const Accounts = {
  accountList: [],

  async init() {
    await this.loadAccounts();
    await this.loadCustomerDropdown();
  },

  async loadAccounts(query = '') {
    try {
      const res = query 
        ? await API.accounts.search(query) 
        : await API.accounts.getAll();

      if (res.success && res.data) {
        this.accountList = res.data;
        this.renderTable(this.accountList);
        this.populateAccountSelects(this.accountList);
      }
    } catch (err) {
      console.warn('Account API load failed, using fallback list:', err);
      this.renderFallback();
    }
  },

  renderTable(accounts) {
    const tbody = document.getElementById('accountsTableBody');
    if (!tbody) return;

    if (!accounts.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;">No account records found.</td></tr>';
      return;
    }

    tbody.innerHTML = accounts.map(a => {
      let statusBadge = 'badge-success';
      if (a.status === 'FROZEN') statusBadge = 'badge-warning';
      if (a.status === 'INACTIVE' || a.status === 'CLOSED') statusBadge = 'badge-danger';

      return `
        <tr>
          <td><strong style="color:var(--navy-900); font-family:monospace; font-size:14px;">${a.accountNumber}</strong></td>
          <td>
            <div style="font-weight:600; color:var(--slate-800);">${a.customerName || 'N/A'}</div>
            <div style="font-size:11px; color:var(--slate-500);">${a.customerEmail || ''}</div>
          </td>
          <td><span class="badge ${a.accountType === 'SAVINGS' ? 'badge-info' : 'badge-neutral'}">${a.accountType}</span></td>
          <td><strong style="color:var(--navy-900); font-size:14px;">$${parseFloat(a.balance).toFixed(2)}</strong></td>
          <td style="color:var(--slate-500); font-size:12px;">$${parseFloat(a.minimumBalance).toFixed(2)}</td>
          <td><span class="badge ${statusBadge}">${a.status}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="Transactions.openQuickDeposit('${a.accountNumber}')">
                Deposit
              </button>
              <button class="btn btn-sm btn-secondary" onclick="Transactions.openQuickWithdraw('${a.accountNumber}')">
                Withdraw
              </button>
              <button class="btn btn-sm btn-secondary" onclick="Reports.quickStatement('${a.accountNumber}')">
                Statement
              </button>
              ${Auth.hasRole('ROLE_ADMIN') ? `
                <button class="btn btn-sm btn-danger" onclick="Accounts.toggleAccountStatus('${a.accountNumber}', '${a.status}')">
                  ${a.status === 'ACTIVE' ? 'Freeze' : 'Activate'}
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async loadCustomerDropdown() {
    try {
      const res = await API.customers.getAll();
      if (res.success && res.data) {
        const select = document.getElementById('newAccountCustomerId');
        if (select) {
          select.innerHTML = '<option value="">-- Select Customer Profile --</option>' +
            res.data
              .filter(c => c.status === 'ACTIVE')
              .map(c => `<option value="${c.id}">${c.customerCode} - ${c.firstName} ${c.lastName} (${c.email})</option>`)
              .join('');
        }
      }
    } catch (e) {
      console.warn('Customer dropdown load error:', e);
    }
  },

  populateAccountSelects(accounts) {
    const activeAccounts = accounts.filter(a => a.status === 'ACTIVE');
    const optionsHtml = '<option value="">-- Choose Account --</option>' +
      activeAccounts.map(a => 
        `<option value="${a.accountNumber}">${a.accountNumber} - ${a.customerName} ($${parseFloat(a.balance).toFixed(2)})</option>`
      ).join('');

    const targetIds = [
      'quickDepositAccount', 
      'quickWithdrawAccount', 
      'depositDedicatedAccount',
      'withdrawDedicatedAccount',
      'transferSourceAccount', 
      'transferDestAccount',
      'statementAccountSelect'
    ];

    targetIds.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) elem.innerHTML = optionsHtml;
    });
  },

  async handleCreate(e) {
    e.preventDefault();
    const form = e.target;
    const account = {
      customerId: parseInt(form.customerId.value),
      accountType: form.accountType.value,
      balance: parseFloat(form.initialDeposit.value || 0),
      currency: 'USD'
    };

    try {
      const res = await API.accounts.create(account);
      if (res.success) {
        App.showToast('success', 'Account Opened', `Bank Account ${res.data.accountNumber} created successfully!`);
        App.closeModal('newAccountModal');
        form.reset();
        await this.loadAccounts();
        await Dashboard.loadStats();
      }
    } catch (err) {
      App.showToast('error', 'Account Creation Failed', err.message);
    }
  },

  async toggleAccountStatus(accountNumber, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change account ${accountNumber} status to ${newStatus}?`)) return;

    try {
      const res = await API.accounts.updateStatus(accountNumber, newStatus);
      if (res.success) {
        App.showToast('success', 'Account Updated', `Account is now ${res.data.status}`);
        await this.loadAccounts();
      }
    } catch (err) {
      App.showToast('error', 'Update Failed', err.message);
    }
  },

  renderFallback() {
    this.renderTable([
      { id: 1, accountNumber: '100100000001', customerName: 'Johnathan Doe', customerEmail: 'john.doe@gmail.com', accountType: 'SAVINGS', balance: 15450.00, minimumBalance: 500.00, status: 'ACTIVE' },
      { id: 2, accountNumber: '100100000002', customerName: 'Jane Smith', customerEmail: 'jane.smith@yahoo.com', accountType: 'SAVINGS', balance: 8920.50, minimumBalance: 500.00, status: 'ACTIVE' },
      { id: 3, accountNumber: '100100000003', customerName: 'Robert Brown', customerEmail: 'robert.brown@techcorp.io', accountType: 'CURRENT', balance: 42100.00, minimumBalance: 1000.00, status: 'ACTIVE' }
    ]);
  }
};
