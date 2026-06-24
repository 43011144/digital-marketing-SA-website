// ========== EMAILJS CLIENT-SIDE EMAIL SENDER ==========
// Sends real emails to the user's registered Gmail account
// No mail server or SMTP needed — works on Live Server and localhost
//
// ========== HOW TO GET YOUR KEYS (5 minutes) ==========
// 1. Go to https://www.emailjs.com — sign up free with kgift699@gmail.com
// 2. "Email Services" → "Add New Service" → "Gmail" → connect kgift699@gmail.com
//    Copy the Service ID (e.g. service_abc1234)
// 3. "Email Templates" → "Create New Template"
//    Set "To Email" field to: {{to_email}}
//    Set Subject to: {{subject}}
//    Paste the template body from SETUP_GUIDE.md
//    Copy the Template ID (e.g. template_xyz7890)
// 4. "Account" → copy your Public Key (e.g. AbCdEfGhIjKlMnOp)
// 5. Enter all three keys in the Setup panel on cart.html or support.html

// ========== LOAD KEYS FROM LOCALSTORAGE ==========
// Keys are saved by the in-app setup wizard so the user only enters them once
function getEmailJSKeys() {
  try {
    return JSON.parse(localStorage.getItem("dmsa_emailjs_keys") || "null");
  } catch (e) { return null; }
}

function saveEmailJSKeys(publicKey, serviceId, templateId) {
  localStorage.setItem("dmsa_emailjs_keys", JSON.stringify({
    publicKey:  publicKey.trim(),
    serviceId:  serviceId.trim(),
    templateId: templateId.trim()
  }));
}

function emailJSConfigured() {
  var keys = getEmailJSKeys();
  return keys && keys.publicKey && keys.serviceId && keys.templateId &&
         keys.publicKey !== "YOUR_PUBLIC_KEY";
}

// ========== INITIALISE EMAILJS SDK ==========
function initEmailJS() {
  if (typeof emailjs === "undefined") return false;
  var keys = getEmailJSKeys();
  if (!keys || !keys.publicKey || keys.publicKey === "YOUR_PUBLIC_KEY") return false;
  emailjs.init(keys.publicKey);
  return true;
}

// ========== SEND EMAIL VIA EMAILJS ==========
// type: "order" or "payment"
// toEmail is always the user's registered Gmail from session
// Returns a Promise
function sendEmailJS(type, toEmail, buyerName, orderNumber, itemNames, itemCount, total) {
  if (!toEmail || !buyerName || !orderNumber) {
    return Promise.reject(new Error("Missing required email fields."));
  }

  if (!initEmailJS()) {
    // Keys not set — show the setup panel
    showEmailSetupPanel();
    return Promise.resolve({ status: "skipped", message: "EmailJS keys not configured." });
  }

  var keys = getEmailJSKeys();

  // ========== BUILD TEMPLATE PARAMS ==========
  // These variable names must match what you put in your EmailJS template
  var templateParams = {
    to_name:      buyerName,
    to_email:     toEmail,          // registered Gmail — goes directly to buyer's inbox
    order_number: orderNumber,
    item_names:   itemNames || "Your ordered items",
    item_count:   String(itemCount || 1),
    total:        "R" + parseFloat(total || 0).toFixed(2),
    email_type:   type === "order" ? "Order Confirmed \u2705" : "Payment Confirmed \u2705",
    fnb_account:  "62849301782",
    branch_code:  "250655",
    subject:      type === "order"
      ? "Order Confirmation - " + orderNumber + " | DigitalMarketingSA"
      : "Payment Confirmed - " + orderNumber + " | DigitalMarketingSA"
  };

  // ========== SEND VIA EMAILJS SDK ==========
  return emailjs.send(keys.serviceId, keys.templateId, templateParams)
    .then(function (response) {
      console.log("EmailJS sent OK:", response.status, response.text);
      return response;
    })
    .catch(function (err) {
      console.error("EmailJS send error:", err);
      throw err;
    });
}

// ========== SHOW EMAILJS SETUP PANEL ==========
// Called automatically when keys are missing — so user can enter them in-app
function showEmailSetupPanel() {
  var panel = document.getElementById("emailSetupPanel");
  if (panel) {
    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function hideEmailSetupPanel() {
  var panel = document.getElementById("emailSetupPanel");
  if (panel) panel.style.display = "none";
}

// ========== SAVE KEYS FROM SETUP PANEL ==========
function saveEmailSetup() {
  var publicKey  = (document.getElementById("ejsPublicKey")  || {}).value || "";
  var serviceId  = (document.getElementById("ejsServiceId")  || {}).value || "";
  var templateId = (document.getElementById("ejsTemplateId") || {}).value || "";

  if (!publicKey || !serviceId || !templateId) {
    alert("Please fill in all three EmailJS fields.");
    return;
  }

  saveEmailJSKeys(publicKey, serviceId, templateId);

  var msg = document.getElementById("ejsSaveMsg");
  if (msg) {
    msg.textContent = "\u2705 EmailJS keys saved! Emails will now deliver to your registered Gmail.";
    msg.style.display = "block";
  }

  // Hide panel after 2 seconds
  setTimeout(hideEmailSetupPanel, 2000);
}

// ========== PREFILL SETUP PANEL WITH SAVED KEYS ==========
function prefillSetupPanel() {
  var keys = getEmailJSKeys();
  if (!keys) return;
  if (document.getElementById("ejsPublicKey"))  document.getElementById("ejsPublicKey").value  = keys.publicKey  || "";
  if (document.getElementById("ejsServiceId"))  document.getElementById("ejsServiceId").value  = keys.serviceId  || "";
  if (document.getElementById("ejsTemplateId")) document.getElementById("ejsTemplateId").value = keys.templateId || "";
}

document.addEventListener("DOMContentLoaded", function () {
  prefillSetupPanel();
});
