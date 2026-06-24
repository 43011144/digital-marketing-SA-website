// ========== ORDER PAGE SCRIPT ==========

// ========== SESSION HELPER ==========
function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

// ========== CART HELPER ==========
function getCart() {
  try { return JSON.parse(localStorage.getItem("dmsa_cart") || "[]"); } catch (e) { return []; }
}

// ========== LOCALSTORAGE ORDERS HELPER (fallback when PHP is unavailable) ==========
function getLocalOrders() {
  try { return JSON.parse(localStorage.getItem("dmsa_orders") || "[]"); } catch (e) { return []; }
}

// ========== HTML ESCAPE HELPER ==========
function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ========== LOAD ORDERS ==========
function loadOrders(user) {
  // Try get_orders.php first (AMPPS) — falls back to localStorage on Live Server
  fetch("get_orders.php?buyer_id=" + encodeURIComponent(user.id))
    .then(function (r) { return r.json(); })
    .then(function (data) { renderOrders(data.orders || []); })
    .catch(function () {
      // PHP not available — filter localStorage orders by buyer email
      var orders = getLocalOrders().filter(function (o) {
        return o.buyer_email === user.email;
      });
      renderOrders(orders);
    });
}

// ========== RENDER ORDERS ==========
function renderOrders(orders) {
  var list  = document.getElementById("ordersList");
  var noMsg = document.getElementById("noOrdersMsg");

  list.innerHTML = "";

  if (!orders || orders.length === 0) {
    noMsg.style.display = "block";
    return;
  }

  noMsg.style.display = "none";

  for (var i = 0; i < orders.length; i++) {
    list.appendChild(buildOrderCard(orders[i]));
  }
}

// ========== BUILD ORDER CARD ==========
function buildOrderCard(order) {
  var card = document.createElement("div");
  card.className = "order-card";

  // Payment instructions shown for pending orders
  var paymentHtml = order.status === "pending"
    ? '<div class="payment-info">' +
        '<strong>💳 How to Pay:</strong>' +
        '<p>Use your banking app (Capitec, ABSA, Standard Bank, EFT, etc.)</p>' +
        '<p>Reference: <strong>' + esc(order.order_number) + '</strong></p>' +
        '<p>Account: DigitalMarketingSA &bull; Bank: FNB &bull; Acc: 62849301782</p>' +
        '<a href="cart.html" class="order-go-cart-btn">' +
          '<i class="fas fa-shopping-cart"></i> Go to Cart &amp; Pay' +
        '</a>' +
      '</div>'
    : "";

  // Item count badge
  var countBadge = order.item_count
    ? '<span class="order-count-badge"><i class="fas fa-box"></i> ' + order.item_count + ' item' + (order.item_count !== 1 ? "s" : "") + '</span>'
    : "";

  // ========== ORDERED ITEMS LIST ==========
  // Parses the comma-separated item_name field into individual rows so the
  // buyer can see exactly what they ordered on the order page
  var itemsHtml = buildOrderItemsList(order.item_name);

  card.innerHTML =
    '<div class="order-card-top">' +
      '<div>' +
        '<h3>' + esc(order.item_name) + '</h3>' +
        '<p>' + esc(order.date || "") + '</p>' +
      '</div>' +
      '<div class="order-number-box">' +
        countBadge +
        '<small>Order Number</small>' +
        '<strong>' + esc(order.order_number) + '</strong>' +
      '</div>' +
    '</div>' +

    // ===== ITEMS BREAKDOWN =====
    itemsHtml +

    '<div class="order-card-bottom">' +
      '<span class="order-total">R' + parseFloat(order.total).toFixed(2) + '</span>' +
      '<span class="order-status-badge ' + esc(order.status) + '">' + esc(order.status) + '</span>' +
    '</div>' +
    paymentHtml;

  return card;
}

// ========== BUILD ORDERED ITEMS LIST ==========
// Parses "2x laptop, iphone 15 pro max" into a visual items breakdown table
function buildOrderItemsList(itemName) {
  if (!itemName) return "";

  // Split by comma to get individual items
  var rawItems = itemName.split(",");
  var rows     = "";

  for (var i = 0; i < rawItems.length; i++) {
    var raw = rawItems[i].trim();
    if (!raw) continue;

    // Check for qty prefix like "2x laptop"
    var qty  = 1;
    var name = raw;
    var qtyMatch = raw.match(/^(\d+)x\s+(.+)$/i);
    if (qtyMatch) {
      qty  = parseInt(qtyMatch[1]);
      name = qtyMatch[2];
    }

    rows +=
      '<div class="order-item-row">' +
        '<i class="fas fa-mobile-alt order-item-icon"></i>' +
        '<span class="order-item-name">' + esc(name) + '</span>' +
        (qty > 1 ? '<span class="order-item-qty">x' + qty + '</span>' : '') +
      '</div>';
  }

  if (!rows) return "";

  return '<div class="order-items-breakdown">' +
           '<h4><i class="fas fa-list"></i> Items Ordered</h4>' +
           rows +
         '</div>';
}

// ========== RENDER CURRENT CART (live preview at top of page) ==========
// Shows the items currently in cart so the buyer knows what they are about to order
function renderCartPreview() {
  var cart      = getCart();
  var section   = document.getElementById("cartPreviewSection");
  var grid      = document.getElementById("cartPreviewGrid");
  var totalEl   = document.getElementById("cartPreviewTotal");
  var countEl   = document.getElementById("cartPreviewCount");

  if (!cart || cart.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  grid.innerHTML = "";

  var total     = 0;
  var itemCount = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var qty  = item.qty || 1;
    total     += parseFloat(item.price) * qty;
    itemCount += qty;

    var row = document.createElement("div");
    row.className = "cart-preview-row";

    var imgHtml = item.imgSrc
      ? '<img src="' + esc(item.imgSrc) + '" class="cart-preview-img" alt="' + esc(item.name) + '" onerror="this.style.display=\'none\'" />'
      : '<div class="cart-preview-icon"><i class="fas fa-mobile-alt"></i></div>';

    row.innerHTML =
      imgHtml +
      '<div class="cart-preview-info">' +
        '<span class="cart-preview-name">' + esc(item.name) + '</span>' +
        '<span class="cart-preview-cat">'  + esc(item.category || "Electronics") + '</span>' +
      '</div>' +
      '<div class="cart-preview-right">' +
        (qty > 1 ? '<span class="cart-preview-qty">x' + qty + '</span>' : '') +
        '<span class="cart-preview-price">R' + (parseFloat(item.price) * qty).toFixed(2) + '</span>' +
      '</div>';

    grid.appendChild(row);
  }

  totalEl.textContent = "R" + total.toFixed(2);
  countEl.textContent = itemCount + " item" + (itemCount !== 1 ? "s" : "");
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function () {
  var user = getSession();

  if (!user) {
    // Not logged in — show login wall, hide orders content
    document.getElementById("loginWall").style.display     = "block";
    document.getElementById("ordersContent").style.display = "none";
    // Save this page as the redirect target after login
    sessionStorage.setItem("dmsa_redirect", "order.html");
    return;
  }

  // Logged in — show orders and cart preview
  document.getElementById("loginWall").style.display     = "none";
  document.getElementById("ordersContent").style.display = "block";

  renderCartPreview();
  loadOrders(user);
});
