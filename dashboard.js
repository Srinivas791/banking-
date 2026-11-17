/**
 * Simple Banking Management System - Dashboard Controller
 * Manages KPI cards, Chart.js graphical visualizations, and recent activity.
 */

const Dashboard = {
  cashflowChart: null,
  distributionChart: null,

  async init() {
    await this.loadStats();
  },

  async loadStats() {
    try {
      const res = await API.dashboard.getStats();
      if (res.success && res.data) {
        this.renderStats(res.data);
      }
    } catch (err) {
      console.warn('Could not load dashboard stats from API, using fallback data:', err);
      this.renderFallbackStats();
    }
  },

  formatCurrency(val) {
    const num = parseFloat(val || 0);
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  renderStats(data) {
    // KPI Cards
    const custElem = document.getElementById('dashTotalCustomers');
    const accElem = document.getElementById('dashActiveAccounts');
    const depElem = document.getElementById('dashTotalDeposits');
    const wthElem = document.getElementById('dashTotalWithdrawals');
    const balElem = document.getElementById('dashBankBalance');

    if (custElem) custElem.textContent = data.totalCustomers;
    if (accElem) accElem.textContent = `${data.activeAccounts} / ${data.totalAccounts}`;
    if (depElem) depElem.textContent = this.formatCurrency(data.totalBankDeposits);
    if (wthElem) wthElem.textContent = this.formatCurrency(data.totalBankWithdrawals);
    if (balElem) balElem.textContent = this.formatCurrency(data.totalBankBalance);

    // Render Recent Transactions
    this.renderRecentTransactions(data.recentTransactions || []);

    // Render Charts
    this.renderCharts(data.monthlyVolume || {}, data.accountTypeDistribution || {});
  },

  renderRecentTransactions(transactions) {
    const tbody = document.getElementById('dashRecentTxnBody');
    if (!tbody) return;

    if (!transactions.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">No recent transactions recorded.</td></tr>';
      return;
    }

    tbody.innerHTML = transactions.map(t => {
      const isCredit = t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_CREDIT';
      const typeBadgeClass = isCredit ? 'badge-success' : 'badge-danger';
      const formattedDate = new Date(t.createdAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <tr>
          <td><strong style="color:var(--navy-900);">${t.transactionRef}</strong></td>
          <td>${formattedDate}</td>
          <td><span style="font-family:monospace; font-weight:600;">${t.accountNumber}</span></td>
          <td><span class="badge ${typeBadgeClass}">${t.transactionType.replace('_', ' ')}</span></td>
          <td class="${isCredit ? 'txn-amount-credit' : 'txn-amount-debit'}">
            ${isCredit ? '+' : '-'}${this.formatCurrency(t.amount)}
          </td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="Transactions.viewReceipt('${t.transactionRef}')">
              Receipt
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  chartRetryCount: 0,

  renderCharts(monthlyData, typeDist) {
    if (typeof Chart === 'undefined') {
      if (this.chartRetryCount < 2) {
        this.chartRetryCount++;
        setTimeout(() => this.renderCharts(monthlyData, typeDist), 400);
        return;
      }
      // If Chart.js CDN didn't load (offline), render beautiful SVG fallback charts!
      this.renderSvgChartsFallback(monthlyData, typeDist);
      return;
    }

    // 1. Monthly Volume Bar/Line Chart
    const cashflowCanvas = document.getElementById('cashflowChart');
    if (cashflowCanvas) {
      if (this.cashflowChart) this.cashflowChart.destroy();

      const labels = Object.keys(monthlyData);
      const values = Object.values(monthlyData).map(v => parseFloat(v));

      this.cashflowChart = new Chart(cashflowCanvas, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['Jan 2026', 'Feb 2026', 'Mar 2026'],
          datasets: [{
            label: 'Transaction Volume ($)',
            data: values.length ? values : [12000, 35000, 24500],
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderColor: '#1d4ed8',
            borderRadius: 6,
            borderWidth: 1,
            barThickness: 32
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Volume: $${ctx.raw.toLocaleString()}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => '$' + (val >= 1000 ? (val / 1000) + 'k' : val)
              },
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Account Distribution Donut Chart
    const distCanvas = document.getElementById('accountDistChart');
    if (distCanvas) {
      if (this.distributionChart) this.distributionChart.destroy();

      const savings = typeDist.SAVINGS || 4;
      const current = typeDist.CURRENT || 2;

      this.distributionChart = new Chart(distCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Savings Accounts', 'Current Accounts'],
          datasets: [{
            data: [savings, current],
            backgroundColor: ['#2563eb', '#10b981'],
            hoverOffset: 4,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 12 } }
            }
          }
        }
      });
    }
  },

  renderSvgChartsFallback(monthlyData, typeDist) {
    const cashflowCanvas = document.getElementById('cashflowChart');
    if (cashflowCanvas && cashflowCanvas.parentElement) {
      const labels = Object.keys(monthlyData).length ? Object.keys(monthlyData) : ['Jan 2026', 'Feb 2026', 'Mar 2026'];
      const values = Object.values(monthlyData).length ? Object.values(monthlyData).map(v => parseFloat(v)) : [10000, 36500, 23179];
      const maxVal = Math.max(...values, 1000);

      const barsHtml = labels.map((lbl, idx) => {
        const val = values[idx] || 0;
        const heightPct = Math.max(8, Math.round((val / maxVal) * 80));
        return `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; gap:8px;">
            <div style="font-size:11px; font-weight:700; color:var(--blue-600);">$${(val >= 1000 ? (val/1000).toFixed(1) + 'k' : val)}</div>
            <div style="width:50%; max-width:44px; height:${heightPct}%; background:linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius:6px 6px 0 0; transition:height 0.4s ease;"></div>
            <div style="font-size:11px; color:var(--slate-500); font-weight:600;">${lbl}</div>
          </div>
        `;
      }).join('');

      cashflowCanvas.parentElement.innerHTML = `
        <div style="width:100%; height:240px; display:flex; align-items:flex-end; gap:16px; padding:20px 10px 10px 10px; border-bottom:1px solid var(--slate-200);">
          ${barsHtml}
        </div>
      `;
    }

    const distCanvas = document.getElementById('accountDistChart');
    if (distCanvas && distCanvas.parentElement) {
      const savings = typeDist.SAVINGS || 4;
      const current = typeDist.CURRENT || 2;
      const total = savings + current || 1;
      const savingsPct = Math.round((savings / total) * 100);
      const currentPct = 100 - savingsPct;

      distCanvas.parentElement.innerHTML = `
        <div style="width:100%; height:240px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:16px;">
          <div style="width:100%; max-width:240px; height:24px; background:var(--slate-200); border-radius:12px; overflow:hidden; display:flex;">
            <div style="width:${savingsPct}%; background:#2563eb; height:100%;" title="Savings: ${savings}"></div>
            <div style="width:${currentPct}%; background:#10b981; height:100%;" title="Current: ${current}"></div>
          </div>
          <div style="display:flex; justify-content:center; gap:24px; font-size:12px; font-weight:600;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:#2563eb;"></span>
              <span>Savings (${savings} - ${savingsPct}%)</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:#10b981;"></span>
              <span>Current (${current} - ${currentPct}%)</span>
            </div>
          </div>
        </div>
      `;
    }
  },

  renderFallbackStats() {
    this.renderStats({
      totalCustomers: 5,
      totalAccounts: 6,
      activeAccounts: 6,
      totalBankDeposits: 67100.00,
      totalBankWithdrawals: 2579.50,
      totalBankBalance: 88420.50,
      totalTransfers: 500.00,
      recentTransactions: [
        { transactionRef: 'TXN-20260304-1013', createdAt: '2026-03-04T11:00:00', accountNumber: '100100000003', transactionType: 'DEPOSIT', amount: 2100.00 },
        { transactionRef: 'TXN-20260303-1012', createdAt: '2026-03-03T16:30:00', accountNumber: '100100000001', transactionType: 'WITHDRAWAL', amount: 500.00 },
        { transactionRef: 'TXN-20260301-1009', createdAt: '2026-03-01T10:00:00', accountNumber: '100100000001', transactionType: 'TRANSFER_DEBIT', amount: 500.00 }
      ],
      monthlyVolume: { 'Jan 2026': 10000, 'Feb 2026': 36500, 'Mar 2026': 23179 },
      accountTypeDistribution: { SAVINGS: 4, CURRENT: 2 }
    });
  }
};
