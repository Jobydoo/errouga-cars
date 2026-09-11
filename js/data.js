/**
 * ERROUGA CAR MANAGER - Données initiales & Modèles
 * Agence : Errouga Car Agency - Marrakech
 * Propriétaire : M. Mohamed Rouga
 */

const ERROUGA_DEFAULT_DATA = {
  agency: {
    name: "Errouga Car Agency",
    owner: "Mohamed Rouga",
    title: "Directeur Général & Fondateur",
    phone1: "+212 660-990242",
    phone2: "+212 714-876077",
    whatsapp: "+212660990242",
    email: "contact@errouga.com",
    website: "https://errouga.com",
    city: "Marrakech",
    country: "Maroc",
    address: "Boulevard Mohammed VI, Guéliz, 40000 Marrakech",
    secondaryAddress: "Casablanca Finance City & Aéroports du Maroc",
    rc: "54291 / Marrakech",
    patente: "45281902",
    if: "28492014",
    ice: "002849201400088",
    currency: "MAD",
    currencySymbol: "DH",
    hours: "Lundi - Samedi : 08:00 - 18:30 (Assistance Aéroports 24/7)"
  },

  locations: [
    { id: "marrakech-gueliz", name: "Marrakech - Agence Centre-Ville (Guéliz)" },
    { id: "marrakech-aeroport", name: "Aéroport Marrakech Ménara (RAK)" },
    { id: "marrakech-hotel", name: "Marrakech - Livraison Hôtel / Riad / Villa" },
    { id: "casablanca-centre", name: "Casablanca - Centre-Ville" },
    { id: "casablanca-aeroport", name: "Aéroport Mohammed V Casablanca (CMN)" },
    { id: "autre-maroc", name: "Autre ville du Maroc (Sur devis)" }
  ],

  optionsList: [
    { id: "opt-siege-bebe", name: "Siège Bébé / Enfant ISOFIX", pricePerDay: 40, flat: false },
    { id: "opt-conducteur-sup", name: "Deuxième Conducteur Agréé", pricePerDay: 150, flat: true },
    { id: "opt-gps", name: "Boîtier GPS / Wi-Fi 4G Illimité", pricePerDay: 30, flat: false },
    { id: "opt-assurance-zero", name: "Assurance Tous Risques (Franchise 0)", pricePerDay: 100, flat: false },
    { id: "opt-lavage-retour", name: "Option Retour Sans Lavage", pricePerDay: 80, flat: true }
  ],

  fleet: [
    {
      id: "car-clio-5",
      brand: "Renault",
      model: "Clio 5 Noire",
      matricule: "84920-A-26",
      category: "Économique / Citadine",
      year: 2022,
      fuel: "Diesel",
      gearbox: "Manuelle (6 vitesses)",
      seats: 5,
      doors: 5,
      trunk: "391 Litres",
      color: "Noir Intense",
      mileage: 48500,
      priceDay: 350,
      priceWeekend: 400,
      deposit: 5000,
      status: "loue", // "disponible", "loue", "maintenance", "reserve"
      fuelLevel: 80, // %
      images: [
        "assets/images/clio_5_1.jpg",
        "assets/images/clio_5_2.jpg"
      ],
      features: [
        "Climatisation Automatique",
        "Écran tactile EASY LINK avec Bluetooth",
        "Régulateur et limiteur de vitesse",
        "Radars et caméra de recul",
        "Feux Full LED Pure Vision",
        "Consommation ultra économique (4.1L/100km)"
      ],
      maintenance: {
        lastOilChangeDate: "2026-07-15",
        lastOilChangeKm: 45000,
        nextOilChangeKm: 55000,
        assuranceExpiry: "2026-12-31",
        controleTechniqueExpiry: "2027-05-15",
        vignetteExpiry: "2027-01-31"
      }
    },
    {
      id: "car-hyundai-accent",
      brand: "Hyundai",
      model: "Accent CRDi",
      matricule: "51234-B-26",
      category: "Berline Confort",
      year: 2023,
      fuel: "Diesel",
      gearbox: "Manuelle (6 vitesses)",
      seats: 5,
      doors: 4,
      trunk: "480 Litres",
      color: "Gris Métallisé",
      mileage: 36200,
      priceDay: 400,
      priceWeekend: 400,
      deposit: 6000,
      status: "disponible",
      fuelLevel: 100,
      images: [
        "assets/images/hyundai_accent_1.jpg",
        "assets/images/hyundai_accent_2.jpg"
      ],
      features: [
        "Grand coffre idéal pour bagages aéroport",
        "Système multimédia Apple CarPlay / Android Auto",
        "Climatisation automatique avec diffuseurs arrière",
        "Moteur diesel puissant et très économique",
        "Jantes alliage 16 pouces",
        "Accoudoir central avant et arrière"
      ],
      maintenance: {
        lastOilChangeDate: "2026-08-01",
        lastOilChangeKm: 30000,
        nextOilChangeKm: 45000,
        assuranceExpiry: "2027-02-28",
        controleTechniqueExpiry: "2027-06-20",
        vignetteExpiry: "2027-01-31"
      }
    },
    {
      id: "car-peugeot-208",
      brand: "Peugeot",
      model: "208 Blanche PureTech",
      matricule: "37491-A-26",
      category: "Citadine Dynamique",
      year: 2022,
      fuel: "Diesel",
      gearbox: "Manuelle",
      seats: 5,
      doors: 5,
      trunk: "311 Litres",
      color: "Blanc Banquise",
      mileage: 41800,
      priceDay: 400,
      priceWeekend: 450,
      deposit: 5000,
      status: "disponible",
      fuelLevel: 90,
      images: [
        "assets/images/peugeot_blanche_1.jpg",
        "assets/images/peugeot_blanche_2.jpg"
      ],
      features: [
        "Cockpit 3D numérique Peugeot",
        "Écran tactile 7 pouces avec Mirror Screen",
        "Projecteurs LED avec signature griffes de lion",
        "Aide au stationnement arrière",
        "Volant compact cuir multifonctions",
        "Système de freinage d'urgence autonome"
      ],
      maintenance: {
        lastOilChangeDate: "2026-06-10",
        lastOilChangeKm: 40000,
        nextOilChangeKm: 50000,
        assuranceExpiry: "2026-11-30",
        controleTechniqueExpiry: "2027-04-01",
        vignetteExpiry: "2027-01-31"
      }
    },
    {
      id: "car-dacia-duster",
      brand: "Dacia",
      model: "Duster 4x4 Prestige",
      matricule: "19823-A-26",
      category: "SUV Tout-Chemin",
      year: 2023,
      fuel: "Diesel dCi",
      gearbox: "Manuelle 6 vitesses",
      seats: 5,
      doors: 5,
      trunk: "445 Litres",
      color: "Orange Arizona",
      mileage: 28400,
      priceDay: 550,
      priceWeekend: 600,
      deposit: 7000,
      status: "reserve",
      fuelLevel: 100,
      images: [
        "assets/images/hyundai_accent_2.jpg"
      ],
      features: [
        "Transmission intégrale 4x4 adaptée pistes et désert",
        "Garde au sol surélevée 21 cm",
        "Caméras multivues 360°",
        "Système Media Nav avec navigation Maroc",
        "Barres de toit longitudinales",
        "Climatisation automatique"
      ],
      maintenance: {
        lastOilChangeDate: "2026-07-20",
        lastOilChangeKm: 25000,
        nextOilChangeKm: 40000,
        assuranceExpiry: "2027-03-15",
        controleTechniqueExpiry: "2027-07-10",
        vignetteExpiry: "2027-01-31"
      }
    }
  ],

  customers: [
    {
      id: "cust-1",
      firstName: "Karim",
      lastName: "Benjelloun",
      cin: "EE654321",
      passport: "",
      nationality: "Marocaine",
      phone: "+212 661-123456",
      email: "karim.benjelloun@gmail.com",
      address: "Résidence Al Mansour, Hivernage, Marrakech",
      permisNumber: "B/145892",
      permisDate: "2018-04-12",
      permisCity: "Marrakech",
      totalRentals: 4,
      status: "vip",
      notes: "Client fidèle et ponctuel. Véhicule toujours rendu propre."
    },
    {
      id: "cust-2",
      firstName: "Thomas",
      lastName: "Laurent",
      cin: "",
      passport: "19AB87654",
      nationality: "Française",
      phone: "+33 6 12 34 56 78",
      email: "thomas.laurent@paris-tech.fr",
      address: "14 Rue de la Paix, 75002 Paris, France",
      permisNumber: "FR-2015-89410",
      permisDate: "2015-09-20",
      permisCity: "Paris",
      totalRentals: 2,
      status: "regulier",
      notes: "Touriste récurrent, demande souvent livraison à l'aéroport Ménara."
    },
    {
      id: "cust-3",
      firstName: "Sarah",
      lastName: "Alami",
      cin: "BE987654",
      passport: "",
      nationality: "Marocaine",
      phone: "+212 662-887766",
      email: "s.alami@business.ma",
      address: "Boulevard d'Anfa, Casablanca",
      permisNumber: "B/223401",
      permisDate: "2020-02-14",
      permisCity: "Casablanca",
      totalRentals: 1,
      status: "regulier",
      notes: "Location pour déplacements professionnels Casablanca - Marrakech."
    }
  ],

  bookings: [
    {
      id: "RES-2026-001",
      contractNumber: "EC-2026/089",
      carId: "car-clio-5",
      customerId: "cust-1",
      customerName: "Karim Benjelloun",
      customerPhone: "+212 661-123456",
      pickupDate: "2026-09-08T10:00",
      dropoffDate: "2026-09-14T18:00",
      pickupLocation: "Marrakech - Agence Centre-Ville (Guéliz)",
      dropoffLocation: "Aéroport Marrakech Ménara (RAK)",
      days: 6,
      dailyRate: 350,
      options: ["opt-assurance-zero"],
      optionsTotal: 600,
      totalAmount: 2700,
      paidAmount: 1000,
      depositAmount: 5000,
      depositStatus: "bloquee_tpe", // "non_payee", "bloquee_tpe", "especes_caisse", "restituee"
      paymentMethod: "Carte Bancaire",
      status: "en_cours", // "confirmee", "en_cours", "terminee", "annulee"
      startMileage: 48500,
      endMileage: null,
      fuelDeparture: "4/4",
      fuelReturn: null,
      damageDeparture: [
        { x: 72, y: 35, part: "Pare-chocs avant", desc: "Légère éraflure superficielle côté droit" }
      ],
      damageReturn: [],
      clientSignature: null,
      notes: "Arrivée du vol à l'heure, remise des clés en agence."
    },
    {
      id: "RES-2026-002",
      contractNumber: "EC-2026/090",
      carId: "car-dacia-duster",
      customerId: "cust-2",
      customerName: "Thomas Laurent",
      customerPhone: "+33 6 12 34 56 78",
      pickupDate: "2026-09-15T14:30",
      dropoffDate: "2026-09-22T11:00",
      pickupLocation: "Aéroport Marrakech Ménara (RAK)",
      dropoffLocation: "Aéroport Marrakech Ménara (RAK)",
      days: 7,
      dailyRate: 550,
      options: ["opt-siege-bebe", "opt-gps"],
      optionsTotal: 490,
      totalAmount: 4340,
      paidAmount: 1500,
      depositAmount: 7000,
      depositStatus: "non_payee",
      paymentMethod: "Virement / Acompte",
      status: "confirmee",
      startMileage: 28400,
      endMileage: null,
      fuelDeparture: "4/4",
      fuelReturn: null,
      damageDeparture: [],
      damageReturn: [],
      clientSignature: null,
      notes: "Client avec 2 valises et 1 poussette. Rendez-vous Parking P2 RAK."
    },
    {
      id: "RES-2026-003",
      contractNumber: "EC-2026/085",
      carId: "car-peugeot-208",
      customerId: "cust-3",
      customerName: "Sarah Alami",
      customerPhone: "+212 662-887766",
      pickupDate: "2026-08-25T09:00",
      dropoffDate: "2026-08-29T18:00",
      pickupLocation: "Casablanca - Centre-Ville",
      dropoffLocation: "Marrakech - Agence Centre-Ville (Guéliz)",
      days: 4,
      dailyRate: 400,
      options: [],
      optionsTotal: 0,
      totalAmount: 1600,
      paidAmount: 1600,
      depositAmount: 5000,
      depositStatus: "restituee",
      paymentMethod: "Espèces",
      status: "terminee",
      startMileage: 40100,
      endMileage: 41800,
      fuelDeparture: "4/4",
      fuelReturn: "4/4",
      damageDeparture: [],
      damageReturn: [],
      clientSignature: "SIG_OK",
      notes: "Restitution parfaite. Caution restituée après vérification intégrale."
    }
  ],

  payments: [
    { id: "PAY-01", date: "2026-09-08", contract: "EC-2026/089", client: "Karim Benjelloun", amount: 1000, type: "Acompte Location", method: "Carte Bancaire", status: "Encaissé" },
    { id: "PAY-02", date: "2026-09-05", contract: "EC-2026/090", client: "Thomas Laurent", amount: 1500, type: "Acompte Réservation", method: "Virement", status: "Encaissé" },
    { id: "PAY-03", date: "2026-08-29", contract: "EC-2026/085", client: "Sarah Alami", amount: 1600, type: "Règlement Solde", method: "Espèces", status: "Encaissé" }
  ],

  users: [
    {
      username: "rouga",
      name: "Mohamed Rouga",
      role: "owner",
      roleLabel: "Propriétaire & Gérant",
      pin: "1234",
      password: "admin",
      avatar: "assets/images/logo.svg"
    },
    {
      username: "reception",
      name: "Agent d'accueil",
      role: "staff",
      roleLabel: "Gestionnaire Réservations",
      pin: "0000",
      password: "staff",
      avatar: ""
    }
  ]
};

// Gestionnaire du stockage local
const StorageManager = {
  STORAGE_KEY: "errouga_cars_db_v1",

  load() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Erreur lecture localStorage, utilisation des données d'origine", e);
    }
    this.save(ERROUGA_DEFAULT_DATA);
    return JSON.parse(JSON.stringify(ERROUGA_DEFAULT_DATA));
  },

  save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Erreur sauvegarde localStorage", e);
      return false;
    }
  },

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.load();
  },

  exportJSON() {
    const data = this.load();
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", str);
    a.setAttribute("download", `errouga_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.agency && data.fleet) {
        this.save(data);
        return true;
      }
    } catch (e) {
      console.error("Import invalide", e);
    }
    return false;
  }
};
