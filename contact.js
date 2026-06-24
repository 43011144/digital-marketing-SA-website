// ========== CONTACT PAGE SCRIPT ==========

// ========== SESSION HELPER ==========
function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

// ========== TAB SWITCHING ==========
function switchTab(tab) {
  var viewTab = document.getElementById("viewTab");
  var addTab  = document.getElementById("addTab");
  var viewBtn = document.getElementById("viewTabBtn");
  var addBtn  = document.getElementById("addTabBtn");

  if (tab === "view") {
    viewTab.style.display = "block";
    addTab.style.display  = "none";
    viewBtn.classList.add("active");
    addBtn.classList.remove("active");
    // Reload contacts whenever view tab is opened
    loadContacts();
  } else {
    viewTab.style.display = "none";
    addTab.style.display  = "block";
    addBtn.classList.add("active");
    viewBtn.classList.remove("active");
  }
}

// ========== FORM VALIDATION ==========
function validateContactForm() {
  var name     = document.getElementById("sellerName").value.trim();
  var phone    = document.getElementById("sellerPhone").value.trim();
  var location = document.getElementById("sellerLocation").value.trim();

  if (!name || !phone || !location) {
    showContactMessage("Please fill in all required fields.", "error");
    return false;
  }
  return true;
}

// ========== SHOW FEEDBACK MESSAGE ==========
function showContactMessage(text, type) {
  var msg = document.getElementById("contactMessage");
  msg.textContent   = text;
  msg.className     = "contact-message " + type;
  msg.style.display = "block";
  msg.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ========== CLEAR FORM ==========
function clearContactForm() {
  document.getElementById("sellerName").value     = "";
  document.getElementById("sellerPhone").value    = "";
  document.getElementById("sellerEmail").value    = "";
  document.getElementById("sellerLocation").value = "";
  document.getElementById("sellerNote").value     = "";
}

// ========== LOCALSTORAGE HELPERS (fallback when PHP is not available) ==========
function saveContactLocally(contact) {
  var all = [];
  try { all = JSON.parse(localStorage.getItem("dmsa_contacts") || "[]"); } catch (e) {}
  contact.id = Date.now();
  all.push(contact);
  localStorage.setItem("dmsa_contacts", JSON.stringify(all));
}

function getContactsLocally() {
  try { return JSON.parse(localStorage.getItem("dmsa_contacts") || "[]"); } catch (e) { return []; }
}

function deleteContactLocally(contactId) {
  var all = getContactsLocally();
  all = all.filter(function (c) { return c.id !== contactId; });
  localStorage.setItem("dmsa_contacts", JSON.stringify(all));
}

// ========== SUBMIT CONTACT ==========
// Posts to save_contact.php via AJAX. Falls back to localStorage if PHP unavailable.
function submitContact() {
  if (!validateContactForm()) return;

  var btn = document.querySelector(".contact-submit-btn");
  btn.disabled    = true;
  btn.textContent = "Submitting...";

  var contact = {
    seller_name:     document.getElementById("sellerName").value.trim(),
    seller_phone:    document.getElementById("sellerPhone").value.trim(),
    seller_email:    document.getElementById("sellerEmail").value.trim(),
    seller_location: document.getElementById("sellerLocation").value.trim(),
    seller_note:     document.getElementById("sellerNote").value.trim()
  };

  fetch("save_contact.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(contact)
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.success) {
        showContactMessage("Your contact has been added! Buyers can now see your details.", "success");
        clearContactForm();
        // Switch to view tab so user can see their contact immediately
        setTimeout(function () { switchTab("view"); }, 1200);
      } else {
        showContactMessage(data.message || "Something went wrong. Please try again.", "error");
      }
    })
    .catch(function () {
      // PHP not available — save to localStorage so page still works on Live Server
      saveContactLocally(contact);
      showContactMessage("Your contact has been added! Buyers can now see your details.", "success");
      clearContactForm();
      setTimeout(function () { switchTab("view"); }, 1200);
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Add My Contact';
    });
}

// ========== DELETE CONTACT (Seller only — own contacts only) ==========
function deleteContact(contactId, sellerName, cardEl) {
  if (!confirm("Are you sure you want to remove this contact listing?")) return;

  // Try delete_contact.php first (AMPPS) — falls back to localStorage
  fetch("delete_contact.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ contact_id: contactId, seller_name: sellerName })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        // Remove the card from the DOM immediately
        if (cardEl) cardEl.remove();
        // Show empty message if no more contacts
        var grid = document.getElementById("contactsGrid");
        if (grid && grid.children.length === 0) {
          document.getElementById("noContacts").style.display = "block";
        }
      } else {
        alert(data.message || "Could not delete contact.");
      }
    })
    .catch(function () {
      // PHP not available — delete from localStorage
      deleteContactLocally(contactId);
      if (cardEl) cardEl.remove();
      var grid = document.getElementById("contactsGrid");
      if (grid && grid.children.length === 0) {
        document.getElementById("noContacts").style.display = "block";
      }
    });
}

// ========== LOAD CONTACTS ==========
// Fetches from get_contacts.php. Falls back to localStorage.
function loadContacts() {
  fetch("get_contacts.php")
    .then(function (response) { return response.json(); })
    .then(function (data) { renderContacts(data.contacts || []); })
    .catch(function () { renderContacts(getContactsLocally()); });
}

// ========== RENDER CONTACTS ==========
function renderContacts(contacts) {
  var grid  = document.getElementById("contactsGrid");
  var noMsg = document.getElementById("noContacts");

  grid.innerHTML = "";

  if (!contacts || contacts.length === 0) {
    noMsg.style.display = "block";
    return;
  }

  noMsg.style.display = "none";

  var user = getSession();

  for (var i = 0; i < contacts.length; i++) {
    grid.appendChild(buildContactCard(contacts[i], user));
  }
}

// ========== BUILD CONTACT CARD ==========
function buildContactCard(contact, user) {
  var card = document.createElement("div");
  card.className = "contact-card";

  // Email row — only shown if email was provided
  var emailRow = contact.seller_email
    ? '<div class="contact-detail"><i class="fas fa-envelope"></i><span>' + esc(contact.seller_email) + '</span></div>'
    : "";

  // Note row — only shown if note was provided
  var noteRow = contact.seller_note
    ? '<div class="contact-detail"><i class="fas fa-sticky-note"></i><span>' + esc(contact.seller_note) + '</span></div>'
    : "";

  // Delete button — only shown to the seller who owns this contact
  var deleteBtn = "";
  // Show delete button if user is the owner and is in seller mode
  if (user && (user.role === "seller" || user.activeMode === "seller") && user.name === contact.seller_name) {
    deleteBtn =
      '<button class="contact-delete-btn" onclick="deleteContact(' + contact.id + ', \'' + esc(contact.seller_name) + '\', this.closest(\'.contact-card\'))">' +
        '<i class="fas fa-trash-alt"></i> Delete My Contact' +
      '</button>';
  }

  card.innerHTML =
    '<span class="seller-badge">Seller Contact</span>' +
    '<h3>' + esc(contact.seller_name) + '</h3>' +
    '<div class="contact-detail"><i class="fas fa-phone"></i><span>' + esc(contact.seller_phone) + '</span></div>' +
    emailRow +
    '<div class="contact-detail"><i class="fas fa-map-marker-alt"></i><span>' + esc(contact.seller_location) + '</span></div>' +
    noteRow +
    deleteBtn;

  return card;
}

// ========== HTML ESCAPE HELPER ==========
function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function () {
  // Load contacts into view tab on page load
  loadContacts();
});
