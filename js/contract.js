/**
 * ERROUGA CAR MANAGER - Générateur de Contrat Officiel & Fiche d'État des Lieux
 * Conforme à la législation marocaine de location de voitures
 */

const ContractModule = {
  currentBooking: null,
  signaturePad: null,
  isDrawing: false,
  activeDamages: [],

  init() {
    this.initSignaturePad();
    this.bindEvents();
  },

  bindEvents() {
    // Bouton impression contrat
    const printBtn = document.getElementById("btn-print-contract");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }

    // Effacer signature
    const clearSigBtn = document.getElementById("btn-clear-signature");
    if (clearSigBtn) {
      clearSigBtn.addEventListener("click", () => {
        this.clearSignature();
      });
    }

    // Sauvegarder contrat & signature
    const saveContractBtn = document.getElementById("btn-save-contract");
    if (saveContractBtn) {
      saveContractBtn.addEventListener("click", () => {
        this.saveCurrentContract();
      });
    }
  },

  initSignaturePad() {
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#2563EB";
    };

    window.addEventListener("resize", resizeCanvas);
    setTimeout(resizeCanvas, 100);

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDraw);

    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    window.addEventListener("touchend", stopDraw);
  },

  clearSignature() {
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },

  hasSignature() {
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return pixelBuffer.some(color => color !== 0);
  },

  openContract(bookingId) {
    const db = StorageManager.load();
    const booking = db.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    this.currentBooking = booking;
    const car = db.fleet.find(c => c.id === booking.carId) || {};
    const customer = db.customers.find(c => c.id === booking.customerId) || {};
    const agency = db.agency;

    this.activeDamages = booking.damageDeparture ? [...booking.damageDeparture] : [];

    // Remplissage des données du contrat
    document.getElementById("contract-view-num").textContent = booking.contractNumber || `EC-${booking.id}`;
    document.getElementById("contract-view-date").textContent = new Date(booking.pickupDate).toLocaleDateString("fr-FR");
    
    // Locataire
    document.getElementById("contract-client-name").textContent = `${customer.firstName || ''} ${customer.lastName || booking.customerName || ''}`;
    document.getElementById("contract-client-id").textContent = customer.cin ? `CIN: ${customer.cin}` : (customer.passport ? `Passeport: ${customer.passport}` : 'Non renseigné');
    document.getElementById("contract-client-permis").textContent = customer.permisNumber ? `Permis N° ${customer.permisNumber} (${customer.permisCity || 'Maroc'})` : 'Non renseigné';
    document.getElementById("contract-client-phone").textContent = customer.phone || booking.customerPhone || '';
    document.getElementById("contract-client-address").textContent = customer.address || 'Marrakech';
    document.getElementById("contract-client-nat").textContent = customer.nationality || 'Marocaine';

    // Véhicule
    document.getElementById("contract-car-model").textContent = `${car.brand || ''} ${car.model || ''}`;
    document.getElementById("contract-car-matricule").textContent = car.matricule || 'En attente';
    document.getElementById("contract-car-fuel").textContent = car.fuel || 'Diesel';
    document.getElementById("contract-car-km-start").textContent = `${booking.startMileage || car.mileage || 0} KM`;
    document.getElementById("contract-car-fuel-start").textContent = booking.fuelDeparture || '4/4 (Plein)';

    // Dates & Lieux
    document.getElementById("contract-pickup-date").textContent = new Date(booking.pickupDate).toLocaleString("fr-FR");
    document.getElementById("contract-dropoff-date").textContent = new Date(booking.dropoffDate).toLocaleString("fr-FR");
    document.getElementById("contract-pickup-loc").textContent = booking.pickupLocation || agency.city;
    document.getElementById("contract-dropoff-loc").textContent = booking.dropoffLocation || agency.city;
    document.getElementById("contract-days-count").textContent = `${booking.days} Jour(s)`;

    // Finances
    const currency = agency.currencySymbol || "DH";
    document.getElementById("contract-rate-day").textContent = `${booking.dailyRate} ${currency}/j`;
    document.getElementById("contract-total-amount").textContent = `${booking.totalAmount} ${currency}`;
    document.getElementById("contract-paid-amount").textContent = `${booking.paidAmount} ${currency}`;
    document.getElementById("contract-balance-amount").textContent = `${booking.totalAmount - booking.paidAmount} ${currency}`;
    document.getElementById("contract-deposit-amount").textContent = `${booking.depositAmount} ${currency}`;
    document.getElementById("contract-deposit-status").textContent = booking.depositStatus ? booking.depositStatus.replace('_', ' ').toUpperCase() : 'NON ENCAISSÉE';

    // Notes
    document.getElementById("contract-notes-text").textContent = booking.notes || "Aucune observation particulière.";

    // Rendu des dégâts sur la carrosserie
    this.renderDamages();

    // Effacer le pad pour nouvelle signature si vide
    this.clearSignature();

    // Ouvrir le modal
    document.getElementById("modal-contract").classList.add("active");
  },

  addDamageMarker(e) {
    const svg = document.getElementById("inspection-blueprint-svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Déterminer la zone de manière intelligente
    let zone = "Carrosserie";
    if (x < 30) zone = "Face avant / Pare-chocs";
    else if (x > 70) zone = "Arrière / Coffre";
    else if (y < 45) zone = "Côté gauche / Portières";
    else if (y > 65) zone = "Côté droit / Portières";
    else zone = "Pavillon / Toit";

    const commonTypes = [
      "Rayure superficielle",
      "Légère éraflure",
      "Enfoncement léger",
      "Impact de gravillon",
      "Éclat de peinture"
    ];
    const defaultDesc = `${commonTypes[this.activeDamages.length % commonTypes.length]} (${zone})`;

    this.activeDamages.push({
      id: Date.now(),
      x,
      y,
      desc: defaultDesc
    });
    this.renderDamages();
    AppModule.showToast(`Repère #${this.activeDamages.length} ajouté sur le schéma (${zone})`, "info");
  },

  removeDamage(index) {
    this.activeDamages.splice(index, 1);
    this.renderDamages();
  },

  renderDamages() {
    const container = document.getElementById("damage-markers-layer");
    const listTable = document.getElementById("contract-damages-list");
    if (!container) return;

    container.innerHTML = "";
    if (listTable) listTable.innerHTML = "";

    if (this.activeDamages.length === 0) {
      if (listTable) {
        listTable.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #10B981; font-weight: bold; padding: 6px;">✓ Véhicule remis en parfait état de carrosserie (aucun dommage à signaler)</td></tr>`;
      }
      return;
    }

    this.activeDamages.forEach((d, idx) => {
      // SVG Marker
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", `${d.x}%`);
      circle.setAttribute("cy", `${d.y}%`);
      circle.setAttribute("r", "8");
      circle.setAttribute("fill", "#EF4444");
      circle.setAttribute("stroke", "#FFFFFF");
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("class", "damage-marker-pin");
      
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", `${d.x}%`);
      text.setAttribute("y", `${d.y + 1}%`);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#FFFFFF");
      text.setAttribute("font-size", "9");
      text.setAttribute("font-weight", "bold");
      text.textContent = (idx + 1).toString();

      circle.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.removeDamage(idx);
      });

      container.appendChild(circle);
      container.appendChild(text);

      // Table row in contract
      if (listTable) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight: bold; color: #EF4444; width: 30px;">#${idx + 1}</td>
          <td>${d.desc}</td>
          <td style="width: 70px; text-align: right;"><button class="btn btn-sm btn-danger btn-no-print" onclick="ContractModule.removeDamage(${idx})">×</button></td>
        `;
        listTable.appendChild(tr);
      }
    });
  },

  saveCurrentContract() {
    if (!this.currentBooking) return;
    const db = StorageManager.load();
    const bIndex = db.bookings.findIndex(b => b.id === this.currentBooking.id);
    if (bIndex === -1) return;

    db.bookings[bIndex].damageDeparture = this.activeDamages;
    
    // Sauvegarder la signature si présente
    if (this.hasSignature()) {
      const canvas = document.getElementById("signature-canvas");
      db.bookings[bIndex].clientSignature = canvas.toDataURL("image/png");
    }

    StorageManager.save(db);
    AppModule.showToast("Contrat et fiche d'état des lieux enregistrés avec succès !", "success");
    document.getElementById("modal-contract").classList.remove("active");
    AppModule.refreshAll();
  }
};
