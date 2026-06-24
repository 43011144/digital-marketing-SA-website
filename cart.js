// ========== CART PAGE SCRIPT ==========

function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("dmsa_cart") || "[]"); } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem("dmsa_cart", JSON.stringify(cart));
  if (typeof updateCartBadge === "function") updateCartBadge();
}

function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function showCartMessage(text, type) {
  var msg = document.getElementById("cartMessage");
  msg.textContent   = text;
  msg.className     = "cart-message " + type;
  msg.style.display = "block";
  msg.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ========== RENDER CART ==========
function renderCart() {
  var cart     = getCart();
  var list     = document.getElementById("cartItemsList");
  var emptyMsg = document.getElementById("emptyCartMsg");

  list.innerHTML = "";

  if (!cart || cart.length === 0) {
    emptyMsg.style.display = "block";
    document.getElementById("subtotalAmt").textContent = "R0.00";
    document.getElementById("totalAmt").textContent    = "R0.00";
    document.getElementById("itemCountAmt").textContent = "0 items";
    document.getElementById("placeOrderBtn").disabled  = true;
    return;
  }

  emptyMsg.style.display = "none";
  document.getElementById("placeOrderBtn").disabled = false;

  var total     = 0;
  var itemCount = 0;

  for (var i = 0; i < cart.length; i++) {
    var qty = cart[i].qty || 1;
    total     += parseFloat(cart[i].price) * qty;
    itemCount += qty;
    list.appendChild(buildCartItemCard(cart[i], i));
  }

  document.getElementById("subtotalAmt").textContent  = "R" + total.toFixed(2);
  document.getElementById("totalAmt").textContent     = "R" + total.toFixed(2);
  document.getElementById("itemCountAmt").textContent = itemCount + " item" + (itemCount !== 1 ? "s" : "");
}

// ========== BUILD CART ITEM CARD ==========
function buildCartItemCard(item, index) {
  var qty = item.qty || 1;
  var card = document.createElement("div");
  card.className = "cart-item-card";

  var imgHtml = item.imgSrc
    ? '<img src="' + esc(item.imgSrc) + '" alt="' + esc(item.name) + '" class="cart-item-img" onerror="this.style.display=\'none\'" />'
    : '<div class="cart-item-icon"><i class="fas fa-mobile-alt"></i></div>';

  card.innerHTML =
    imgHtml +
    '<div class="cart-item-info">' +
      '<h4>' + esc(item.name) + '</h4>' +
      '<p>' + esc(item.category || "Electronics") + '</p>' +
      '<div class="cart-qty-controls">' +
        '<button onclick="changeQty(' + index + ', -1)" class="qty-btn"><i class="fas fa-minus"></i></button>' +
        '<span class="qty-display">' + qty + '</span>' +
        '<button onclick="changeQty(' + index + ', 1)" class="qty-btn"><i class="fas fa-plus"></i></button>' +
      '</div>' +
    '</div>' +
    '<div class="cart-item-right">' +
      '<span class="cart-item-price">R' + (parseFloat(item.price) * qty).toFixed(2) + '</span>' +
      '<button class="cart-item-remove" onclick="removeFromCart(' + index + ')" title="Remove item">' +
        '<i class="fas fa-trash-alt"></i>' +
      '</button>' +
    '</div>';
  return card;
}

function changeQty(index, delta) {
  var cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = (cart[index].qty || 1) + delta;
  if (cart[index].qty < 1) cart[index].qty = 1;
  saveCart(cart);
  renderCart();
}

function removeFromCart(index) {
  var cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// ========== PLACE ORDER ==========
function placeOrder() {
  var cart = getCart();
  var user = getSession();

  if (!cart || cart.length === 0) {
    showCartMessage("Your cart is empty.", "error");
    return;
  }

  var btn = document.getElementById("placeOrderBtn");
  btn.disabled    = true;
  btn.textContent = "Placing order...";

  var itemNames = cart.map(function (i) {
    return (i.qty && i.qty > 1 ? i.qty + "x " : "") + i.name;
  }).join(", ");
  var total = cart.reduce(function (sum, i) {
    return sum + parseFloat(i.price) * (i.qty || 1);
  }, 0);
  var totalItems = cart.reduce(function (s, i) { return s + (i.qty || 1); }, 0);

  var orderData = {
    buyer_id:    user.id,
    buyer_name:  user.name,
    buyer_email: user.email,
    item_name:   itemNames,
    total:       total,
    item_count:  totalItems
  };

  fetch("save_order.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(orderData)
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        onOrderSuccess(data.order_number, cart, totalItems);
      } else {
        showCartMessage(data.message || "Failed to place order.", "error");
      }
    })
    .catch(function () {
      var orderNumber = "DMSA-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      var orders = [];
      try { orders = JSON.parse(localStorage.getItem("dmsa_orders") || "[]"); } catch (e) {}
      orders.push({
        order_number: orderNumber,
        buyer_id:     user.id,
        buyer_email:  user.email,
        item_name:    itemNames,
        total:        total,
        item_count:   totalItems,
        status:       "pending",
        date:         new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
      });
      localStorage.setItem("dmsa_orders", JSON.stringify(orders));
      onOrderSuccess(orderNumber, cart, totalItems);
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-credit-card"></i> Place Order &amp; Pay';
    });
}

