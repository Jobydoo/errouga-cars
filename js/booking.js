/**
 * ERROUGA CAR MANAGER - Moteur de Réservation, Check-in / Check-out & Tarification
 */

const BookingModule = {
  activeCheckBookingId: null,
  activeCheckType: null, // "checkin" or "checkout"

  init() {
    this.bindEvents();
    this.populateSelects();
  },

  populateSelects() {
    const db = StorageManager.load();
    const carSelect = document.getElementById("book-car-select");
    const custSelect = document.getElementById("book-customer-select");
    const pickupLocSelect = document.getElementById("book-pickup-loc");
    const dropoffLocSelect = document.getElementById("book-dropoff-loc");

    if (carSelect) {
      carSelect.innerHTML = `<option value="">-- Sélectionner un véhicule --</option>` +
        db.fleet.map(c => `
          <option value="${c.id}" data-rate="${c.priceDay}" data-deposit="${c.deposit}">
            ${c.brand} ${c.model} (${c.matricule}) - ${c.priceDay} DH/j [${c.status.toUpperCase()}]
          </option>
        `).join("");
    }

    if (custSelect) {
      custSelect.innerHTML = `<option value="new">+ Créer un nouveau client...</option>` +
        db.customers.map(cu => `
          <option value="${cu.id}">
            ${cu.firstName} ${cu.lastName} (${cu.phone} - ${cu.cin || cu.passport})
          </option>
        `).join("");
    }

    if (pickupLocSelect && dropoffLocSelect) {
      const locOptions = db.locations.map(l => `<option value="${l.name}">${l.name}</option>`).join("");
      pickupLocSelect.innerHTML = locOptions;
      dropoffLocSelect.innerHTML = locOptions;
    }

    this.renderOptionsList();
  },

  renderOptionsList() {
    const db = StorageManager.load();
    const container = document.getElementById("book-options-container");
    if (!container) return;

    container.innerHTML = db.optionsList.map(opt => `
      <label class="option-checkbox-card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" name="booking-option" value="${opt.id}" data-price="${opt.pricePerDay}" data-flat="${opt.flat}" onchange="BookingModule.recalculatePrices()">
          <span style="font-size: 0.86rem; font-weight: 600; color: #FFF;">${opt.name}</span>
        </div>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--gold-400);">+${opt.pricePerDay} DH${opt.flat ? ' (forfait)' : '/j'}</span>
      </label>
    `).join("");
  },

  bindEvents() {
    const form = document.getElementById("form-new-booking");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveBooking();
      });
    }

    // Recalcul sur changement de dates, véhicule ou acompte
    const carSelect = document.getElementById("book-car-select");
    const startInput = document.getElementById("book-start-date");
    const endInput = document.getElementById("book-end-date");
    const paidInput = document.getElementById("book-paid-amount");

    [carSelect, startInput, endInput, paidInput].forEach(el => {
      if (el) el.addEventListener("input", () => this.recalculatePrices());
      if (el) el.addEventListener("change", () => this.recalculatePrices());
    });

    // Client toggle nouveau / existant
    const custSelect = document.getElementById("book-customer-select");
    if (custSelect) {
      custSelect.addEventListener("change", (e) => {
        const newClientFields = document.getElementById("new-client-fields");
        if (newClientFields) {
          newClientFields.style.display = e.target.value === "new" ? "block" : "none";
        }
      });
    }

    // Formulaire Check-in / Check-out modal
    const checkinForm = document.getElementById("form-checkin-checkout");
    if (checkinForm) {
      checkinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.confirmCheckAction();
      });
    }
  },

  openNewBookingModal(preselectedCarId = null, preStartDate = null, preEndDate = null) {
    try {
      this.populateSelects();
      const form = document.getElementById("form-new-booking");
      if (form) form.reset();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 3);

      const formatDateTimeLocal = (d) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`;
      };

      const startInput = document.getElementById("book-start-date");
      const endInput = document.getElementById("book-end-date");
      if (startInput) startInput.value = preStartDate || formatDateTimeLocal(today);
      if (endInput) endInput.value = preEndDate || formatDateTimeLocal(tomorrow);

      const carSelect = document.getElementById("book-car-select");
      if (carSelect) {
        if (preselectedCarId) {
          carSelect.value = preselectedCarId;
        } else if (carSelect.options.length > 1) {
          carSelect.selectedIndex = 1;
        }
      }

      this.recalculatePrices();
      const modal = document.getElementById("modal-booking");
      if (modal) {
        modal.classList.add("active");
      }
    } catch (e) {
      console.error("Erreur ouverture modal réservation:", e);
    }
  },

  recalculatePrices() {
    try {
      const carSelect = document.getElementById("book-car-select");
      const startInput = document.getElementById("book-start-date");
      const endInput = document.getElementById("book-end-date");
      const paidInput = document.getElementById("book-paid-amount");

      if (!carSelect || !startInput || !endInput) return;

      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);

      let days = 1;
      if (startDate && endDate && endDate > startDate) {
        const diffTime = Math.abs(endDate - startDate);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      if (days < 1 || isNaN(days)) days = 1;

      const selectedCarOption = carSelect.selectedOptions ? carSelect.selectedOptions[0] : null;
      const dailyRate = selectedCarOption ? parseFloat(selectedCarOption.dataset.rate || 0) : 0;
      const depositAmount = selectedCarOption ? parseFloat(selectedCarOption.dataset.deposit || 5000) : 5000;

      let optionsTotal = 0;
      const optionCheckboxes = document.querySelectorAll('input[name="booking-option"]:checked');
      optionCheckboxes.forEach(cb => {
        const p = parseFloat(cb.dataset.price || 0);
        const isFlat = cb.dataset.flat === "true";
        optionsTotal += isFlat ? p : (p * days);
      });

      const carSubtotal = dailyRate * days;
      const totalAmount = carSubtotal + optionsTotal;

      const paidAmount = parseFloat(paidInput ? paidInput.value || 0 : 0) || 0;
      const remainingBalance = Math.max(0, totalAmount - paidAmount);

      const safeSet = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      safeSet("calc-days-display", `${days} jour(s)`);
      safeSet("calc-rate-display", `${dailyRate} DH/j`);
      safeSet("calc-car-subtotal", `${carSubtotal} DH`);
      safeSet("calc-options-subtotal", `${optionsTotal} DH`);
      safeSet("calc-total-amount", `${totalAmount} DH`);
      safeSet("calc-deposit-amount", `${depositAmount} DH`);
      safeSet("calc-remaining-balance", `${remainingBalance} DH`);
    } catch (err) {
      console.error("Erreur calcul tarifs:", err);
    }
  },

  saveBooking() {
    const db = StorageManager.load();
    const carId = document.getElementById("book-car-select").value;
    const customerSelectVal = document.getElementById("book-customer-select").value;
    const startDate = document.getElementById("book-start-date").value;
    const endDate = document.getElementById("book-end-date").value;
    const pickupLoc = document.getElementById("book-pickup-loc").value;
    const dropoffLoc = document.getElementById("book-dropoff-loc").value;
    const paidAmount = parseFloat(document.getElementById("book-paid-amount").value || 0) || 0;
    const paymentMethod = document.getElementById("book-payment-method").value;
    const notes = document.getElementById("book-notes").value;

    if (!carId) {
      alert("Veuillez sélectionner un véhicule.");
      return;
    }

    // Gestion Client
    let customerId = customerSelectVal;
    let customerName = "";
    let customerPhone = "";

    if (customerSelectVal === "new") {
      const fName = document.getElementById("cust-new-firstname").value.trim();
      const lName = document.getElementById("cust-new-lastname").value.trim();
      const phone = document.getElementById("cust-new-phone").value.trim();
      const cin = document.getElementById("cust-new-cin").value.trim();
      const permis = document.getElementById("cust-new-permis").value.trim();

      if (!fName || !phone) {
        alert("Veuillez renseigner au moins le prénom/nom et le téléphone du client.");
        return;
      }

      customerId = `cust-${Date.now()}`;
      customerName = `${fName} ${lName}`;
      customerPhone = phone;

      db.customers.push({
        id: customerId,
        firstName: fName,
        lastName: lName,
        cin: cin,
        passport: "",
        nationality: "Marocaine",
        phone: phone,
        email: "",
        address: "Marrakech",
        permisNumber: permis,
        permisDate: "2020-01-01",
        permisCity: "Marrakech",
        totalRentals: 1,
        status: "regulier",
        notes: "Nouveau client enregistré lors d'une réservation"
      });
    } else {
      const existingCust = db.customers.find(c => c.id === customerId);
      if (existingCust) {
        customerName = `${existingCust.firstName} ${existingCust.lastName}`;
        customerPhone = existingCust.phone;
        existingCust.totalRentals = (existingCust.totalRentals || 0) + 1;
      }
    }

    // Calculs
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    let days = Math.ceil(Math.abs(endD - startD) / (1000 * 60 * 60 * 24)) || 1;
    const car = db.fleet.find(c => c.id === carId);
    const dailyRate = car ? car.priceDay : 350;
    const depositAmount = car ? car.deposit : 5000;

    let selectedOptions = [];
    let optionsTotal = 0;
    document.querySelectorAll('input[name="booking-option"]:checked').forEach(cb => {
      selectedOptions.push(cb.value);
      const p = parseFloat(cb.dataset.price || 0);
      const isFlat = cb.dataset.flat === "true";
      optionsTotal += isFlat ? p : (p * days);
    });

    const totalAmount = (dailyRate * days) + optionsTotal;
    const contractNum = `EC-${new Date().getFullYear()}/${(db.bookings.length + 90).toString().padStart(3, '0')}`;

    const newBooking = {
      id: `RES-${Date.now()}`,
      contractNumber: contractNum,
      carId: carId,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      pickupDate: startDate,
      dropoffDate: endDate,
      pickupLocation: pickupLoc,
      dropoffLocation: dropoffLoc,
      days: days,
      dailyRate: dailyRate,
      options: selectedOptions,
      optionsTotal: optionsTotal,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      depositAmount: depositAmount,
      depositStatus: paidAmount > 0 ? "bloquee_tpe" : "non_payee",
      paymentMethod: paymentMethod,
      status: "confirmee",
      startMileage: car ? car.mileage : 0,
      endMileage: null,
      fuelDeparture: "4/4",
      fuelReturn: null,
      damageDeparture: [],
      damageReturn: [],
      clientSignature: null,
      notes: notes
    };

    db.bookings.unshift(newBooking);

    if (paidAmount > 0) {
      db.payments.unshift({
        id: `PAY-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        contract: contractNum,
        client: customerName,
        amount: paidAmount,
        type: "Acompte Réservation",
        method: paymentMethod,
        status: "Encaissé"
      });
    }

    StorageManager.save(db);
    document.getElementById("modal-booking").classList.remove("active");
    AppModule.showToast(`Réservation enregistrée avec succès (${contractNum}) !`, "success");
    AppModule.refreshAll();
  },

  // Modal in-app Check-in (Départ)
  checkInBooking(bookingId) {
    const db = StorageManager.load();
    const b = db.bookings.find(item => item.id === bookingId);
    if (!b) return;

    this.activeCheckBookingId = bookingId;
    this.activeCheckType = "checkin";

    const car = db.fleet.find(c => c.id === b.carId) || {};
    document.getElementById("check-modal-title").textContent = `🔑 Départ Véhicule - Contrat ${b.contractNumber}`;
    document.getElementById("check-modal-sub").textContent = `Locataire : ${b.customerName} | Véhicule : ${car.brand || ''} ${car.model || ''}`;
    document.getElementById("check-km-label").textContent = "Relevé Kilométrique au Départ *";
    document.getElementById("check-km-input").value = b.startMileage || car.mileage || 0;
    document.getElementById("check-fuel-select").value = b.fuelDeparture || "4/4";
    document.getElementById("check-deposit-group").style.display = "none";
    document.getElementById("btn-submit-check").textContent = "Confirmer le Départ du Véhicule";

    document.getElementById("modal-checkin-checkout").classList.add("active");
  },

  // Modal in-app Check-out (Retour)
  checkOutBooking(bookingId) {
    const db = StorageManager.load();
    const b = db.bookings.find(item => item.id === bookingId);
    if (!b) return;

    this.activeCheckBookingId = bookingId;
    this.activeCheckType = "checkout";

    const car = db.fleet.find(c => c.id === b.carId) || {};
    document.getElementById("check-modal-title").textContent = `✅ Restitution Véhicule - Contrat ${b.contractNumber}`;
    document.getElementById("check-modal-sub").textContent = `Locataire : ${b.customerName} | Véhicule : ${car.brand || ''} ${car.model || ''}`;
    document.getElementById("check-km-label").textContent = "Relevé Kilométrique au Retour *";
    document.getElementById("check-km-input").value = (b.startMileage || car.mileage || 0) + 380;
    document.getElementById("check-fuel-select").value = "4/4";
    document.getElementById("check-deposit-group").style.display = "block";
    document.getElementById("btn-submit-check").textContent = "Valider le Retour & Clôturer la Location";

    document.getElementById("modal-checkin-checkout").classList.add("active");
  },

  confirmCheckAction() {
    if (!this.activeCheckBookingId) return;
    const db = StorageManager.load();
    const b = db.bookings.find(item => item.id === this.activeCheckBookingId);
    if (!b) return;

    const km = parseInt(document.getElementById("check-km-input").value, 10) || 0;
    const fuel = document.getElementById("check-fuel-select").value;
    const car = db.fleet.find(c => c.id === b.carId);

    if (this.activeCheckType === "checkin") {
      b.startMileage = km;
      b.fuelDeparture = fuel;
      b.status = "en_cours";
      if (car) {
        car.status = "loue";
        car.mileage = km;
      }
      AppModule.showToast(`Départ validé ! ${b.contractNumber} est en cours.`, "success");
    } else {
      b.endMileage = km;
      b.fuelReturn = fuel;
      b.status = "terminee";
      const depositAction = document.getElementById("check-deposit-action").value;
      b.depositStatus = depositAction === "restituee" ? "restituee" : "retenue_degats";
      if (car) {
        car.status = "disponible";
        if (km > car.mileage) car.mileage = km;
      }
      AppModule.showToast(`Retour validé ! Véhicule disponible et contrat clôturé.`, "success");
    }

    StorageManager.save(db);
    document.getElementById("modal-checkin-checkout").classList.remove("active");
    AppModule.refreshAll();
  }
};
