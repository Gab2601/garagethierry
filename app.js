// Remplace par ton URL et clé Supabase (créé un projet gratuit sur supabase.com)
const SUPABASE_URL = "https://acdmlvqfmvzkkcbfljxz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZG1sdnFmbXZ6a2tjYmZsanh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTEzNjcsImV4cCI6MjA2NzYyNzM2N30.i8aemLZQGzzeQyHIxQ-g_x_B1UoczwDGahj6rdU0SL4";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const { error } = await supabase.from("appointments").insert([data]);
  if (error) {
    bookingFeedback.textContent = "Erreur, réessayez.";
    bookingFeedback.className = "mt-2 text-red-600";
  } else {
    bookingFeedback.textContent = "Rendez-vous envoyé avec succès !";
    bookingFeedback.className = "mt-2 text-green-600";
    bookingForm.reset();
  }
}

async function handleQuoteSubmit(e) {
  e.preventDefault();
  quoteFeedback.textContent = "";
  const formData = new FormData(quoteForm);
  const data = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    details: formData.get("details"),
  };
  const { error } = await supabase.from("quotes").insert([data]);
  if (error) {
    quoteFeedback.textContent = "Erreur, réessayez.";
    quoteFeedback.className = "mt-2 text-red-600";
  } else {
    quoteFeedback.textContent = "Demande de devis envoyée !";
    quoteFeedback.className = "mt-2 text-green-600";
    quoteForm.reset();
  }
}

async function loginAdmin() {
  authFeedback.textContent = "";
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authFeedback.textContent = "Email ou mot de passe invalide";
    return;
  }
  loadAdminPanel();
}

async function logoutAdmin() {
  await supabase.auth.signOut();
  adminPanel.classList.add("hidden");
  authSection.style.display = "block";
}

async function loadAdminPanel() {
  authSection.style.display = "none";
  adminPanel.classList.remove("hidden");
  await loadAppointments();
  await loadQuotes();
}

async function loadAppointments() {
  const { data, error } = await supabase.from("appointments").select("*").order("created_at", { ascending: false });
  if (error) return;
  appointmentsList.innerHTML = data.map(a => `
    <li class="border-b pb-2">
      <strong>${a.nom}</strong> - ${new Date(a.date).toLocaleString()}<br/>
      Email: ${a.email} - Tel: ${a.telephone}<br/>
      Message: ${a.message || "-"}
    </li>
  `).join("");
}

async function loadQuotes() {
  const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  if (error) return;
  quotesList.innerHTML = data.map(q => `
    <li class="border-b pb-2">
      <strong>${q.nom}</strong><br/>
      Email: ${q.email}<br/>
      Détails: ${q.details}
    </li>
  `).join("");
}

bookingForm.addEventListener("submit", handleBookingSubmit);
quoteForm.addEventListener("submit", handleQuoteSubmit);
loginBtn.addEventListener("click", loginAdmin);
logoutBtn.addEventListener("click", logoutAdmin);

// Check auth state on load
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    loadAdminPanel();
  } else {
    adminPanel.classList.add("hidden");
    authSection.style.display = "block";
  }
});