function onOrderSuccess(orderNumber, cart, totalItems) {
  var user  = getSession();
  var total = cart.reduce(function (s, i) { return s + parseFloat(i.price) * (i.qty || 1); }, 0);
  var names = cart.map(function (i) { return (i.qty && i.qty > 1 ? i.qty + "x " : "") + i.name; }).join(", ");

  saveCart([]);
  document.querySelector(".cart-layout").style.display = "none";
  var confirmation = document.getElementById("orderConfirmation");
  document.getElementById("confirmOrderNumber").textContent = orderNumber;
  document.getElementById("confirmItemCount").textContent   = totalItems + " item" + (totalItems !== 1 ? "s" : "");
  confirmation.style.display = "block";
  confirmation.scrollIntoView({ behavior: "smooth", block: "start" });

  // ========== SEND ORDER CONFIRMATION EMAIL VIA EMAILJS ==========
  // EmailJS sends real emails directly to the buyer's inbox (Gmail, Outlook etc.)
  // No PHP mail server needed — works on Live Server and production
  if (user && user.email) {
    // Show sending indicator
    var emailStatus = document.getElementById("emailStatusMsg");
    if (emailStatus) { emailStatus.textContent = "Sending confirmation email..."; emailStatus.style.display = "block"; }

    sendEmailJS("order", user.email, user.name, orderNumber, names, totalItems, total)
      .then(function () {
        if (emailStatus) {
          emailStatus.textContent = "✅ Confirmation email sent to " + user.email;
          emailStatus.style.color = "#28a745";
        }
      })
      .catch(function () {
        if (emailStatus) {
          emailStatus.textContent = "⚠️ Email delivery failed — check EmailJS keys in send_emailjs.js";
          emailStatus.style.color = "#dc3545";
        }
      });
  }
}

// ========== SEND PAYMENT CONFIRMED EMAIL VIA EMAILJS ==========
// Called when the buyer clicks "I Have Paid" on the confirmation screen
function sendPaymentEmail() {
  var orderNumber = document.getElementById("confirmOrderNumber").textContent;
  var user        = getSession();

  if (!user || !orderNumber) return;

  var btn = document.getElementById("paidBtn");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }

  // ===== SEND VIA EMAILJS — real email to buyer's inbox =====
  sendEmailJS("payment", user.email, user.name, orderNumber, "Your ordered items", 1, 0)
    .then(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check-circle"></i> Payment Submitted!'; }
      var note = document.getElementById("paymentSentNote");
      if (note) {
        note.textContent = "✅ Payment confirmation email sent to " + user.email;
        note.style.display = "block";
      }
    })
    .catch(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check-circle"></i> Payment Submitted!'; }
      var note = document.getElementById("paymentSentNote");
      if (note) {
        note.textContent = "Payment noted. Email delivery failed — check EmailJS setup.";
        note.style.display = "block";
      }
    });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function () {
  var user = getSession();

  if (!user) {
    document.getElementById("loginWall").style.display   = "block";
    document.getElementById("cartContent").style.display = "none";
    sessionStorage.setItem("dmsa_redirect", "cart.html");
    return;
  }

  document.getElementById("loginWall").style.display    = "none";
  document.getElementById("cartContent").style.display  = "block";
  renderCart();
});
