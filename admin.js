/**
 * Simple Banking Management System - Administration Module Controller
 * Manages system users, employee registration, role assignments, and audit logs.
 */

const Admin = {
  usersList: [],
  logsList: [],

  async init() {
    await this.loadUsers();
    await this.loadAuditLogs();
  },

  async loadUsers() {
    try {
      const res = await API.admin.getUsers();
      if (res.success && res.data) {
        this.usersList = res.data;
        this.renderUsersTable(this.usersList);
      }
    } catch (err) {
      console.warn('Admin users load error:', err);
    }
  },

  renderUsersTable(users) {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      return `
        <tr>
          <td><strong style="color:var(--navy-900);">${u.username}</strong></td>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
          <td>
            <select class="select-filter" style="padding:4px 8px; font-size:12px;" onchange="Admin.changeRole(${u.id}, this.value)">
              <option value="ROLE_CUSTOMER" ${u.role === 'ROLE_CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
              <option value="ROLE_EMPLOYEE" ${u.role === 'ROLE_EMPLOYEE' ? 'selected' : ''}>EMPLOYEE</option>
              <option value="ROLE_ADMIN" ${u.role === 'ROLE_ADMIN' ? 'selected' : ''}>ADMIN</option>
            </select>
          </td>
          <td><span class="badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="Admin.toggleUserStatus(${u.id})">
              ${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async changeRole(userId, newRole) {
    try {
      const res = await API.admin.updateUserRole(userId, newRole);
      if (res.success) {
        App.showToast('success', 'Role Updated', `User role changed to ${newRole}`);
        await this.loadUsers();
      }
    } catch (err) {
      App.showToast('error', 'Role Update Failed', err.message);
    }
  },

  async toggleUserStatus(userId) {
    try {
      const res = await API.admin.toggleUserStatus(userId);
      if (res.success) {
        App.showToast('success', 'Status Changed', `User status is now ${res.data.status}`);
        await this.loadUsers();
      }
    } catch (err) {
      App.showToast('error', 'Status Change Failed', err.message);
    }
  },

  async loadAuditLogs() {
    try {
      const res = await API.admin.getAuditLogs();
      if (res.success && res.data) {
        this.logsList = res.data;
        this.renderLogsTable(this.logsList);
      }
    } catch (err) {
      console.warn('Audit logs load error:', err);
    }
  },

  renderLogsTable(logs) {
    const tbody = document.getElementById('adminLogsTableBody');
    if (!tbody) return;

    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No audit entries logged yet.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => {
      return `
        <tr>
          <td><span style="font-size:12px; color:var(--slate-600);">${new Date(l.createdAt).toLocaleString()}</span></td>
          <td><strong style="color:var(--navy-900); font-family:monospace; font-size:12px;">${l.action}</strong></td>
          <td><span class="badge badge-info">${l.performedBy}</span></td>
          <td style="font-size:12px; color:var(--slate-700);">${l.details || 'N/A'}</td>
          <td><span style="font-family:monospace; font-size:11px; color:var(--slate-500);">${l.ipAddress || '127.0.0.1'}</span></td>
        </tr>
      `;
    }).join('');
  },

  async handleRegisterEmployee(e) {
    e.preventDefault();
    const form = e.target;
    const req = {
      username: form.username.value.trim(),
      password: form.password.value,
      email: form.email.value.trim(),
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      role: form.role.value
    };

    try {
      const res = await API.auth.register(req);
      if (res.success) {
        App.showToast('success', 'Staff Registered', `User '${res.data.username}' registered as ${res.data.role}`);
        App.closeModal('newEmployeeModal');
        form.reset();
        await this.loadUsers();
      }
    } catch (err) {
      App.showToast('error', 'Registration Failed', err.message);
    }
  }
};
