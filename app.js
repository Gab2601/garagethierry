// Remplace par ton URL et clé Supabase
const SUPABASE_URL = "https://acdmlvqfmvzkkcbfljxz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZG1sdnFmbXZ6a2tjYmZ4angiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MjA1MTM2NywiZXhwIjoyMDY3NjI3MzY3fQ.i8aemLZQGzzeQyHIxQ-g_x_B1UoczwDGahj6rdU0SL4";

// Création du client Supabase avec un autre nom pour éviter conflit
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Booking form
const bookingForm = document.getElementById("booking-form");
const bookingFeedback = document.getElementById("booking-feedback");

// Quote form
const quoteForm = document.getElementById("quote-form");
const quoteFeedback = document.getElementById("quote-feedback");

// Admin elements
const authSection = document.getElementById("auth-section");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const authFeedback = document.getElementById("auth-feedback");
const appointmentsList = document.getElementById("appointments-list");
const quotesList = document.getElementById("quotes-list");

// Gérer soumission rendez-vous
async function handleBookingSubmit(e) {
  e.preventDefault();
  bookingFeedback.textContent = "";
  const formData = new FormData(bookingForm);
  const data = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    date: formData.get("date"),
    message: formData.get("message"),
  };
  const { error } = await supabaseClient.from("appointments").insert([data]);
  if (error) {
    bookingFeedback.textContent = "Erreur, réessayez.";
    bookingFeedback.className = "mt-2 text-red-600";
  } else {
    bookingFeedback.textContent = "Rendez-vous envoyé avec succès !";
    bookingFeedback.className = "mt-2 text-green-600";
    bookingForm.reset();
  }
}

// Gérer soumission devis
async function handleQuoteSubmit(e) {
  e.preventDefault();
  quoteFeedback.textContent = "";
  const formData = new FormData(quoteForm);
  const data = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    details: formData.get("details"),
  };
  const { error } = await supabaseClient.from("quotes").insert([data]);
  if (error) {
    quoteFeedback.textContent = "Erreur, réessayez.";
    quoteFeedback.className = "mt-2 text-red-600";
  } else {
    quoteFeedback.textContent = "Demande de devis envoyée !";
    quoteFeedback.className = "mt-2 text-green-600";
    quoteForm.reset();
  }
}

// Login admin avec vérification email simple
async function loginAdmin() {
  authFeedback.textContent = "";
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  if (!email || !password) {
    authFeedback.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    authFeedback.textContent = "Email ou mot de passe invalide";
    return;
  }

  // Restreindre l'accès admin à un email précis (à modifier selon besoin)
  if (email !== "gabrielcarlier26@icloud.com") {
    authFeedback.textContent = "Accès admin refusé";
    await supabaseClient.auth.signOut();
    return;
  }

  loadAdminPanel();
}

// Logout admin
async function logoutAdmin() {
  await supabaseClient.auth.signOut();
  adminPanel.classList.add("hidden");
  authSection.style.display = "block";
}

// Afficher le panel admin et charger données
async function loadAdminPanel() {
  authSection.style.display = "none";
  adminPanel.classList.remove("hidden");
  await loadAppointments();
  await loadQuotes();
}

// Charger la liste des rendez-vous
async function loadAppointments() {
  const { data, error } = await supabaseClient
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    appointmentsList.innerHTML = "<li>Erreur de chargement</li>";
    return;
  }
  appointmentsList.innerHTML = data
    .map(
      (a) => `
    <li class="border-b pb-2">
      <strong>${a.nom}</strong> - ${new Date(a.date).toLocaleString()}<br/>
      Email: ${a.email} - Tel: ${a.telephone}<br/>
      Message: ${a.message || "-"}
    </li>`
    )
    .join("");
}

// Charger la liste des devis
async function loadQuotes() {
  const { data, error } = await supabaseClient
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    quotesList.innerHTML = "<li>Erreur de chargement</li>";
    return;
  }
  quotesList.innerHTML = data
    .map(
      (q) => `
    <li class="border-b pb-2">
      <strong>${q.nom}</strong><br/>
      Email: ${q.email}<br/>
      Détails: ${q.details}
    </li>`
    )
    .join("");
}

// Événements formulaire
bookingForm.addEventListener("submit", handleBookingSubmit);
quoteForm.addEventListener("submit", handleQuoteSubmit);

// Événements connexion / déconnexion admin
loginBtn.addEventListener("click", loginAdmin);
logoutBtn.addEventListener("click", logoutAdmin);

// Vérifier état d'authentification au chargement
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    loadAdminPanel();
  } else {
    adminPanel.classList.add("hidden");
    authSection.style.display = "block";
  }
});
