/**
 * Simple Banking Management System - Authentication & Authorization Manager
 */

const Auth = {
  currentUser: null,

  init() {
    const saved = localStorage.getItem('apex_bank_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.updateUIForUser();
      } catch (e) {
        localStorage.removeItem('apex_bank_user');
      }
    }
  },

  async login(username, password) {
    try {
      const res = await API.auth.login(username, password);
      if (res.success && res.data) {
        this.currentUser = res.data;
        localStorage.setItem('apex_bank_user', JSON.stringify(this.currentUser));
        this.updateUIForUser();
        return { success: true, user: this.currentUser };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async logout() {
    try {
      await API.auth.logout();
    } catch (e) {
      // ignore
    }
    this.currentUser = null;
    localStorage.removeItem('apex_bank_user');
    this.updateUIForUser();
    App.showToast('info', 'Logged Out', 'You have been securely signed out.');
    App.switchView('dashboard');
  },

  isAuthenticated() {
    return this.currentUser !== null;
  },

  hasRole(role) {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  },

  hasAnyRole(...roles) {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role);
  },

  updateUIForUser() {
    const user = this.currentUser;
    const loginBtn = document.getElementById('topbarLoginBtn');
    const logoutBtn = document.getElementById('topbarLogoutBtn');
    const userPill = document.getElementById('topbarRolePill');
    const userNameElem = document.getElementById('sidebarUserName');
    const userRoleElem = document.getElementById('sidebarUserRole');
    const userAvatarElem = document.getElementById('sidebarUserAvatar');
    const adminNavSection = document.getElementById('navAdminSection');

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      
      if (userPill) {
        userPill.style.display = 'inline-block';
        userPill.className = 'role-pill ' + (user.role === 'ROLE_ADMIN' ? 'admin' : user.role === 'ROLE_EMPLOYEE' ? 'employee' : 'customer');
        userPill.textContent = user.role.replace('ROLE_', '');
      }

      if (userNameElem) userNameElem.textContent = user.fullName || user.username;
      if (userRoleElem) userRoleElem.textContent = user.role.replace('ROLE_', '') + ' PORTAL';
      if (userAvatarElem) userAvatarElem.textContent = (user.fullName || user.username).substring(0, 2).toUpperCase();

      // RBAC navigation show/hide
      if (adminNavSection) {
        adminNavSection.style.display = user.role === 'ROLE_ADMIN' ? 'block' : 'none';
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userPill) {
        userPill.style.display = 'inline-block';
        userPill.className = 'role-pill employee';
        userPill.textContent = 'GUEST (VIEW-ONLY)';
      }
      if (userNameElem) userNameElem.textContent = 'Demo Guest User';
      if (userRoleElem) userRoleElem.textContent = 'SIGN IN FOR ACTIONS';
      if (userAvatarElem) userAvatarElem.textContent = 'GU';

      if (adminNavSection) {
        adminNavSection.style.display = 'none';
      }
    }
  }
};
