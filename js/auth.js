/**
 * ERROUGA CAR MANAGER - Module d'Authentification & Sécurité Propriétaire
 * Propriétaire : M. Mohamed Rouga
 */

const AuthModule = {
  currentUser: null,
  SESSION_KEY: "errouga_active_session",

  init() {
    // Vérifie si une session est déjà active
    const saved = sessionStorage.getItem(this.SESSION_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }

    if (!this.currentUser) {
      this.showLoginModal();
    } else {
      this.applyUserSession();
    }

    this.bindEvents();
  },

  bindEvents() {
    const loginForm = document.getElementById("auth-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = document.getElementById("auth-username").value.trim();
        const passVal = document.getElementById("auth-password").value.trim();
        this.login(userVal, passVal);
      });
    }

    // Profil rapide Mohamed Rouga
    const quickRougaBtn = document.getElementById("quick-login-rouga");
    if (quickRougaBtn) {
      quickRougaBtn.addEventListener("click", () => {
        document.getElementById("auth-username").value = "rouga";
        document.getElementById("auth-password").value = "admin";
        this.login("rouga", "admin");
      });
    }

    // Profil rapide Réception
    const quickStaffBtn = document.getElementById("quick-login-staff");
    if (quickStaffBtn) {
      quickStaffBtn.addEventListener("click", () => {
        document.getElementById("auth-username").value = "reception";
        document.getElementById("auth-password").value = "staff";
        this.login("reception", "staff");
      });
    }

    // Bouton de déconnexion / verrouillage
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }
  },

  login(username, password) {
    const db = StorageManager.load();
    const user = db.users.find(u => 
      (u.username.toLowerCase() === username.toLowerCase() || u.pin === password) &&
      (u.password === password || u.pin === password)
    );

    if (user) {
      this.currentUser = user;
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      this.hideLoginModal();
      this.applyUserSession();
      if (typeof AppModule !== 'undefined') {
        AppModule.showToast(`Bienvenue M. ${user.name} !`, "success");
        AppModule.refreshAll();
      }
      return true;
    } else {
      const errEl = document.getElementById("auth-error-msg");
      if (errEl) {
        errEl.textContent = "Identifiants incorrects. Veuillez réessayer.";
        errEl.style.display = "block";
      }
      return false;
    }
  },

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem(this.SESSION_KEY);
    this.showLoginModal();
    if (typeof AppModule !== 'undefined') {
      AppModule.showToast("Session verrouillée", "info");
    }
  },

  showLoginModal() {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
      overlay.style.display = "flex";
      const errEl = document.getElementById("auth-error-msg");
      if (errEl) errEl.style.display = "none";
    }
  },

  hideLoginModal() {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  },

  applyUserSession() {
    if (!this.currentUser) return;
    const nameEl = document.getElementById("session-user-name");
    const roleEl = document.getElementById("session-user-role");
    const avatarEl = document.getElementById("session-user-avatar");

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (roleEl) roleEl.textContent = this.currentUser.roleLabel;
    if (avatarEl) {
      avatarEl.textContent = this.currentUser.name.split(" ").map(w => w[0]).join("");
    }
  }
};
