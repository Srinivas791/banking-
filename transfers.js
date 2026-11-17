/**
 * Simple Banking Management System - Fund Transfers Module Controller
 * Handles inter-account transfers with atomic validation & transfer receipts.
 */

const Transfers = {
  transferList: [],

  async init() {
    await this.loadTransfers();
    this.setupAccountListeners();
  },

  async loadTransfers() {
    try {
      const res = await API.transfers.getAll();
      if (res.success && res.data) {
        this.transferList = res.data;
        this.renderTable(this.transferList);
      }
    } catch (err) {
      console.warn('Transfers API load failed:', err);
    }
  },

  setupAccountListeners() {
    const srcSelect = document.getElementById('transferSourceAccount');
    if (srcSelect) {
      srcSelect.addEventListener('change', () => {
        const accNum = srcSelect.value;
        const infoBox = document.getElementById('transferSourceBalanceInfo');
        if (!infoBox) return;

        if (!accNum) {
          infoBox.style.display = 'none';
          return;
        }

        const acc = Accounts.accountList.find(a => a.accountNumber === accNum);
        if (acc) {
          const avail = Math.max(0, acc.balance - acc.minimumBalance);
          infoBox.style.display = 'block';
          infoBox.innerHTML = `
            <strong>Available for Transfer:</strong> $${avail.toFixed(2)} USD 
            <span style="color:var(--slate-500); font-size:11px;">(Total Balance: $${acc.balance.toFixed(2)} | Min Reserve: $${acc.minimumBalance.toFixed(2)})</span>
          `;
        }
      });
    }
  },

  renderTable(transfers) {
    const tbody = document.getElementById('transfersTableBody');
    if (!tbody) return;

    if (!transfers.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">No transfers executed yet.</td></tr>';
      return;
    }

    tbody.innerHTML = transfers.map(t => {
      const dateStr = new Date(t.createdAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <tr>
          <td><strong style="color:var(--navy-900); font-family:monospace;">${t.transferRef}</strong></td>
          <td>${dateStr}</td>
          <td>
            <div style="font-family:monospace; font-weight:600;">${t.sourceAccountNumber}</div>
            <div style="font-size:11px; color:var(--slate-500);">${t.sourceCustomerName}</div>
          </td>
          <td>
            <div style="font-family:monospace; font-weight:600;">${t.destinationAccountNumber}</div>
            <div style="font-size:11px; color:var(--slate-500);">${t.destinationCustomerName}</div>
          </td>
          <td><strong style="color:var(--navy-900); font-size:14px;">$${parseFloat(t.amount).toFixed(2)}</strong></td>
          <td><span class="badge badge-success">${t.status}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="Transfers.viewTransferReceipt('${t.transferRef}')">
              Receipt
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async handleTransfer(e) {
    e.preventDefault();
    const form = e.target;
    const sourceAcc = form.sourceAccount.value;
    const destAcc = form.destAccount.value;
    const amount = parseFloat(form.amount.value);
    const remark = form.remark.value.trim();

    if (!sourceAcc || !destAcc) {
      App.showToast('error', 'Validation Error', 'Please select both source and destination accounts.');
      return;
    }

    if (sourceAcc === destAcc) {
      App.showToast('error', 'Invalid Transfer', 'Source and destination accounts cannot be identical.');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      App.showToast('error', 'Validation Error', 'Transfer amount must be strictly greater than zero.');
      return;
    }

    try {
      const res = await API.transfers.execute(sourceAcc, destAcc, amount, remark);
      if (res.success && res.data) {
        App.showToast('success', 'Transfer Successful', `Successfully transferred $${amount.toFixed(2)} from ${sourceAcc} to ${destAcc}`);
        form.reset();
        document.getElementById('transferSourceBalanceInfo').style.display = 'none';

        await this.loadTransfers();
        await Accounts.loadAccounts();
        await Transactions.loadTransactions();
        await Dashboard.loadStats();

        // Show receipt
        this.renderTransferReceiptModal(res.data);
      }
    } catch (err) {
      App.showToast('error', 'Transfer Failed', err.message);
    }
  },

  async viewTransferReceipt(ref) {
    try {
      const res = await API.transfers.getByRef(ref);
      if (res.success && res.data) {
        this.renderTransferReceiptModal(res.data);
      }
    } catch (err) {
      App.showToast('error', 'Receipt Error', err.message);
    }
  },

  renderTransferReceiptModal(t) {
    const container = document.getElementById('receiptModalContent');
    if (!container) return;

    const formattedDate = new Date(t.createdAt).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    container.innerHTML = `
      <div class="receipt-box" id="printableReceiptBox">
        <div class="receipt-header">
          <div style="font-size:24px; font-weight:800; color:var(--navy-900); letter-spacing:1px;">
            APEX GLOBAL BANK
          </div>
          <div style="font-size:11px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px;">
            Inter-Account Funds Transfer Advice &bull; Core Banking System
          </div>
          <div class="receipt-type" style="margin-top:6px; color:var(--emerald-600);">
            Transaction Completed & Settled
          </div>
        </div>

        <div class="receipt-amount-banner">
          <div style="font-size:12px; text-transform:uppercase; opacity:0.85; letter-spacing:0.5px;">Transferred Amount</div>
          <div class="amt">$${parseFloat(t.amount).toFixed(2)} USD</div>
          <div style="font-size:11px; opacity:0.9; margin-top:2px;">Status: SUCCESS</div>
        </div>

        <div class="receipt-details-grid">
          <div>
            <div class="receipt-item-label">Transfer Reference</div>
            <div class="receipt-item-val" style="font-family:monospace; color:var(--blue-600);">${t.transferRef}</div>
          </div>
          <div>
            <div class="receipt-item-label">Execution Date & Time</div>
            <div class="receipt-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="receipt-item-label">Sender Account</div>
            <div class="receipt-item-val" style="font-family:monospace;">${t.sourceAccountNumber}</div>
            <div style="font-size:11px; color:var(--slate-500);">${t.sourceCustomerName}</div>
          </div>
          <div>
            <div class="receipt-item-label">Beneficiary Account</div>
            <div class="receipt-item-val" style="font-family:monospace;">${t.destinationAccountNumber}</div>
            <div style="font-size:11px; color:var(--slate-500);">${t.destinationCustomerName}</div>
          </div>
          <div style="grid-column: span 2;">
            <div class="receipt-item-label">Purpose / Remark</div>
            <div class="receipt-item-val">${t.remark || 'Direct Inter-Account Transfer'}</div>
          </div>
        </div>

        <div style="border-top:1px dashed var(--slate-300); padding-top:14px; text-align:center; font-size:11px; color:var(--slate-500);">
          This electronic transfer confirmation is authenticated by Apex Bank Core Engine.
        </div>
      </div>
    `;

    App.openModal('receiptModal');
  }
};
