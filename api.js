/**
 * Simple Banking Management System - Master API Client & LocalStorage Simulation Engine
 * Features:
 *   - Automatic backend detection (/api/...)
 *   - Transparent seamless fallback to LocalStorage Engine (MockDB) when offline / standalone
 *   - Complete ACID-like banking simulation:
 *       * Customer registration & KYC management
 *       * Savings & Current account lifecycle with reserve thresholds
 *       * Cash deposits with instant balance reflection
 *       * Cash withdrawals with strict minimum balance enforcement
 *       * Double-entry atomic fund transfers
 *       * Full audit logging & printable transaction receipts
 *       * Certified account statements & Chart.js cashflow aggregation
 */

// =============================================================================
// 1. IN-BROWSER PERSISTENT MOCK DATABASE ENGINE
// =============================================================================
const MockDB = {
  STORAGE_KEY: 'apex_banking_store_v2',

  getInitialData() {
    return {
      users: [
        { id: 1, username: 'admin', fullName: 'System Administrator', email: 'admin@apexbank.com', phone: '+1-800-555-0199', role: 'ROLE_ADMIN', status: 'ACTIVE', password: 'admin123', createdAt: '2026-01-10T09:00:00' },
        { id: 2, username: 'teller', fullName: 'Sarah Connor (Senior Teller)', email: 'teller@apexbank.com', phone: '+1-800-555-0145', role: 'ROLE_EMPLOYEE', status: 'ACTIVE', password: 'teller123', createdAt: '2026-01-15T10:30:00' },
        { id: 3, username: 'john_doe', fullName: 'Johnathan Doe', email: 'john.doe@gmail.com', phone: '+1-555-012-3456', role: 'ROLE_CUSTOMER', status: 'ACTIVE', password: 'john123', createdAt: '2026-02-01T11:15:00' },
        { id: 4, username: 'jane_smith', fullName: 'Jane Smith', email: 'jane.smith@yahoo.com', phone: '+1-555-019-8765', role: 'ROLE_CUSTOMER', status: 'ACTIVE', password: 'jane123', createdAt: '2026-02-05T14:20:00' },
        { id: 5, username: 'robert_b', fullName: 'Robert Brown', email: 'robert.brown@techcorp.io', phone: '+1-555-014-9988', role: 'ROLE_CUSTOMER', status: 'ACTIVE', password: 'robert123', createdAt: '2026-02-12T16:45:00' }
      ],
      customers: [
        { id: 1, userId: 3, customerCode: 'CUST-1001', firstName: 'Johnathan', lastName: 'Doe', email: 'john.doe@gmail.com', phone: '+1-555-012-3456', address: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', postalCode: '62704', dateOfBirth: '1990-05-15', identityNumber: 'NAT-ID-8849201', status: 'ACTIVE', createdAt: '2026-02-01T11:15:00' },
        { id: 2, userId: 4, customerCode: 'CUST-1002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@yahoo.com', phone: '+1-555-019-8765', address: '124 Conch Street', city: 'Bikini Bottom', state: 'HI', postalCode: '96815', dateOfBirth: '1993-08-22', identityNumber: 'NAT-ID-9928374', status: 'ACTIVE', createdAt: '2026-02-05T14:20:00' },
        { id: 3, userId: 5, customerCode: 'CUST-1003', firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@techcorp.io', phone: '+1-555-014-9988', address: '221B Baker Street', city: 'London', state: 'OH', postalCode: '43140', dateOfBirth: '1985-11-30', identityNumber: 'NAT-ID-3382910', status: 'ACTIVE', createdAt: '2026-02-12T16:45:00' },
        { id: 4, userId: null, customerCode: 'CUST-1004', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@outlook.com', phone: '+1-555-017-4422', address: '456 Elm Street', city: 'Metropolis', state: 'NY', postalCode: '10001', dateOfBirth: '1995-03-10', identityNumber: 'NAT-ID-7728192', status: 'ACTIVE', createdAt: '2026-02-20T10:00:00' },
        { id: 5, userId: null, customerCode: 'CUST-1005', firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@enterprise.net', phone: '+1-555-018-7711', address: '888 Silicon Way', city: 'San Jose', state: 'CA', postalCode: '95112', dateOfBirth: '1988-07-19', identityNumber: 'NAT-ID-4491028', status: 'ACTIVE', createdAt: '2026-02-28T13:10:00' }
      ],
      accounts: [
        { id: 1, accountNumber: '100100000001', customerId: 1, accountType: 'SAVINGS', balance: 15450.00, minimumBalance: 500.00, currency: 'USD', status: 'ACTIVE', createdAt: '2026-02-01T11:30:00' },
        { id: 2, accountNumber: '100100000002', customerId: 2, accountType: 'SAVINGS', balance: 8920.50, minimumBalance: 500.00, currency: 'USD', status: 'ACTIVE', createdAt: '2026-02-05T14:35:00' },
        { id: 3, accountNumber: '100100000003', customerId: 3, accountType: 'CURRENT', balance: 42100.00, minimumBalance: 1000.00, currency: 'USD', status: 'ACTIVE', createdAt: '2026-02-12T17:00:00' },
        { id: 4, accountNumber: '100100000004', customerId: 4, accountType: 'SAVINGS', balance: 3250.00, minimumBalance: 500.00, currency: 'USD', status: 'ACTIVE', createdAt: '2026-02-20T10:15:00' },
        { id: 5, accountNumber: '100100000005', customerId: 5, accountType: 'CURRENT', balance: 18700.00, minimumBalance: 1000.00, currency: 'USD', status: 'ACTIVE', createdAt: '2026-02-28T13:30:00' },
        { id: 6, accountNumber: '100100000006', customerId: 1, accountType: 'CURRENT', balance: 5000.00, minimumBalance: 1000.00, currency: 'USD', status: 'ACTIVE', createdAt: '2026-03-05T09:40:00' }
      ],
      transactions: [
        { id: 1, transactionRef: 'TXN-20260201-1001', accountNumber: '100100000001', transactionType: 'DEPOSIT', amount: 10000.00, balanceAfter: 10000.00, description: 'Initial Account Opening Deposit', status: 'SUCCESS', createdAt: '2026-02-01T11:30:00' },
        { id: 2, transactionRef: 'TXN-20260205-1002', accountNumber: '100100000002', transactionType: 'DEPOSIT', amount: 5000.00, balanceAfter: 5000.00, description: 'Initial Account Opening Deposit', status: 'SUCCESS', createdAt: '2026-02-05T14:35:00' },
        { id: 3, transactionRef: 'TXN-20260212-1003', accountNumber: '100100000003', transactionType: 'DEPOSIT', amount: 40000.00, balanceAfter: 40000.00, description: 'Initial Corporate Current Account Deposit', status: 'SUCCESS', createdAt: '2026-02-12T17:00:00' },
        { id: 4, transactionRef: 'TXN-20260215-1004', accountNumber: '100100000001', transactionType: 'DEPOSIT', amount: 6000.00, balanceAfter: 16000.00, description: 'Salary Credit February 2026', status: 'SUCCESS', createdAt: '2026-02-15T08:30:00' },
        { id: 5, transactionRef: 'TXN-20260218-1005', accountNumber: '100100000001', transactionType: 'WITHDRAWAL', amount: 1500.00, balanceAfter: 14500.00, description: 'ATM Cash Withdrawal - Main Branch', status: 'SUCCESS', createdAt: '2026-02-18T19:10:00' },
        { id: 6, transactionRef: 'TXN-20260220-1006', accountNumber: '100100000004', transactionType: 'DEPOSIT', amount: 3500.00, balanceAfter: 3500.00, description: 'Initial Opening Deposit', status: 'SUCCESS', createdAt: '2026-02-20T10:15:00' },
        { id: 7, transactionRef: 'TXN-20260222-1007', accountNumber: '100100000002', transactionType: 'DEPOSIT', amount: 4500.00, balanceAfter: 9500.00, description: 'Consulting Fee Credit', status: 'SUCCESS', createdAt: '2026-02-22T15:45:00' },
        { id: 8, transactionRef: 'TXN-20260225-1008', accountNumber: '100100000002', transactionType: 'WITHDRAWAL', amount: 579.50, balanceAfter: 8920.50, description: 'Utility Bill Payment', status: 'SUCCESS', createdAt: '2026-02-25T12:20:00' },
        { id: 9, transactionRef: 'TXN-20260301-1009', accountNumber: '100100000001', transactionType: 'TRANSFER_DEBIT', amount: 500.00, balanceAfter: 14000.00, description: 'Transfer to Jane Smith (100100000002)', status: 'SUCCESS', createdAt: '2026-03-01T10:00:00' },
        { id: 10, transactionRef: 'TXN-20260301-1010', accountNumber: '100100000002', transactionType: 'TRANSFER_CREDIT', amount: 500.00, balanceAfter: 9420.50, description: 'Received from Johnathan Doe (100100000001)', status: 'SUCCESS', createdAt: '2026-03-01T10:00:00' },
        { id: 11, transactionRef: 'TXN-20260302-1011', accountNumber: '100100000001', transactionType: 'DEPOSIT', amount: 1950.00, balanceAfter: 15950.00, description: 'Dividend Payment Credit', status: 'SUCCESS', createdAt: '2026-03-02T14:15:00' },
        { id: 12, transactionRef: 'TXN-20260303-1012', accountNumber: '100100000001', transactionType: 'WITHDRAWAL', amount: 500.00, balanceAfter: 15450.00, description: 'Online Shopping Payment', status: 'SUCCESS', createdAt: '2026-03-03T16:30:00' },
        { id: 13, transactionRef: 'TXN-20260304-1013', accountNumber: '100100000003', transactionType: 'DEPOSIT', amount: 2100.00, balanceAfter: 42100.00, description: 'Client Retainer Invoice #4092', status: 'SUCCESS', createdAt: '2026-03-04T11:00:00' }
      ],
      transfers: [
        {
          id: 1,
          transferRef: 'TRF-20260301-8849',
          sourceAccountNumber: '100100000001',
          destinationAccountNumber: '100100000002',
          sourceCustomerName: 'Johnathan Doe',
          destinationCustomerName: 'Jane Smith',
          amount: 500.00,
          remark: 'Monthly Shared Apartment Utility Split',
          status: 'SUCCESS',
          createdAt: '2026-03-01T10:00:00'
        }
      ],
      auditLogs: [
        { id: 1, action: 'SYSTEM_INITIALIZATION', performedBy: 'admin', details: 'System database initialized with baseline academic schema', ipAddress: '127.0.0.1', createdAt: '2026-01-10T09:00:00' },
        { id: 2, action: 'CUSTOMER_REGISTRATION', performedBy: 'teller', details: 'Registered new customer CUST-1001 (Johnathan Doe)', ipAddress: '192.168.1.102', createdAt: '2026-02-01T11:15:00' },
        { id: 3, action: 'ACCOUNT_OPENING', performedBy: 'teller', details: 'Opened Savings Account 100100000001 with initial deposit $10,000.00', ipAddress: '192.168.1.102', createdAt: '2026-02-01T11:30:00' },
        { id: 4, action: 'FUND_TRANSFER', performedBy: 'john_doe', details: 'Transferred $500.00 from 100100000001 to 100100000002. Ref: TRF-20260301-8849', ipAddress: '192.168.1.55', createdAt: '2026-03-01T10:00:00' },
        { id: 5, action: 'SECURITY_LOGIN', performedBy: 'admin', details: 'Administrator login successful', ipAddress: '127.0.0.1', createdAt: '2026-03-10T08:30:00' }
      ]
    };
  },

  loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        const init = this.getInitialData();
        this.saveData(init);
        return init;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalStorage parse failed, re-initializing mock database:', e);
      const init = this.getInitialData();
      this.saveData(init);
      return init;
    }
  },

  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  reset() {
    const init = this.getInitialData();
    this.saveData(init);
    return init;
  },

  logAudit(action, performedBy, details) {
    const data = this.loadData();
    const newLog = {
      id: (data.auditLogs.length ? Math.max(...data.auditLogs.map(l => l.id)) : 0) + 1,
      action: action.toUpperCase(),
      performedBy: performedBy || 'system',
      details: details || '',
      ipAddress: '127.0.0.1 (Local)',
      createdAt: new Date().toISOString()
    };
    data.auditLogs.unshift(newLog);
    this.saveData(data);
    return newLog;
  },

  // Helpers to hydrate account with customer names
  hydrateAccount(acc, data) {
    const cust = data.customers.find(c => c.id === acc.customerId);
    return {
      ...acc,
      customerName: cust ? `${cust.firstName} ${cust.lastName}` : 'Unknown Customer',
      customerEmail: cust ? cust.email : ''
    };
  },

  // Helpers to hydrate transaction
  hydrateTransaction(txn, data) {
    const acc = data.accounts.find(a => a.accountNumber === txn.accountNumber);
    const cust = acc ? data.customers.find(c => c.id === acc.customerId) : null;
    return {
      ...txn,
      accountType: acc ? acc.accountType : 'SAVINGS',
      customerName: cust ? `${cust.firstName} ${cust.lastName}` : '',
      customerEmail: cust ? cust.email : ''
    };
  }
};

// =============================================================================
// 2. MASTER API CONTROLLER WITH TRANSPARENT FAILOVER
// =============================================================================
const API = {
  baseUrl: '',
  mode: 'detecting', // 'backend' | 'mock'
  isBackendOnline: false,

  // Detect backend status once or on demand
  async checkBackend() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.baseUrl}/api/dashboard/stats`, {
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      this.isBackendOnline = res.ok;
      this.mode = res.ok ? 'backend' : 'mock';
      this.updateStatusBadge();
      return res.ok;
    } catch (e) {
      this.isBackendOnline = false;
      this.mode = 'mock';
      this.updateStatusBadge();
      return false;
    }
  },

  updateStatusBadge() {
    const badge = document.getElementById('systemStatusBadge') || document.querySelector('.live-badge');
    if (!badge) return;

    if (this.isBackendOnline) {
      badge.innerHTML = `
        <span class="live-pulse" style="background:#10b981;"></span>
        <span>BACKEND ONLINE</span>
      `;
      badge.title = 'Connected to Live Spring Boot Core Backend';
    } else {
      badge.innerHTML = `
        <span class="live-pulse" style="background:#f59e0b; box-shadow:0 0 0 0 rgba(245, 158, 11, 0.7);"></span>
        <span>DEMO MODE (LOCAL ENGINE)</span>
      `;
      badge.title = 'Running on high-fidelity in-browser Banking Simulator with persistent LocalStorage';
    }
  },

  // Universal API Request Wrapper with Auto-Fallback
  async request(endpoint, options = {}) {
    // If already in mock mode, route directly
    if (this.mode === 'mock') {
      return this.handleMockRoute(endpoint, options);
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      credentials: 'include',
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      // If network failed (e.g. backend down / file:// protocol), failover to MockDB!
      console.warn(`Live API unavailable for [${options.method || 'GET'} ${endpoint}]. Switching smoothly to Local Simulator:`, err.message);
      this.mode = 'mock';
      this.isBackendOnline = false;
      this.updateStatusBadge();
      return this.handleMockRoute(endpoint, options);
    }
  },

  // In-Browser Mock Router for complete client-side autonomy
  handleMockRoute(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const data = MockDB.loadData();
    let body = options.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { /* ignore */ }
    }

    // 1. Auth routes
    if (endpoint === '/api/auth/login' && method === 'POST') {
      const user = data.users.find(u => u.username.toLowerCase() === (body.username || '').toLowerCase());
      if (!user) {
        throw new Error('Invalid username or password.');
      }
      if (user.status !== 'ACTIVE') {
        throw new Error('This user account is inactive or disabled.');
      }
      // Demo password check (flexible for demo credentials or registered users)
      const validPasswords = ['admin123', 'teller123', 'customer123', 'john123', 'jane123', 'robert123', user.password];
      if (body.password && !validPasswords.includes(body.password)) {
        throw new Error('Invalid password entered. Use demo password (e.g. admin123).');
      }

      MockDB.logAudit('SECURITY_LOGIN', user.username, `Successful authentication as ${user.role}`);
      return {
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      };
    }

    if (endpoint === '/api/auth/logout' && method === 'POST') {
      return { success: true, message: 'Logged out successfully' };
    }

    if (endpoint === '/api/auth/current-user') {
      const saved = localStorage.getItem('apex_bank_user');
      return { success: true, data: saved ? JSON.parse(saved) : null };
    }

    if (endpoint === '/api/auth/register' && method === 'POST') {
      if (data.users.some(u => u.username.toLowerCase() === body.username.toLowerCase())) {
        throw new Error(`Username '${body.username}' is already taken.`);
      }
      const newUser = {
        id: (data.users.length ? Math.max(...data.users.map(u => u.id)) : 0) + 1,
        username: body.username,
        fullName: body.fullName || body.username,
        email: body.email,
        phone: body.phone || '',
        role: body.role || 'ROLE_CUSTOMER',
        status: 'ACTIVE',
        password: body.password || 'customer123',
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      MockDB.saveData(data);
      MockDB.logAudit('USER_REGISTRATION', 'admin', `Created user account '${newUser.username}' (${newUser.role})`);
      return { success: true, data: newUser, message: 'Registration successful' };
    }

    // 2. Dashboard routes
    if (endpoint === '/api/dashboard/stats' || endpoint === '/api/dashboard/summary') {
      const activeAccs = data.accounts.filter(a => a.status === 'ACTIVE');
      const totalBalance = activeAccs.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
      
      const totalDeposits = data.transactions
        .filter(t => t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_CREDIT')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const totalWithdrawals = data.transactions
        .filter(t => t.transactionType === 'WITHDRAWAL' || t.transactionType === 'TRANSFER_DEBIT')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const recentTxns = [...data.transactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
        .map(t => MockDB.hydrateTransaction(t, data));

      // Calculate monthly volume
      const monthlyVolume = {};
      data.transactions.forEach(t => {
        const d = new Date(t.createdAt);
        const m = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthlyVolume[m] = (monthlyVolume[m] || 0) + parseFloat(t.amount || 0);
      });

      // Account distribution
      const accountTypeDistribution = {
        SAVINGS: data.accounts.filter(a => a.accountType === 'SAVINGS').length,
        CURRENT: data.accounts.filter(a => a.accountType === 'CURRENT').length
      };

      return {
        success: true,
        data: {
          totalCustomers: data.customers.length,
          activeAccounts: activeAccs.length,
          totalAccounts: data.accounts.length,
          totalBankBalance: totalBalance,
          totalBankDeposits: totalDeposits,
          totalBankWithdrawals: totalWithdrawals,
          recentTransactions: recentTxns,
          monthlyVolume,
          accountTypeDistribution
        }
      };
    }

    // 3. Customer routes
    if (endpoint === '/api/customers' && method === 'GET') {
      const list = data.customers.map(c => ({
        ...c,
        accountsCount: data.accounts.filter(a => a.customerId === c.id).length
      }));
      return { success: true, data: list };
    }

    if (endpoint.startsWith('/api/customers/search') && method === 'GET') {
      const url = new URL('http://dummy' + endpoint);
      const query = (url.searchParams.get('query') || '').toLowerCase();
      const list = data.customers
        .filter(c => 
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.customerCode.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.identityNumber.toLowerCase().includes(query)
        )
        .map(c => ({
          ...c,
          accountsCount: data.accounts.filter(a => a.customerId === c.id).length
        }));
      return { success: true, data: list };
    }

    if (endpoint.match(/^\/api\/customers\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/').pop());
      const cust = data.customers.find(c => c.id === id);
      if (!cust) throw new Error('Customer profile not found.');
      return {
        success: true,
        data: {
          ...cust,
          accountsCount: data.accounts.filter(a => a.customerId === cust.id).length
        }
      };
    }

    if (endpoint === '/api/customers' && method === 'POST') {
      const nextId = (data.customers.length ? Math.max(...data.customers.map(c => c.id)) : 0) + 1;
      const code = `CUST-${1000 + nextId}`;
      const newCust = {
        id: nextId,
        userId: null,
        customerCode: code,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        identityNumber: body.identityNumber || `NAT-ID-${Math.floor(1000000 + Math.random() * 9000000)}`,
        dateOfBirth: body.dateOfBirth || null,
        address: body.address || '',
        city: body.city || '',
        state: body.state || '',
        postalCode: body.postalCode || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      data.customers.unshift(newCust);
      MockDB.saveData(data);
      MockDB.logAudit('CUSTOMER_REGISTRATION', 'teller', `Registered new customer ${code} (${newCust.firstName} ${newCust.lastName})`);
      return { success: true, data: newCust, message: 'Customer registered successfully.' };
    }

    if (endpoint.match(/^\/api\/customers\/\d+\/status$/) && method === 'PATCH') {
      const id = parseInt(endpoint.split('/')[3]);
      const cust = data.customers.find(c => c.id === id);
      if (!cust) throw new Error('Customer not found.');
      cust.status = cust.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      MockDB.saveData(data);
      MockDB.logAudit('CUSTOMER_STATUS_UPDATE', 'admin', `Updated customer ${cust.customerCode} status to ${cust.status}`);
      return { success: true, data: cust };
    }

    // 4. Account routes
    if (endpoint === '/api/accounts' && method === 'GET') {
      const list = data.accounts.map(a => MockDB.hydrateAccount(a, data));
      return { success: true, data: list };
    }

    if (endpoint.startsWith('/api/accounts/search') && method === 'GET') {
      const url = new URL('http://dummy' + endpoint);
      const query = (url.searchParams.get('query') || '').toLowerCase();
      const list = data.accounts
        .map(a => MockDB.hydrateAccount(a, data))
        .filter(a => 
          a.accountNumber.includes(query) ||
          a.customerName.toLowerCase().includes(query) ||
          a.accountType.toLowerCase().includes(query)
        );
      return { success: true, data: list };
    }

    if (endpoint.startsWith('/api/accounts/customer/') && method === 'GET') {
      const custId = parseInt(endpoint.split('/').pop());
      const list = data.accounts
        .filter(a => a.customerId === custId)
        .map(a => MockDB.hydrateAccount(a, data));
      return { success: true, data: list };
    }

    if (endpoint.match(/^\/api\/accounts\/\d+$/) && method === 'GET') {
      const accNum = endpoint.split('/').pop();
      const acc = data.accounts.find(a => a.accountNumber === accNum);
      if (!acc) throw new Error(`Account ${accNum} not found.`);
      return { success: true, data: MockDB.hydrateAccount(acc, data) };
    }

    if (endpoint === '/api/accounts' && method === 'POST') {
      const nextId = (data.accounts.length ? Math.max(...data.accounts.map(a => a.id)) : 0) + 1;
      const accNum = `10010000000${nextId}`;
      const minBal = body.accountType === 'CURRENT' ? 1000.00 : 500.00;
      const initialDeposit = parseFloat(body.balance || 0);

      const newAcc = {
        id: nextId,
        accountNumber: accNum,
        customerId: parseInt(body.customerId),
        accountType: body.accountType || 'SAVINGS',
        balance: initialDeposit,
        minimumBalance: minBal,
        currency: 'USD',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      data.accounts.push(newAcc);

      // Record initial deposit transaction if amount > 0
      if (initialDeposit > 0) {
        const txnRef = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        data.transactions.unshift({
          id: (data.transactions.length ? Math.max(...data.transactions.map(t => t.id)) : 0) + 1,
          transactionRef: txnRef,
          accountNumber: accNum,
          transactionType: 'DEPOSIT',
          amount: initialDeposit,
          balanceAfter: initialDeposit,
          description: `Initial Opening Deposit for ${newAcc.accountType} Account`,
          status: 'SUCCESS',
          createdAt: new Date().toISOString()
        });
      }

      MockDB.saveData(data);
      MockDB.logAudit('ACCOUNT_OPENING', 'teller', `Opened ${newAcc.accountType} account ${accNum} with initial deposit $${initialDeposit.toFixed(2)}`);
      return { success: true, data: MockDB.hydrateAccount(newAcc, data), message: 'Account opened successfully.' };
    }

    if (endpoint.includes('/status') && endpoint.startsWith('/api/accounts/')) {
      const url = new URL('http://dummy' + endpoint);
      const accNum = endpoint.split('/')[3];
      const newStatus = url.searchParams.get('status') || 'ACTIVE';
      const acc = data.accounts.find(a => a.accountNumber === accNum);
      if (!acc) throw new Error('Account not found.');
      acc.status = newStatus;
      MockDB.saveData(data);
      MockDB.logAudit('ACCOUNT_STATUS_CHANGE', 'admin', `Changed account ${accNum} status to ${newStatus}`);
      return { success: true, data: MockDB.hydrateAccount(acc, data) };
    }

    // 5. Transaction routes (Deposits, Withdrawals, Ledger)
    if (endpoint === '/api/transactions' || endpoint === '/api/transactions/recent') {
      const list = [...data.transactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(t => MockDB.hydrateTransaction(t, data));
      return { success: true, data: endpoint.includes('recent') ? list.slice(0, 10) : list };
    }

    if (endpoint.startsWith('/api/transactions/account/')) {
      const accNum = endpoint.split('/').pop();
      const list = data.transactions
        .filter(t => t.accountNumber === accNum)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(t => MockDB.hydrateTransaction(t, data));
      return { success: true, data: list };
    }

    if (endpoint.startsWith('/api/transactions/filter')) {
      const url = new URL('http://dummy' + endpoint);
      const type = url.searchParams.get('type');
      const query = (url.searchParams.get('query') || '').toLowerCase();
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      let list = data.transactions.map(t => MockDB.hydrateTransaction(t, data));

      if (type) {
        list = list.filter(t => t.transactionType === type);
      }
      if (query) {
        list = list.filter(t => 
          t.transactionRef.toLowerCase().includes(query) ||
          t.accountNumber.includes(query) ||
          (t.customerName && t.customerName.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query))
        );
      }
      if (startDate) {
        list = list.filter(t => new Date(t.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        list = list.filter(t => new Date(t.createdAt) <= new Date(endDate + 'T23:59:59'));
      }

      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, data: list };
    }

    if (endpoint.match(/^\/api\/transactions\/TXN-/) && method === 'GET') {
      const ref = endpoint.split('/').pop();
      const txn = data.transactions.find(t => t.transactionRef === ref);
      if (!txn) throw new Error(`Transaction ${ref} not found.`);
      return { success: true, data: MockDB.hydrateTransaction(txn, data) };
    }

    if (endpoint === '/api/transactions/deposit' && method === 'POST') {
      const acc = data.accounts.find(a => a.accountNumber === body.accountNumber);
      if (!acc) throw new Error(`Account ${body.accountNumber} not found.`);
      if (acc.status !== 'ACTIVE') throw new Error(`Account is currently ${acc.status}. Deposits cannot be processed.`);
      
      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Deposit amount must be strictly greater than $0.00.');

      acc.balance = parseFloat((acc.balance + amount).toFixed(2));

      const txnRef = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTxn = {
        id: (data.transactions.length ? Math.max(...data.transactions.map(t => t.id)) : 0) + 1,
        transactionRef: txnRef,
        accountNumber: acc.accountNumber,
        transactionType: 'DEPOSIT',
        amount: amount,
        balanceAfter: acc.balance,
        description: body.description || 'Cash Deposit at Teller Counter',
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      };

      data.transactions.unshift(newTxn);
      MockDB.saveData(data);
      MockDB.logAudit('CASH_DEPOSIT', 'teller', `Credited $${amount.toFixed(2)} to account ${acc.accountNumber}. Ref: ${txnRef}`);

      return {
        success: true,
        message: 'Deposit completed successfully.',
        data: MockDB.hydrateTransaction(newTxn, data)
      };
    }

    if (endpoint === '/api/transactions/withdraw' && method === 'POST') {
      const acc = data.accounts.find(a => a.accountNumber === body.accountNumber);
      if (!acc) throw new Error(`Account ${body.accountNumber} not found.`);
      if (acc.status !== 'ACTIVE') throw new Error(`Account is currently ${acc.status}. Withdrawals cannot be processed.`);

      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Withdrawal amount must be strictly greater than $0.00.');

      const available = parseFloat((acc.balance - acc.minimumBalance).toFixed(2));
      if (available < amount) {
        throw new Error(`Insufficient funds: Minimum reserve of $${acc.minimumBalance.toFixed(2)} must be maintained. Maximum available to withdraw is $${Math.max(0, available).toFixed(2)}.`);
      }

      acc.balance = parseFloat((acc.balance - amount).toFixed(2));

      const txnRef = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTxn = {
        id: (data.transactions.length ? Math.max(...data.transactions.map(t => t.id)) : 0) + 1,
        transactionRef: txnRef,
        accountNumber: acc.accountNumber,
        transactionType: 'WITHDRAWAL',
        amount: amount,
        balanceAfter: acc.balance,
        description: body.description || 'Cash Withdrawal at Teller Window',
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      };

      data.transactions.unshift(newTxn);
      MockDB.saveData(data);
      MockDB.logAudit('CASH_WITHDRAWAL', 'teller', `Debited $${amount.toFixed(2)} from account ${acc.accountNumber}. Ref: ${txnRef}`);

      return {
        success: true,
        message: 'Withdrawal completed successfully.',
        data: MockDB.hydrateTransaction(newTxn, data)
      };
    }

    // 6. Transfer routes
    if (endpoint === '/api/transfers' && method === 'GET') {
      return {
        success: true,
        data: [...data.transfers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      };
    }

    if (endpoint.match(/^\/api\/transfers\/TRF-/) && method === 'GET') {
      const ref = endpoint.split('/').pop();
      const trf = data.transfers.find(t => t.transferRef === ref);
      if (!trf) throw new Error(`Transfer advice ${ref} not found.`);
      return { success: true, data: trf };
    }

    if (endpoint === '/api/transfers' && method === 'POST') {
      const srcAcc = data.accounts.find(a => a.accountNumber === body.sourceAccountNumber);
      const dstAcc = data.accounts.find(a => a.accountNumber === body.destinationAccountNumber);

      if (!srcAcc) throw new Error(`Source account ${body.sourceAccountNumber} not found.`);
      if (!dstAcc) throw new Error(`Destination account ${body.destinationAccountNumber} not found.`);

      if (srcAcc.accountNumber === dstAcc.accountNumber) {
        throw new Error('Source and destination accounts cannot be identical.');
      }
      if (srcAcc.status !== 'ACTIVE') throw new Error(`Source account is ${srcAcc.status}.`);
      if (dstAcc.status !== 'ACTIVE') throw new Error(`Destination account is ${dstAcc.status}.`);

      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Transfer amount must be strictly greater than $0.00.');

      const available = parseFloat((srcAcc.balance - srcAcc.minimumBalance).toFixed(2));
      if (available < amount) {
        throw new Error(`Transfer declined: Source account requires minimum reserve of $${srcAcc.minimumBalance.toFixed(2)}. Available: $${Math.max(0, available).toFixed(2)}.`);
      }

      // Execute atomic balance update
      srcAcc.balance = parseFloat((srcAcc.balance - amount).toFixed(2));
      dstAcc.balance = parseFloat((dstAcc.balance + amount).toFixed(2));

      const trfRef = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const srcCust = data.customers.find(c => c.id === srcAcc.customerId);
      const dstCust = data.customers.find(c => c.id === dstAcc.customerId);

      // Debit leg
      data.transactions.unshift({
        id: (data.transactions.length ? Math.max(...data.transactions.map(t => t.id)) : 0) + 1,
        transactionRef: `TXN-${nowIso.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        accountNumber: srcAcc.accountNumber,
        transactionType: 'TRANSFER_DEBIT',
        amount: amount,
        balanceAfter: srcAcc.balance,
        description: `Transfer to ${dstCust ? dstCust.firstName + ' ' + dstCust.lastName : dstAcc.accountNumber} (${dstAcc.accountNumber})`,
        status: 'SUCCESS',
        createdAt: nowIso
      });

      // Credit leg
      data.transactions.unshift({
        id: (data.transactions.length ? Math.max(...data.transactions.map(t => t.id)) : 0) + 1,
        transactionRef: `TXN-${nowIso.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        accountNumber: dstAcc.accountNumber,
        transactionType: 'TRANSFER_CREDIT',
        amount: amount,
        balanceAfter: dstAcc.balance,
        description: `Transfer from ${srcCust ? srcCust.firstName + ' ' + srcCust.lastName : srcAcc.accountNumber} (${srcAcc.accountNumber})`,
        status: 'SUCCESS',
        createdAt: nowIso
      });

      // Transfer Advice Record
      const newTransfer = {
        id: (data.transfers.length ? Math.max(...data.transfers.map(t => t.id)) : 0) + 1,
        transferRef: trfRef,
        sourceAccountNumber: srcAcc.accountNumber,
        destinationAccountNumber: dstAcc.accountNumber,
        sourceCustomerName: srcCust ? `${srcCust.firstName} ${srcCust.lastName}` : srcAcc.accountNumber,
        destinationCustomerName: dstCust ? `${dstCust.firstName} ${dstCust.lastName}` : dstAcc.accountNumber,
        amount: amount,
        remark: body.remark || 'Electronic Funds Transfer',
        status: 'SUCCESS',
        createdAt: nowIso
      };

      data.transfers.unshift(newTransfer);
      MockDB.saveData(data);
      MockDB.logAudit('FUND_TRANSFER', 'teller', `Transferred $${amount.toFixed(2)} from ${srcAcc.accountNumber} to ${dstAcc.accountNumber}. Ref: ${trfRef}`);

      return {
        success: true,
        message: 'Fund transfer executed successfully.',
        data: newTransfer
      };
    }

    // 7. Reports & Statements
    if (endpoint.startsWith('/api/reports/statement')) {
      const url = new URL('http://dummy' + endpoint);
      const accNum = url.searchParams.get('accountNumber');
      const fromDate = url.searchParams.get('fromDate');
      const toDate = url.searchParams.get('toDate');

      const acc = data.accounts.find(a => a.accountNumber === accNum);
      if (!acc) throw new Error(`Account ${accNum} not found.`);

      const hydratedAcc = MockDB.hydrateAccount(acc, data);

      let txns = data.transactions
        .filter(t => t.accountNumber === accNum)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Calculate opening balance
      let openingBalance = 0;
      if (fromDate) {
        const fromTs = new Date(fromDate).getTime();
        const beforeTxns = txns.filter(t => new Date(t.createdAt).getTime() < fromTs);
        if (beforeTxns.length) {
          openingBalance = beforeTxns[beforeTxns.length - 1].balanceAfter;
        }
        txns = txns.filter(t => new Date(t.createdAt).getTime() >= fromTs);
      }

      if (toDate) {
        const toTs = new Date(toDate + 'T23:59:59').getTime();
        txns = txns.filter(t => new Date(t.createdAt).getTime() <= toTs);
      }

      let totalCredits = 0;
      let totalDebits = 0;
      txns.forEach(t => {
        if (t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_CREDIT') {
          totalCredits += parseFloat(t.amount);
        } else {
          totalDebits += parseFloat(t.amount);
        }
      });

      return {
        success: true,
        data: {
          account: hydratedAcc,
          transactions: txns.map(t => MockDB.hydrateTransaction(t, data)),
          fromDate: fromDate || null,
          toDate: toDate || new Date().toISOString().split('T')[0],
          openingBalance: openingBalance,
          closingBalance: acc.balance,
          totalCredits: totalCredits,
          totalDebits: totalDebits,
          currentBalance: acc.balance
        }
      };
    }

    if (endpoint === '/api/reports/financial-summary') {
      const totalDeposits = data.transactions
        .filter(t => t.transactionType === 'DEPOSIT' || t.transactionType === 'TRANSFER_CREDIT')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const totalWithdrawals = data.transactions
        .filter(t => t.transactionType === 'WITHDRAWAL' || t.transactionType === 'TRANSFER_DEBIT')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        success: true,
        data: {
          totalDeposits,
          totalWithdrawals,
          netCashFlow: totalDeposits - totalWithdrawals,
          activeAccounts: data.accounts.filter(a => a.status === 'ACTIVE').length,
          totalCustomers: data.customers.length
        }
      };
    }

    // 8. Admin routes
    if (endpoint === '/api/admin/users') {
      return { success: true, data: data.users };
    }

    if (endpoint.includes('/role') && endpoint.startsWith('/api/admin/users/')) {
      const url = new URL('http://dummy' + endpoint);
      const userId = parseInt(endpoint.split('/')[4]);
      const newRole = url.searchParams.get('role');
      const user = data.users.find(u => u.id === userId);
      if (!user) throw new Error('User not found.');
      user.role = newRole;
      MockDB.saveData(data);
      MockDB.logAudit('USER_ROLE_UPDATE', 'admin', `Changed user '${user.username}' role to ${newRole}`);
      return { success: true, data: user };
    }

    if (endpoint.includes('/status') && endpoint.startsWith('/api/admin/users/')) {
      const userId = parseInt(endpoint.split('/')[4]);
      const user = data.users.find(u => u.id === userId);
      if (!user) throw new Error('User not found.');
      user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      MockDB.saveData(data);
      MockDB.logAudit('USER_STATUS_CHANGE', 'admin', `Changed user '${user.username}' status to ${user.status}`);
      return { success: true, data: user };
    }

    if (endpoint === '/api/admin/audit-logs') {
      return {
        success: true,
        data: [...data.auditLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      };
    }

    // Fallback error
    throw new Error(`Endpoint not mapped: [${method} ${endpoint}]`);
  },

  // Reset demo state utility
  resetDemoData() {
    MockDB.reset();
    localStorage.removeItem('apex_bank_user');
    window.location.reload();
  },

  // Auth Endpoints
  auth: {
    login(username, password) {
      return API.request('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      });
    },
    logout() {
      return API.request('/api/auth/logout', { method: 'POST' });
    },
    currentUser() {
      return API.request('/api/auth/current-user');
    },
    register(user) {
      return API.request('/api/auth/register', {
        method: 'POST',
        body: user
      });
    }
  },

  // Dashboard Endpoints
  dashboard: {
    getStats() {
      return API.request('/api/dashboard/stats');
    }
  },

  // Customer Endpoints
  customers: {
    getAll() {
      return API.request('/api/customers');
    },
    search(query) {
      return API.request(`/api/customers/search?query=${encodeURIComponent(query || '')}`);
    },
    getById(id) {
      return API.request(`/api/customers/${id}`);
    },
    create(customer) {
      return API.request('/api/customers', {
        method: 'POST',
        body: customer
      });
    },
    update(id, customer) {
      return API.request(`/api/customers/${id}`, {
        method: 'PUT',
        body: customer
      });
    },
    toggleStatus(id) {
      return API.request(`/api/customers/${id}/status`, { method: 'PATCH' });
    }
  },

  // Account Endpoints
  accounts: {
    getAll() {
      return API.request('/api/accounts');
    },
    search(query) {
      return API.request(`/api/accounts/search?query=${encodeURIComponent(query || '')}`);
    },
    getByNumber(accountNumber) {
      return API.request(`/api/accounts/${accountNumber}`);
    },
    getByCustomerId(customerId) {
      return API.request(`/api/accounts/customer/${customerId}`);
    },
    create(account) {
      return API.request('/api/accounts', {
        method: 'POST',
        body: account
      });
    },
    updateStatus(accountNumber, status) {
      return API.request(`/api/accounts/${accountNumber}/status?status=${status}`, { method: 'PATCH' });
    }
  },

  // Transaction Endpoints
  transactions: {
    getAll() {
      return API.request('/api/transactions');
    },
    getRecent() {
      return API.request('/api/transactions/recent');
    },
    getByAccount(accountNumber) {
      return API.request(`/api/transactions/account/${accountNumber}`);
    },
    filter(type, query, startDate, endDate) {
      let params = new URLSearchParams();
      if (type) params.append('type', type);
      if (query) params.append('query', query);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return API.request(`/api/transactions/filter?${params.toString()}`);
    },
    getByRef(ref) {
      return API.request(`/api/transactions/${ref}`);
    },
    deposit(accountNumber, amount, description) {
      return API.request('/api/transactions/deposit', {
        method: 'POST',
        body: { accountNumber, amount, description }
      });
    },
    withdraw(accountNumber, amount, description) {
      return API.request('/api/transactions/withdraw', {
        method: 'POST',
        body: { accountNumber, amount, description }
      });
    }
  },

  // Transfer Endpoints
  transfers: {
    getAll() {
      return API.request('/api/transfers');
    },
    search(query) {
      return API.request(`/api/transfers/search?query=${encodeURIComponent(query || '')}`);
    },
    getByRef(ref) {
      return API.request(`/api/transfers/${ref}`);
    },
    execute(sourceAccountNumber, destinationAccountNumber, amount, remark) {
      return API.request('/api/transfers', {
        method: 'POST',
        body: { sourceAccountNumber, destinationAccountNumber, amount, remark }
      });
    }
  },

  // Report Endpoints
  reports: {
    getStatement(accountNumber, fromDate, toDate) {
      let params = new URLSearchParams({ accountNumber });
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      return API.request(`/api/reports/statement?${params.toString()}`);
    },
    getFinancialSummary() {
      return API.request('/api/reports/financial-summary');
    }
  },

  // Admin Endpoints
  admin: {
    getUsers() {
      return API.request('/api/admin/users');
    },
    updateUserRole(id, role) {
      return API.request(`/api/admin/users/${id}/role?role=${role}`, { method: 'PATCH' });
    },
    toggleUserStatus(id) {
      return API.request(`/api/admin/users/${id}/status`, { method: 'PATCH' });
    },
    getAuditLogs() {
      return API.request('/api/admin/audit-logs');
    }
  }
};
