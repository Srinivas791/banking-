/**
 * Simple Banking Management System - Transactions Module Controller
 * Handles Deposits, Withdrawals, Ledger views, and Printable Receipts.
 */

const Transactions = {
  transactionList: [],

  async init() {
    await this.loadTransactions();
  },

  async loadTransactions() {
    try {
      const res = await API.transactions.getAll();
      if (res.success && res.data) {
        this.transactionList = res.data;
        this.renderTable(this.transactionList);
      }
    } catch (err) {
      console.warn('Transactions API load failed, using fallback list:', err);
      this.renderFallback();
    }
  },

  async filterLedger() {
    const type = document.getElementById('txnTypeFilter')?.value || null;
    const query = document.getElementById('txnSearchInput')?.value || null;

    try {
      const res = await API.transactions.filter(type, query, null, null);
      if (res.success && res.data) {
        this.renderTable(res.data);
      }
    } catch (e) {
      console.warn('Filter failed:', e);
    }
  },

  renderTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    if (!transactions.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;">No transaction records matched your filter.</td></tr>';
      return;
    }

    tbody.innerHTML = transactions.map(t => {
      const isCredit = t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_CREDIT';
      const typeBadgeClass = isCredit ? 'badge-success' : 'badge-danger';
      const dateStr = new Date(t.createdAt).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <tr>
          <td><strong style="color:var(--navy-900); font-family:monospace;">${t.transactionRef}</strong></td>
          <td>${dateStr}</td>
          <td>
            <div style="font-family:monospace; font-weight:700; color:var(--navy-900);">${t.accountNumber}</div>
            <div style="font-size:11px; color:var(--slate-500);">${t.customerName || ''}</div>
          </td>
          <td><span class="badge ${typeBadgeClass}">${t.transactionType.replace('_', ' ')}</span></td>
          <td class="${isCredit ? 'txn-amount-credit' : 'txn-amount-debit'}" style="font-size:14px;">
            ${isCredit ? '+' : '-'}$${parseFloat(t.amount).toFixed(2)}
          </td>
          <td style="color:var(--slate-600); font-size:12px;">$${parseFloat(t.balanceAfter).toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="Transactions.viewReceipt('${t.transactionRef}')">
              Receipt
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openQuickDeposit(accountNumber = '') {
    const select = document.getElementById('quickDepositAccount');
    if (select && accountNumber) select.value = accountNumber;
    App.openModal('quickDepositModal');
  },

  openQuickWithdraw(accountNumber = '') {
    const select = document.getElementById('quickWithdrawAccount');
    if (select && accountNumber) select.value = accountNumber;
    App.openModal('quickWithdrawModal');
  },

  async handleDeposit(e) {
    e.preventDefault();
    const form = e.target;
    const accountNumber = form.accountNumber.value;
    const amount = parseFloat(form.amount.value);
    const description = form.description.value;

    if (!accountNumber || isNaN(amount) || amount <= 0) {
      App.showToast('error', 'Validation Error', 'Please select a valid account and enter an amount greater than 0.');
      return;
    }

    try {
      const res = await API.transactions.deposit(accountNumber, amount, description);
      if (res.success && res.data) {
        App.closeModal('quickDepositModal');
        form.reset();
        App.showToast('success', 'Deposit Confirmed', `$${amount.toFixed(2)} successfully credited to Account ${accountNumber}`);
        
        await this.loadTransactions();
        await Accounts.loadAccounts();
        await Dashboard.loadStats();
        
        // Show printable receipt immediately
        this.renderReceiptModal(res.data);
      }
    } catch (err) {
      App.showToast('error', 'Deposit Failed', err.message);
    }
  },

  async handleWithdraw(e) {
    e.preventDefault();
    const form = e.target;
    const accountNumber = form.accountNumber.value;
    const amount = parseFloat(form.amount.value);
    const description = form.description.value;

    if (!accountNumber || isNaN(amount) || amount <= 0) {
      App.showToast('error', 'Validation Error', 'Please select a valid account and enter an amount greater than 0.');
      return;
    }

    try {
      const res = await API.transactions.withdraw(accountNumber, amount, description);
      if (res.success && res.data) {
        App.closeModal('quickWithdrawModal');
        form.reset();
        App.showToast('success', 'Withdrawal Confirmed', `$${amount.toFixed(2)} successfully debited from Account ${accountNumber}`);
        
        await this.loadTransactions();
        await Accounts.loadAccounts();
        await Dashboard.loadStats();
        
        // Show printable receipt immediately
        this.renderReceiptModal(res.data);
      }
    } catch (err) {
      App.showToast('error', 'Withdrawal Failed', err.message);
    }
  },

  async viewReceipt(ref) {
    try {
      const res = await API.transactions.getByRef(ref);
      if (res.success && res.data) {
        this.renderReceiptModal(res.data);
      }
    } catch (err) {
      App.showToast('error', 'Receipt Error', err.message);
    }
  },

  renderReceiptModal(txn) {
    const isCredit = txn.transactionType === 'DEPOSIT' || txn.transactionType === 'TRANSFER_CREDIT';
    const container = document.getElementById('receiptModalContent');
    if (!container) return;

    const formattedDate = new Date(txn.createdAt).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    container.innerHTML = `
      <div class="receipt-box" id="printableReceiptBox">
        <div class="receipt-header">
          <div style="font-size:24px; font-weight:800; color:var(--navy-900); letter-spacing:1px;">
            APEX GLOBAL BANK
          </div>
          <div style="font-size:11px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px;">
            Central Banking & Financial Services &bull; Academic Branch #0102
          </div>
          <div class="receipt-type" style="margin-top:6px;">
            Official Electronic Transaction Confirmation
          </div>
        </div>

        <div class="receipt-amount-banner">
          <div style="font-size:12px; text-transform:uppercase; opacity:0.85; letter-spacing:0.5px;">Transaction Amount</div>
          <div class="amt">${isCredit ? '+' : '-'}$${parseFloat(txn.amount).toFixed(2)} USD</div>
          <div style="font-size:11px; opacity:0.9; margin-top:2px;">Status: ${txn.status}</div>
        </div>

        <div class="receipt-details-grid">
          <div>
            <div class="receipt-item-label">Transaction Reference</div>
            <div class="receipt-item-val" style="font-family:monospace; color:var(--blue-600);">${txn.transactionRef}</div>
          </div>
          <div>
            <div class="receipt-item-label">Transaction Date & Time</div>
            <div class="receipt-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="receipt-item-label">Account Number</div>
            <div class="receipt-item-val" style="font-family:monospace;">${txn.accountNumber}</div>
          </div>
          <div>
            <div class="receipt-item-label">Account Holder Name</div>
            <div class="receipt-item-val">${txn.customerName || 'N/A'}</div>
          </div>
          <div>
            <div class="receipt-item-label">Operation Type</div>
            <div class="receipt-item-val">${txn.transactionType.replace('_', ' ')}</div>
          </div>
          <div>
            <div class="receipt-item-label">Post-Transaction Balance</div>
            <div class="receipt-item-val" style="color:var(--emerald-600);">$${parseFloat(txn.balanceAfter).toFixed(2)}</div>
          </div>
          <div style="grid-column: span 2;">
            <div class="receipt-item-label">Description / Remarks</div>
            <div class="receipt-item-val">${txn.description || 'N/A'}</div>
          </div>
        </div>

        <div style="border-top:1px dashed var(--slate-300); padding-top:14px; text-align:center; font-size:11px; color:var(--slate-500);">
          This is a computer-generated bank electronic advice for academic demonstration and requires no physical signature.
        </div>
      </div>
    `;

    App.openModal('receiptModal');
  },

  printCurrentReceipt() {
    window.print();
  },

  renderFallback() {
    this.renderTable([
      { id: 1, transactionRef: 'TXN-20260304-1013', createdAt: '2026-03-04T11:00:00', accountNumber: '100100000003', customerName: 'Robert Brown', transactionType: 'DEPOSIT', amount: 2100.00, balanceAfter: 42100.00, status: 'SUCCESS' },
      { id: 2, transactionRef: 'TXN-20260303-1012', createdAt: '2026-03-03T16:30:00', accountNumber: '100100000001', customerName: 'Johnathan Doe', transactionType: 'WITHDRAWAL', amount: 500.00, balanceAfter: 15450.00, status: 'SUCCESS' },
      { id: 3, transactionRef: 'TXN-20260301-1009', createdAt: '2026-03-01T10:00:00', accountNumber: '100100000001', customerName: 'Johnathan Doe', transactionType: 'TRANSFER_DEBIT', amount: 500.00, balanceAfter: 14000.00, status: 'SUCCESS' }
    ]);
  }
};
