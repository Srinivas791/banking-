/**
 * Simple Banking Management System - Reports & Analytics Module Controller
 * Generates Account Statements, Financial Summaries, and Printable Documents.
 */

const Reports = {
  async init() {
    // default date range (last 90 days to today)
    const toElem = document.getElementById('statementToDate');
    const fromElem = document.getElementById('statementFromDate');
    const today = new Date().toISOString().split('T')[0];
    const past = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (toElem && !toElem.value) toElem.value = today;
    if (fromElem && !fromElem.value) fromElem.value = past;

    await this.loadFinancialSummary();
  },

  async loadFinancialSummary() {
    try {
      const res = await API.reports.getFinancialSummary();
      if (res.success && res.data) {
        const d = res.data;
        const depElem = document.getElementById('reportTotalDeposits');
        const wthElem = document.getElementById('reportTotalWithdrawals');
        const netElem = document.getElementById('reportNetCashflow');

        if (depElem) depElem.textContent = `$${parseFloat(d.totalDeposits || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (wthElem) wthElem.textContent = `$${parseFloat(d.totalWithdrawals || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (netElem) {
          const net = parseFloat(d.netCashFlow || 0);
          netElem.textContent = (net >= 0 ? '+' : '-') + `$${Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          netElem.style.color = net >= 0 ? 'var(--emerald-600)' : 'var(--rose-600)';
        }
      }
    } catch (e) {
      console.warn('Could not load financial summary:', e);
    }
  },

  quickStatement(accountNumber) {
    App.switchView('reports');
    const select = document.getElementById('statementAccountSelect');
    if (select) {
      select.value = accountNumber;
      this.generateStatement();
    }
  },

  async generateStatement() {
    const accNum = document.getElementById('statementAccountSelect')?.value;
    const fromDate = document.getElementById('statementFromDate')?.value || null;
    const toDate = document.getElementById('statementToDate')?.value || null;

    if (!accNum) {
      App.showToast('error', 'Select Account', 'Please select an account number to generate its statement.');
      return;
    }

    try {
      const res = await API.reports.getStatement(accNum, fromDate, toDate);
      if (res.success && res.data) {
        this.renderStatementView(res.data);
      }
    } catch (err) {
      App.showToast('error', 'Statement Error', err.message);
    }
  },

  renderStatementView(data) {
    const container = document.getElementById('statementResultContainer');
    if (!container) return;

    const acc = data.account;
    const txns = data.transactions || [];
    const credits = parseFloat(data.totalCredits || 0);
    const debits = parseFloat(data.totalDebits || 0);
    const balance = parseFloat(data.currentBalance || 0);

    container.innerHTML = `
      <div class="card" style="margin-top:20px;">
        <div class="card-header" style="background:#f8fafc;">
          <div>
            <h3 style="color:var(--navy-900);">Official Account Statement</h3>
            <p style="font-size:12px; color:var(--slate-500);">Period: ${data.fromDate ? new Date(data.fromDate).toLocaleDateString() : 'Beginning'} &mdash; ${new Date(data.toDate).toLocaleDateString()}</p>
          </div>
          <button class="btn btn-primary" onclick="window.print()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Statement
          </button>
        </div>

        <div class="card-body">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px; background:var(--slate-50); padding:16px; border-radius:var(--radius-md); border:1px solid var(--slate-200);">
            <div>
              <div class="receipt-item-label">Account Holder</div>
              <div class="receipt-item-val" style="font-size:15px;">${acc.customerName}</div>
              <div style="font-size:11px; color:var(--slate-500);">${acc.customerEmail}</div>
            </div>
            <div>
              <div class="receipt-item-label">Account Number & Type</div>
              <div class="receipt-item-val" style="font-family:monospace; font-size:15px;">${acc.accountNumber}</div>
              <div style="font-size:11px; color:var(--blue-600); font-weight:600;">${acc.accountType} (${acc.currency})</div>
            </div>
            <div>
              <div class="receipt-item-label">Total Deposits/Credits</div>
              <div class="receipt-item-val" style="color:var(--emerald-600); font-size:16px;">+$${credits.toFixed(2)}</div>
            </div>
            <div>
              <div class="receipt-item-label">Total Withdrawals/Debits</div>
              <div class="receipt-item-val" style="color:var(--rose-600); font-size:16px;">-$${debits.toFixed(2)}</div>
            </div>
            <div>
              <div class="receipt-item-label">Closing Available Balance</div>
              <div class="receipt-item-val" style="color:var(--navy-900); font-size:18px; font-weight:800;">$${balance.toFixed(2)}</div>
            </div>
          </div>

          <h4 style="font-size:14px; font-weight:700; color:var(--navy-900); margin-bottom:12px;">Transaction Details (${txns.length})</h4>

          <div class="table-responsive">
            <table class="data-table statement-print-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Transaction Reference</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                ${txns.length ? txns.map(t => {
                  const isCredit = t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_CREDIT';
                  return `
                    <tr>
                      <td>${new Date(t.createdAt).toLocaleString()}</td>
                      <td style="font-family:monospace; font-weight:600;">${t.transactionRef}</td>
                      <td>${t.description || 'N/A'}</td>
                      <td><span class="badge ${isCredit ? 'badge-success' : 'badge-danger'}">${t.transactionType.replace('_', ' ')}</span></td>
                      <td class="${isCredit ? 'txn-amount-credit' : 'txn-amount-debit'}">${isCredit ? '+' : '-'}$${parseFloat(t.amount).toFixed(2)}</td>
                      <td>$${parseFloat(t.balanceAfter).toFixed(2)}</td>
                    </tr>
                  `;
                }).join('') : '<tr><td colspan="6" style="text-align:center; padding:18px;">No transactions recorded within this date range.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="print-footer-sign" style="display:none; margin-top:40px;">
            <div class="sign-box">Prepared By (Teller / System)</div>
            <div class="sign-box">Authorized Branch Officer</div>
          </div>
        </div>
      </div>
    `;
  }
};
