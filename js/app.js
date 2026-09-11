/**
 * ERROUGA CAR MANAGER - Contrôleur Principal & Interface
 * Propriétaire : M. Mohamed Rouga | Marrakech - Maroc
 */

const AppModule = {
  currentView: "dashboard",

  init() {
    this.bindNavigation();
    this.bindGlobalEvents();
    this.refreshAll();
  },

  bindNavigation() {
    document.querySelectorAll(".nav-item[data-view]").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = item.getAttribute("data-view");
        this.switchView(targetView);
      });
    });

    // Mobile sidebar toggle
    const menuToggleBtn = document.getElementById("btn-menu-toggle");
    const sidebar = document.getElementById("main-sidebar");
    if (menuToggleBtn && sidebar) {
      menuToggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }
  },

  switchView(viewName) {
    this.currentView = viewName;

    // Mise à jour des classes actives sur la barre latérale
    document.querySelectorAll(".nav-item[data-view]").forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Fermer le menu mobile si ouvert
    const sidebar = document.getElementById("main-sidebar");
    if (sidebar) sidebar.classList.remove("mobile-open");

    // Affichage de la vue
    document.querySelectorAll(".view-container").forEach(view => {
      view.classList.remove("active");
    });
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add("active");
      const titleEl = document.getElementById("page-current-title");
      if (titleEl) {
        const titles = {
          dashboard: "Tableau de Bord & Activité",
          availability: "Planning & Disponibilité des Véhicules",
          fleet: "Gestion de la Flotte Errouga",
          bookings: "Réservations & Contrats de Location",
          customers: "Fichier Clients (CRM)",
          finance: "Caisse, Factures & Cautions",
          settings: "Paramètres de l'Agence & Sauvegardes"
        };
        titleEl.textContent = titles[viewName] || "Errouga Car Manager";
      }
    }

    // Actualiser le rendu spécifique à la vue
    this.renderCurrentView();
  },

  renderCurrentView() {
    switch (this.currentView) {
      case "dashboard":
        this.renderDashboard();
        break;
      case "availability":
        this.renderAvailabilityView();
        break;
      case "fleet":
        this.renderFleetView();
        break;
      case "bookings":
        this.renderBookingsView();
        break;
      case "customers":
        this.renderCustomersView();
        break;
      case "finance":
        this.renderFinanceView();
        break;
      case "settings":
        this.renderSettingsView();
        break;
    }
  },

  refreshAll() {
    this.renderHeaderInfo();
    this.renderCurrentView();
  },

  renderHeaderInfo() {
    const db = StorageManager.load();
    const phoneEl = document.getElementById("header-agency-phone");
    if (phoneEl) {
      phoneEl.textContent = db.agency.phone1 || "+212 660-990242";
      phoneEl.href = `tel:${(db.agency.phone1 || '').replace(/\s+/g, '')}`;
    }
  },

  openAddCarModal() {
    const modal = document.getElementById("modal-add-car");
    if (modal) modal.classList.add("active");
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  },

  /* ==========================================================================
     1. TABLEAU DE BORD (DASHBOARD)
     ========================================================================== */
  renderDashboard() {
    const db = StorageManager.load();
    const fleet = db.fleet || [];
    const bookings = db.bookings || [];

    // Compteurs
    const totalCars = fleet.length;
    const rentedCars = fleet.filter(c => c.status === "loue").length;
    const availableCars = fleet.filter(c => c.status === "disponible").length;
    const maintenanceCars = fleet.filter(c => c.status === "maintenance").length;
    const reservedCars = fleet.filter(c => c.status === "reserve").length;

    // Taux d'occupation
    const occupancyRate = totalCars > 0 ? Math.round((rentedCars / totalCars) * 100) : 0;

    // Chiffre d'affaires & Cautions
    const currentMonthRevenue = bookings
      .filter(b => b.status !== "annulee")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const activeDeposits = bookings
      .filter(b => b.status === "en_cours" || b.status === "confirmee")
      .reduce((sum, b) => sum + (b.depositAmount || 0), 0);

    // Mettre à jour les compteurs du DOM
    const elTotal = document.getElementById("stat-total-cars");
    const elRented = document.getElementById("stat-rented-cars");
    const elAvailable = document.getElementById("stat-available-cars");
    const elRevenue = document.getElementById("stat-revenue-month");
    const elOccupancy = document.getElementById("stat-occupancy-rate");
    const elDeposits = document.getElementById("stat-active-deposits");

    if (elTotal) elTotal.textContent = totalCars;
    if (elRented) elRented.textContent = rentedCars;
    if (elAvailable) elAvailable.textContent = availableCars;
    if (elRevenue) elRevenue.textContent = `${currentMonthRevenue.toLocaleString("fr-FR")} DH`;
    if (elOccupancy) elOccupancy.textContent = `${occupancyRate}%`;
    if (elDeposits) elDeposits.textContent = `${activeDeposits.toLocaleString("fr-FR")} DH`;

    // Mettre à jour les badges dans la barre latérale
    const badgeCars = document.getElementById("nav-badge-fleet");
    const badgeBookings = document.getElementById("nav-badge-bookings");
    if (badgeCars) badgeCars.textContent = totalCars;
    if (badgeBookings) badgeBookings.textContent = bookings.filter(b => b.status === "en_cours" || b.status === "confirmee").length;

    // Alertes du jour
    this.renderDashboardAlerts(db);

    // Dernières réservations
    this.renderRecentBookingsTable(db);
  },

  renderDashboardAlerts(db) {
    const alertsContainer = document.getElementById("dashboard-alerts-box");
    if (!alertsContainer) return;

    let alerts = [];

    // Alertes entretiens / vidanges
    db.fleet.forEach(car => {
      const remainingKm = (car.maintenance.nextOilChangeKm || 0) - (car.mileage || 0);
      if (remainingKm <= 1500) {
        alerts.push({
          type: "warning",
          icon: "🔧",
          text: `Vidange imminente pour <strong>${car.brand} ${car.model}</strong> (${car.matricule}) : reste <strong>${remainingKm} km</strong>.`
        });
      }
    });

    // Alertes retours en cours
    const activeRentals = db.bookings.filter(b => b.status === "en_cours");
    if (activeRentals.length > 0) {
      alerts.push({
        type: "info",
        icon: "🚗",
        text: `<strong>${activeRentals.length} véhicule(s) actuellement en circulation</strong> sur Marrakech et ses environs.`
      });
    }

    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div style="padding: 12px 18px; border-radius: var(--radius-sm); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-size: 0.88rem; font-weight: 600;">
          ✓ Tous les véhicules sont à jour et conformes. Aucun incident signalé.
        </div>
      `;
    } else {
      alertsContainer.innerHTML = alerts.map(a => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 18px; margin-bottom: 10px; border-radius: var(--radius-sm); background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #FFF; font-size: 0.88rem;">
          <span style="font-size: 1.2rem;">${a.icon}</span>
          <div>${a.text}</div>
        </div>
      `).join("");
    }
  },

  renderRecentBookingsTable(db) {
    const tbody = document.getElementById("tbody-recent-bookings");
    if (!tbody) return;

    const recent = db.bookings.slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 20px;">Aucune réservation enregistrée.</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(b => {
      const car = db.fleet.find(c => c.id === b.carId) || {};
      const statusBadge = this.getStatusBadge(b.status);
      const startFmt = new Date(b.pickupDate).toLocaleDateString("fr-FR");
      const endFmt = new Date(b.dropoffDate).toLocaleDateString("fr-FR");

      return `
        <tr>
          <td><strong style="color: var(--gold-400);">${b.contractNumber}</strong></td>
          <td><strong>${b.customerName}</strong><br><small style="color: var(--text-dim);">${b.customerPhone}</small></td>
          <td>${car.brand || ''} ${car.model || ''}<br><small style="color: var(--text-dim); font-family: monospace;">${car.matricule || ''}</small></td>
          <td>${startFmt} → ${endFmt}<br><small style="color: var(--gold-400);">${b.days} jour(s)</small></td>
          <td><strong>${b.totalAmount} DH</strong></td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <button class="btn btn-sm btn-secondary" onclick="ContractModule.openContract('${b.id}')">📄 Contrat & État</button>
          </td>
        </tr>
      `;
    }).join("");
  },

  /* ==========================================================================
     2. PLANNING & DISPONIBILITÉ (GANTT TIMELINE)
     ========================================================================== */
  renderAvailabilityView() {
    const db = StorageManager.load();
    const container = document.getElementById("timeline-table-body");
    const headerRow = document.getElementById("timeline-header-days");
    if (!container || !headerRow) return;

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -2; i < 12; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }

    headerRow.innerHTML = `<th class="timeline-car-col">Véhicule & Statut</th>` +
      days.map(d => {
        const isToday = d.toDateString() === today.toDateString();
        const dayName = d.toLocaleDateString("fr-FR", { weekday: "short" });
        const dayNum = d.getDate();
        const monthName = d.toLocaleDateString("fr-FR", { month: "short" });
        return `
          <th class="${isToday ? 'today' : ''}">
            <div>${dayName}</div>
            <div style="font-size: 1.05rem; font-weight: 800;">${dayNum}</div>
            <div style="font-size: 0.68rem; text-transform: uppercase;">${monthName}</div>
          </th>
        `;
      }).join("");

    container.innerHTML = db.fleet.map(car => {
      const carBookings = db.bookings.filter(b => b.carId === car.id && b.status !== "annulee");

      const dayCells = days.map(d => {
        const dTime = d.getTime();
        const match = carBookings.find(b => {
          const bStart = new Date(b.pickupDate);
          bStart.setHours(0, 0, 0, 0);
          const bEnd = new Date(b.dropoffDate);
          bEnd.setHours(23, 59, 59, 999);
          return dTime >= bStart.getTime() && dTime <= bEnd.getTime();
        });

        if (match) {
          const colorClass = match.status === "en_cours" ? "background: #2563EB;" : "background: #D97706;";
          return `
            <td class="timeline-slot" onclick="ContractModule.openContract('${match.id}')" title="Réservation ${match.contractNumber} (${match.customerName})">
              <div class="timeline-event-pill" style="${colorClass}">
                ${match.customerName.split(" ")[0]}
              </div>
            </td>
          `;
        } else {
          return `
            <td class="timeline-slot" onclick="BookingModule.openNewBookingModal('${car.id}', '${d.toISOString().slice(0, 10)}T10:00')" title="Cliquer pour réserver ce jour" style="cursor: pointer;">
              <span style="opacity: 0.15; font-size: 0.75rem;">+</span>
            </td>
          `;
        }
      }).join("");

      return `
        <tr>
          <td class="timeline-car-col">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${car.images[0]}" style="width: 44px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-subtle);" onerror="this.src='assets/images/clio_5_1.jpg'">
              <div>
                <div style="font-size: 0.88rem; font-weight: 800; color: #FFF;">${car.brand} ${car.model}</div>
                <div style="font-size: 0.72rem; color: var(--gold-400); font-family: monospace;">${car.matricule} • ${car.priceDay} DH/j</div>
              </div>
            </div>
          </td>
          ${dayCells}
        </tr>
      `;
    }).join("");
  },

  /* ==========================================================================
     3. GESTION DE LA FLOTTE (FLEET)
     ========================================================================== */
  renderFleetView() {
    const db = StorageManager.load();
    const container = document.getElementById("fleet-cards-grid");
    if (!container) return;

    container.innerHTML = db.fleet.map(car => {
      const statusLabels = {
        disponible: { text: "Disponible", class: "badge-disponible" },
        loue: { text: "En Location", class: "badge-loue" },
        reserve: { text: "Réservé", class: "badge-reserve" },
        maintenance: { text: "En Maintenance", class: "badge-maintenance" }
      };
      const badge = statusLabels[car.status] || { text: car.status, class: "badge-disponible" };

      return `
        <div class="car-card">
          <div class="car-image-box">
            <img src="${car.images[0]}" alt="${car.brand} ${car.model}" onerror="this.src='assets/images/clio_5_1.jpg'">
            <span class="car-status-badge ${badge.class}">${badge.text}</span>
            <span class="car-matricule-tag">${car.matricule}</span>
          </div>
          <div class="car-body">
            <div class="car-title-wrap">
              <h3 class="car-title">${car.brand} ${car.model}</h3>
            </div>
            <div class="car-category">${car.category} • Année ${car.year}</div>

            <div class="car-specs-grid">
              <div class="spec-item">⛽ ${car.fuel}</div>
              <div class="spec-item">⚙️ ${car.gearbox}</div>
              <div class="spec-item">👥 ${car.seats} Places</div>
              <div class="spec-item">🛣️ ${car.mileage.toLocaleString("fr-FR")} KM</div>
            </div>

            <div style="font-size: 0.76rem; color: var(--text-dim); margin-bottom: 12px;">
              🛡️ Assurance : <strong style="color: #FFF;">jusqu'au ${new Date(car.maintenance.assuranceExpiry).toLocaleDateString("fr-FR")}</strong><br>
              🔧 Prochaine vidange : <strong style="color: var(--gold-400);">${car.maintenance.nextOilChangeKm} KM</strong>
            </div>

            <div class="car-pricing-box">
              <div>
                <span class="price-main">${car.priceDay} DH</span>
                <span class="price-period">/jour</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                Caution: <strong style="color: #FFF;">${car.deposit} DH</strong>
              </div>
            </div>

            <div class="car-actions">
              <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="BookingModule.openNewBookingModal('${car.id}')">
                📅 Réserver
              </button>
              <button class="btn btn-sm btn-secondary" onclick="AppModule.toggleCarStatus('${car.id}')" title="Changer de statut">
                🔄 Statut
              </button>
              <button class="btn btn-sm btn-danger" onclick="AppModule.deleteCar('${car.id}')" title="Supprimer">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  toggleCarStatus(carId) {
    const db = StorageManager.load();
    const car = db.fleet.find(c => c.id === carId);
    if (!car) return;

    const statuses = ["disponible", "loue", "reserve", "maintenance"];
    const nextIdx = (statuses.indexOf(car.status) + 1) % statuses.length;
    car.status = statuses[nextIdx];

    StorageManager.save(db);
    this.showToast(`Statut de ${car.brand} ${car.model} passé à : ${car.status.toUpperCase()}`, "info");
    this.refreshAll();
  },

  deleteCar(carId) {
    if (!confirm("Voulez-vous vraiment supprimer ce véhicule de la flotte ?")) return;
    const db = StorageManager.load();
    db.fleet = db.fleet.filter(c => c.id !== carId);
    StorageManager.save(db);
    this.showToast("Véhicule supprimé de la flotte", "warning");
    this.refreshAll();
  },

  /* ==========================================================================
     4. GESTION DES RÉSERVATIONS (BOOKINGS)
     ========================================================================== */
  renderBookingsView() {
    const db = StorageManager.load();
    const tbody = document.getElementById("tbody-all-bookings");
    if (!tbody) return;

    if (db.bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 25px; color: var(--text-dim);">Aucune réservation trouvée.</td></tr>`;
      return;
    }

    tbody.innerHTML = db.bookings.map(b => {
      const car = db.fleet.find(c => c.id === b.carId) || {};
      const statusBadge = this.getStatusBadge(b.status);
      const startFmt = new Date(b.pickupDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
      const endFmt = new Date(b.dropoffDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

      let actionButtons = `
        <button class="btn btn-sm btn-secondary" onclick="ContractModule.openContract('${b.id}')" title="Imprimer le contrat">📄 Contrat</button>
      `;

      if (b.status === "confirmee") {
        actionButtons += `<button class="btn btn-sm btn-primary" onclick="BookingModule.checkInBooking('${b.id}')">🔑 Départ</button>`;
      } else if (b.status === "en_cours") {
        actionButtons += `<button class="btn btn-sm btn-success" onclick="BookingModule.checkOutBooking('${b.id}')">✅ Retour</button>`;
      }

      return `
        <tr>
          <td><strong style="color: var(--gold-400);">${b.contractNumber}</strong></td>
          <td><strong>${b.customerName}</strong><br><small style="color: var(--text-dim);">${b.customerPhone}</small></td>
          <td>${car.brand || ''} ${car.model || ''}<br><small style="font-family: monospace; color: var(--text-dim);">${car.matricule || ''}</small></td>
          <td>${startFmt} → ${endFmt}<br><small style="color: var(--gold-400);">${b.days} jour(s)</small></td>
          <td>
            <strong>${b.totalAmount} DH</strong><br>
            <small style="color: var(--status-available);">Payé: ${b.paidAmount} DH</small>
          </td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 700; color: #FFF;">${b.depositAmount} DH</span><br>
            <small style="color: var(--gold-400); font-size: 0.72rem;">${(b.depositStatus || '').replace('_', ' ')}</small>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">${actionButtons}</td>
        </tr>
      `;
    }).join("");
  },

  /* ==========================================================================
     5. CRM CLIENTS (CUSTOMERS)
     ========================================================================== */
  renderCustomersView() {
    const db = StorageManager.load();
    const tbody = document.getElementById("tbody-all-customers");
    if (!tbody) return;

    tbody.innerHTML = db.customers.map(c => {
      const waNumber = c.phone.replace(/[^0-9]/g, '');
      return `
        <tr>
          <td><strong>${c.firstName} ${c.lastName}</strong></td>
          <td>${c.cin || c.passport || '-'}<br><small style="color: var(--text-dim);">${c.nationality || 'Marocaine'}</small></td>
          <td>${c.permisNumber || '-'}<br><small style="color: var(--text-dim);">${c.permisCity || ''}</small></td>
          <td>
            <a href="tel:${c.phone}" style="color: #FFF; text-decoration: none; font-weight: 600;">${c.phone}</a><br>
            <a href="https://wa.me/${waNumber}" target="_blank" style="color: #10B981; font-size: 0.75rem; text-decoration: none;">💬 WhatsApp Direct</a>
          </td>
          <td>${c.address || 'Marrakech'}</td>
          <td><span class="badge-disponible" style="padding: 2px 8px; border-radius: 10px; font-size: 0.75rem;">${c.totalRentals || 1} Location(s)</span></td>
          <td style="text-align: right;">
            <button class="btn btn-sm btn-primary" onclick="BookingModule.openNewBookingModal(null, null, null)">Nouvelle Location</button>
          </td>
        </tr>
      `;
    }).join("");
  },

  /* ==========================================================================
     6. CAISSE & FACTURATION (FINANCE)
     ========================================================================== */
  renderFinanceView() {
    const db = StorageManager.load();
    const tbody = document.getElementById("tbody-all-payments");
    if (!tbody) return;

    const totalCaisse = db.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalDeposits = db.bookings
      .filter(b => b.status === "en_cours")
      .reduce((acc, b) => acc + (b.depositAmount || 0), 0);

    const elCaisse = document.getElementById("finance-total-caisse");
    const elDeposits = document.getElementById("finance-total-deposits");
    if (elCaisse) elCaisse.textContent = `${totalCaisse.toLocaleString("fr-FR")} DH`;
    if (elDeposits) elDeposits.textContent = `${totalDeposits.toLocaleString("fr-FR")} DH`;

    tbody.innerHTML = db.payments.map(p => `
      <tr>
        <td><strong>${p.id}</strong></td>
        <td>${p.date}</td>
        <td><strong style="color: var(--gold-400);">${p.contract}</strong></td>
        <td>${p.client}</td>
        <td>${p.type}</td>
        <td><span style="font-size: 0.8rem; font-weight: 700; color: #FFF; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px;">${p.method}</span></td>
        <td><strong style="color: var(--status-available); font-size: 1rem;">+${p.amount} DH</strong></td>
      </tr>
    `).join("");
  },

  /* ==========================================================================
     7. PARAMÈTRES & SAUVEGARDE (SETTINGS)
     ========================================================================== */
  renderSettingsView() {
    const db = StorageManager.load();
    const ag = db.agency;

    document.getElementById("set-agency-name").value = ag.name || "";
    document.getElementById("set-agency-owner").value = ag.owner || "Mohamed Rouga";
    document.getElementById("set-agency-phone1").value = ag.phone1 || "";
    document.getElementById("set-agency-phone2").value = ag.phone2 || "";
    document.getElementById("set-agency-email").value = ag.email || "";
    document.getElementById("set-agency-address").value = ag.address || "";
    document.getElementById("set-agency-rc").value = ag.rc || "";
    document.getElementById("set-agency-ice").value = ag.ice || "";
  },

  saveSettings() {
    const db = StorageManager.load();
    db.agency.name = document.getElementById("set-agency-name").value;
    db.agency.owner = document.getElementById("set-agency-owner").value;
    db.agency.phone1 = document.getElementById("set-agency-phone1").value;
    db.agency.phone2 = document.getElementById("set-agency-phone2").value;
    db.agency.email = document.getElementById("set-agency-email").value;
    db.agency.address = document.getElementById("set-agency-address").value;
    db.agency.rc = document.getElementById("set-agency-rc").value;
    db.agency.ice = document.getElementById("set-agency-ice").value;

    StorageManager.save(db);
    this.showToast("Paramètres de l'agence sauvegardés !", "success");
    this.refreshAll();
  },

  /* ==========================================================================
     UTILITAIRES & ÉVÉNEMENTS GLOBAUX
     ========================================================================== */
  bindGlobalEvents() {
    // Bouton de vérification rapide de disponibilité
    const checkBtn = document.getElementById("btn-run-checker");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => this.runAvailabilitySearch());
    }

    // Bouton ajout véhicule
    const addCarBtn = document.getElementById("btn-open-add-car");
    if (addCarBtn) {
      addCarBtn.addEventListener("click", () => this.openAddCarModal());
    }

    // Formulaire ajout véhicule
    const formAddCar = document.getElementById("form-add-car");
    if (formAddCar) {
      formAddCar.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveNewCar();
      });
    }

    // Fermeture de tous les modals par le bouton fermer
    document.querySelectorAll(".modal-close").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const backdrop = btn.closest(".modal-backdrop");
        if (backdrop) backdrop.classList.remove("active");
      });
    });

    // Fermeture par clic sur le backdrop
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("active");
        }
      });
    });

    // Sauvegarde paramètres
    const saveSetBtn = document.getElementById("btn-save-settings");
    if (saveSetBtn) {
      saveSetBtn.addEventListener("click", () => this.saveSettings());
    }

    // Exportation & Importation JSON
    const exportBtn = document.getElementById("btn-export-db");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => StorageManager.exportJSON());
    }

    const importInput = document.getElementById("input-import-db");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            if (StorageManager.importJSON(re.target.result)) {
              this.showToast("Base de données restaurée avec succès !", "success");
              this.refreshAll();
            } else {
              alert("Fichier JSON de sauvegarde invalide.");
            }
          };
          reader.readAsText(file);
        }
      });
    }

    const resetBtn = document.getElementById("btn-reset-db");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Réinitialiser toutes les données aux valeurs d'origine Errouga Car ?")) {
          StorageManager.reset();
          this.showToast("Données réinitialisées !", "info");
          this.refreshAll();
        }
      });
    }
  },

  runAvailabilitySearch() {
    const startVal = document.getElementById("quick-check-start").value;
    const endVal = document.getElementById("quick-check-end").value;
    const catVal = document.getElementById("quick-check-category").value;

    if (!startVal || !endVal) {
      alert("Veuillez sélectionner une date de début et de fin.");
      return;
    }

    const db = StorageManager.load();
    const start = new Date(startVal).getTime();
    const end = new Date(endVal).getTime();

    // Filtre des véhicules non réservés
    const available = db.fleet.filter(car => {
      if (catVal && !car.category.toLowerCase().includes(catVal.toLowerCase())) {
        return false;
      }
      const hasConflict = db.bookings.some(b => {
        if (b.carId !== car.id || b.status === "annulee") return false;
        const bStart = new Date(b.pickupDate).getTime();
        const bEnd = new Date(b.dropoffDate).getTime();
        return (start <= bEnd && end >= bStart);
      });
      return !hasConflict && car.status !== "maintenance";
    });

    const resultBox = document.getElementById("quick-check-results");
    if (resultBox) {
      resultBox.style.display = "block";
      if (available.length === 0) {
        resultBox.innerHTML = `
          <div style="padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); color: #EF4444; font-weight: 700;">
            ⚠️ Aucun véhicule disponible pour ces dates précises. Veuillez essayer d'autres dates ou contacter M. Mohamed Rouga au ${db.agency.phone1}.
          </div>
        `;
      } else {
        resultBox.innerHTML = `
          <div style="margin-top: 14px; padding: 16px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-sm);">
            <div style="font-weight: 800; color: #10B981; margin-bottom: 10px;">
              ✓ ${available.length} véhicule(s) parfaitement disponible(s) du ${new Date(startVal).toLocaleDateString()} au ${new Date(endVal).toLocaleDateString()} :
            </div>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              ${available.map(c => `
                <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px;">
                  <img src="${c.images[0]}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;" onerror="this.src='assets/images/clio_5_1.jpg'">
                  <div>
                    <strong style="color: #FFF;">${c.brand} ${c.model}</strong><br>
                    <span style="color: var(--gold-400); font-weight: 700; font-size: 0.85rem;">${c.priceDay} DH/j</span>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="BookingModule.openNewBookingModal('${c.id}', '${startVal}', '${endVal}')">Réserver</button>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }
    }
  },

  saveNewCar() {
    const db = StorageManager.load();
    const brand = document.getElementById("add-car-brand").value.trim();
    const model = document.getElementById("add-car-model").value.trim();
    const matricule = document.getElementById("add-car-matricule").value.trim();
    const category = document.getElementById("add-car-category").value;
    const fuel = document.getElementById("add-car-fuel").value;
    const gearbox = document.getElementById("add-car-gearbox").value;
    const priceDay = parseFloat(document.getElementById("add-car-price").value || 400);
    const deposit = parseFloat(document.getElementById("add-car-deposit").value || 5000);
    const mileage = parseInt(document.getElementById("add-car-mileage").value || 25000, 10);
    const imgUrl = document.getElementById("add-car-img").value.trim() || "assets/images/clio_5_1.jpg";

    const newCar = {
      id: `car-${Date.now()}`,
      brand,
      model,
      matricule,
      category,
      year: new Date().getFullYear(),
      fuel,
      gearbox,
      seats: 5,
      doors: 5,
      trunk: "350L",
      color: "Gris",
      mileage,
      priceDay,
      priceWeekend: priceDay,
      deposit,
      status: "disponible",
      fuelLevel: 100,
      images: [imgUrl],
      features: ["Climatisation", "Bluetooth", "Régulateur"],
      maintenance: {
        lastOilChangeDate: new Date().toISOString().slice(0, 10),
        lastOilChangeKm: mileage,
        nextOilChangeKm: mileage + 10000,
        assuranceExpiry: "2027-12-31",
        controleTechniqueExpiry: "2028-01-01",
        vignetteExpiry: "2027-01-31"
      }
    };

    db.fleet.push(newCar);
    StorageManager.save(db);
    document.getElementById("modal-add-car").classList.remove("active");
    this.showToast(`Véhicule ${brand} ${model} ajouté à la flotte !`, "success");
    this.refreshAll();
  },

  getStatusBadge(status) {
    const map = {
      confirmee: `<span style="background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">CONFIRMÉE</span>`,
      en_cours: `<span style="background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">EN LOCATION</span>`,
      terminee: `<span style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">RESTITUÉE</span>`,
      annulee: `<span style="background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">ANNULÉE</span>`
    };
    return map[status] || `<span style="color: var(--text-dim);">${status}</span>`;
  },

  showToast(message, type = "info") {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      document.body.appendChild(toast);
    }

    const colors = {
      success: { bg: "#065F46", border: "#10B981" },
      warning: { bg: "#78350F", border: "#F59E0B" },
      danger: { bg: "#7F1D1D", border: "#EF4444" },
      info: { bg: "#1E293B", border: "#2563EB" }
    };
    const c = colors[type] || colors.info;

    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 14px 22px;
      border-radius: 8px;
      background: ${c.bg};
      border: 1px solid ${c.border};
      color: #FFF;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      z-index: 99999;
      display: block;
      transition: all 0.3s ease;
    `;
    toast.textContent = message;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }
};
