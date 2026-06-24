// ========== SHOP PAGE SCRIPT ==========

function getBasePath() {
  var path  = window.location.pathname;
  var parts = path.split("/");
  parts.pop();
  return window.location.origin + parts.join("/") + "/";
}

function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("dmsa_cart") || "[]"); } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem("dmsa_cart", JSON.stringify(cart));
  // Update nav badge immediately
  if (typeof updateCartBadge === "function") updateCartBadge();
}

// ========== ROLE CHECK ==========
// Returns "buyer", "seller", or "both"
function getActiveMode() {
  var session = getSession();
  if (!session) return "buyer"; // guests see buy tab
  return session.activeMode || session.role || "buyer";
}

// ========== TAB SWITCHING ==========
function switchTab(tab) {
  var buyTab  = document.getElementById("buyTab");
  var sellTab = document.getElementById("sellTab");
  var buyBtn  = document.getElementById("buyTabBtn");
  var sellBtn = document.getElementById("sellTabBtn");

  if (tab === "buy") {
    buyTab.style.display  = "block";
    sellTab.style.display = "none";
    buyBtn.classList.add("active");
    sellBtn.classList.remove("active");
  } else {
    buyTab.style.display  = "none";
    sellTab.style.display = "block";
    sellBtn.classList.add("active");
    buyBtn.classList.remove("active");
    loadUserListings();
  }
}

// ========== FILTER AND SORT PRODUCTS ==========
function filterProducts() {
  var searchVal   = document.getElementById("searchInput").value.toLowerCase();
  var categoryVal = document.getElementById("categoryFilter").value;
  var sortVal     = document.getElementById("sortFilter").value;
  var grid        = document.getElementById("productGrid");
  var boxes       = grid.querySelectorAll(".electronicBox");
  var visible     = [];

  for (var i = 0; i < boxes.length; i++) {
    var name          = boxes[i].getAttribute("data-name").toLowerCase();
    var category      = boxes[i].getAttribute("data-category");
    var matchSearch   = name.indexOf(searchVal) !== -1;
    var matchCategory = categoryVal === "all" || category === categoryVal;

    if (matchSearch && matchCategory) {
      boxes[i].style.display = "flex";
      visible.push(boxes[i]);
    } else {
      boxes[i].style.display = "none";
    }
  }

  document.getElementById("noResults").style.display = visible.length === 0 ? "block" : "none";

  if (sortVal !== "default" && visible.length > 1) {
    visible.sort(function (a, b) {
      var priceA = parseFloat(a.getAttribute("data-price"));
      var priceB = parseFloat(b.getAttribute("data-price"));
      return sortVal === "price-asc" ? priceA - priceB : priceB - priceA;
    });
    for (var j = 0; j < visible.length; j++) {
      grid.appendChild(visible[j]);
    }
  }
}

// ========== ADD TO CART (triggered by shopping cart icon click) ==========
function addToCart(name, price, category, imgSrc) {
  var session = getSession();
  var mode    = getActiveMode();

  // Seller-only mode cannot buy
  if (mode === "seller") {
    showToast("Switch to Buyer mode to add items to cart", "warning");
    return;
  }

  if (!session) {
    sessionStorage.setItem("dmsa_redirect", "cart.html");
    if (confirm("You need to be logged in to add items to your cart.\n\nGo to login page?")) {
      window.location.href = "login.html";
    }
    return;
  }

  var cart = getCart();
  // Check if already in cart
  var existing = cart.find(function(i) { return i.name === name; });
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ name: name, price: price, category: category, imgSrc: imgSrc || "", qty: 1 });
  }
  saveCart(cart);
  showToast(name + " added to cart!", "success");
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type) {
  var existing = document.getElementById("shopToast");
  if (existing) existing.remove();

  var toast = document.createElement("div");
  toast.id = "shopToast";
  toast.className = "shop-toast " + (type || "success");
  toast.innerHTML = '<i class="fas fa-' + (type === "warning" ? "exclamation-triangle" : "check-circle") + '"></i> ' + esc(message);
  document.body.appendChild(toast);

  setTimeout(function() { toast.classList.add("visible"); }, 10);
  setTimeout(function() {
    toast.classList.remove("visible");
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
  }, 2800);
}

// ========== IMAGE PREVIEW ==========
function previewImage(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showSellMessage("Image must be under 5MB.", "error");
    input.value = "";
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("imagePreview").src = e.target.result;
    document.getElementById("imagePlaceholder").style.display    = "none";
    document.getElementById("imagePreviewWrapper").style.display = "block";
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  var input = document.getElementById("deviceImage");
  if (input) input.value = "";
  var preview = document.getElementById("imagePreview");
  if (preview) preview.src = "";
  document.getElementById("imagePlaceholder").style.display    = "flex";
  document.getElementById("imagePreviewWrapper").style.display = "none";
}

function validateSellForm() {
  var name          = document.getElementById("deviceName").value.trim();
  var category      = document.getElementById("deviceCategory").value;
  var price         = document.getElementById("devicePrice").value.trim();
  var condition     = document.getElementById("deviceCondition").value;
  var sellerName    = document.getElementById("sellerName").value.trim();
  var sellerContact = document.getElementById("sellerContact").value.trim();

  if (!name || !category || !price || !condition || !sellerName || !sellerContact) {
    showSellMessage("Please fill in all required fields.", "error");
    return false;
  }
  if (isNaN(price) || parseFloat(price) <= 0) {
    showSellMessage("Please enter a valid price greater than 0.", "error");
    return false;
  }
  return true;
}

function showSellMessage(text, type) {
  var msg = document.getElementById("sellMessage");
  msg.textContent   = text;
  msg.className     = "sell-message " + type;
  msg.style.display = "block";
  msg.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearSellForm() {
  document.getElementById("deviceName").value        = "";
  document.getElementById("deviceCategory").value    = "";
  document.getElementById("devicePrice").value       = "";
  document.getElementById("deviceCondition").value   = "";
  document.getElementById("deviceDescription").value = "";
  document.getElementById("sellerName").value        = "";
  document.getElementById("sellerContact").value     = "";
  removeImage();
}

function saveLocally(listing) {
  var all = [];
  try { all = JSON.parse(localStorage.getItem("dmsa_listings") || "[]"); } catch (e) {}
  listing.id = Date.now();
  all.push(listing);
  localStorage.setItem("dmsa_listings", JSON.stringify(all));
}

function getLocally() {
  try { return JSON.parse(localStorage.getItem("dmsa_listings") || "[]"); } catch (e) { return []; }
}

function submitDevice() {
  if (!validateSellForm()) return;

  var btn = document.querySelector(".sell-submit-btn");
  btn.disabled    = true;
  btn.textContent = "Submitting...";

  var formData = new FormData();
  formData.append("device_name",      document.getElementById("deviceName").value.trim());
  formData.append("category",         document.getElementById("deviceCategory").value);
  formData.append("price",            document.getElementById("devicePrice").value.trim());
  formData.append("condition_status", document.getElementById("deviceCondition").value);
  formData.append("description",      document.getElementById("deviceDescription").value.trim());
  formData.append("seller_name",      document.getElementById("sellerName").value.trim());
  formData.append("seller_contact",   document.getElementById("sellerContact").value.trim());

  var imageFile = document.getElementById("deviceImage").files[0];
  if (imageFile) {
    formData.append("deviceImage", imageFile);
  }

  fetch(getBasePath() + "sell_device.php", {
    method: "POST",
    body:   formData
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.success) {
        showSellMessage("Your device has been listed successfully! It will appear on the Buy page.", "success");
        clearSellForm();
        loadUserListings();
      } else {
        showSellMessage(data.message || "Something went wrong. Please try again.", "error");
      }
    })
    .catch(function () {
      var previewSrc = document.getElementById("imagePreview").src || null;
      var localListing = {
        device_name:      document.getElementById("deviceName").value.trim(),
        category:         document.getElementById("deviceCategory").value,
        price:            parseFloat(document.getElementById("devicePrice").value.trim()),
        condition_status: document.getElementById("deviceCondition").value,
        description:      document.getElementById("deviceDescription").value.trim(),
        seller_name:      document.getElementById("sellerName").value.trim(),
        seller_contact:   document.getElementById("sellerContact").value.trim(),
        image_path:       previewSrc && previewSrc.startsWith("data:") ? previewSrc : null
      };
      saveLocally(localListing);
      showSellMessage("Your device has been listed successfully!", "success");
      clearSellForm();
      loadUserListings();
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-upload"></i> Submit Device for Sale';
    });
}

function loadUserListings() {
  fetch(getBasePath() + "get_listings.php")
    .then(function (response) { return response.json(); })
    .then(function (data) { renderListings(data.listings || []); })
    .catch(function () { renderListings(getLocally()); });
}

function renderListings(listings) {
  var grid        = document.getElementById("userListingsGrid");
  var section     = document.getElementById("userListingsSection");
  var productGrid = document.getElementById("productGrid");

  grid.innerHTML = "";
  var oldDynamic = productGrid.querySelectorAll(".dynamic-listing");
  for (var i = 0; i < oldDynamic.length; i++) { oldDynamic[i].remove(); }

  if (!listings || listings.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  for (var j = 0; j < listings.length; j++) {
    var item = listings[j];
    grid.appendChild(buildCard(item, true));
    var buyCard = buildCard(item, false);
    buyCard.classList.add("dynamic-listing");
    productGrid.appendChild(buyCard);
  }
}

// ========== BUILD LISTING CARD ==========
function buildCard(item, showDelete) {
  var box = document.createElement("div");
  box.className = "electronicBox";
  box.setAttribute("data-name",     item.device_name.toLowerCase());
  box.setAttribute("data-category", item.category);
  box.setAttribute("data-price",    item.price);
  box.setAttribute("data-id",       item.id || "");

  var imgSrc = "";
  var imgHtml;
  if (item.image_path && item.image_path !== "null" && item.image_path !== null) {
    imgSrc = item.image_path.startsWith("data:") ? item.image_path : getBasePath() + item.image_path;
    imgHtml = '<img src="' + imgSrc + '" alt="' + esc(item.device_name) + '" class="listing-card-img" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'" />' +
              '<div class="no-image-placeholder" style="display:none;"><i class="fas fa-mobile-alt"></i></div>';
  } else {
    imgHtml = '<div class="no-image-placeholder"><i class="fas fa-mobile-alt"></i></div>';
  }

  var deleteHtml = "";
  if (showDelete && item.id) {
    deleteHtml = '<button class="delete-listing-btn" onclick="deleteListing(' + item.id + ', this)">' +
                   '<i class="fas fa-trash-alt"></i> Remove Listing' +
                 '</button>';
  }

  // Cart button — clicking adds to cart instead of navigating
  var cartBtn = showDelete
    ? "" // sell tab — no buy button
    : '<button class="add-to-cart-btn" onclick="addToCart(\'' + esc(item.device_name).replace(/'/g,"&#39;") + '\',' + parseFloat(item.price) + ',\'' + esc(item.category) + '\',\'' + imgSrc.replace(/'/g,"&#39;") + '\')">' +
        '<i class="fas fa-shopping-cart"></i>' +
      '</button>';

  box.innerHTML =
    '<div class="description">' +
      '<span class="seller-badge">Seller Listed</span>' +
      imgHtml +
      '<span>'          + esc(item.device_name)      + '</span>' +
      '<h5>Condition: ' + esc(item.condition_status) + '</h5>' +
      '<h5>Seller: '    + esc(item.seller_name)      + '</h5>' +
      '<h4>R'           + parseFloat(item.price).toFixed(2) + '</h4>' +
      cartBtn +
      deleteHtml +
    '</div>';

  return box;
}

function deleteListing(id, btn) {
  if (!confirm("Are you sure you want to remove this listing?")) return;
  id = parseInt(id, 10);
  btn.disabled    = true;
  btn.textContent = "Removing...";

  fetch(getBasePath() + "delete_listing.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ id: id })
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.success) {
        deleteLocally(id);
        showSellMessage("Listing removed successfully.", "success");
        loadUserListings();
      } else {
        alert("Could not delete: " + (data.message || "Unknown error."));
        btn.disabled    = false;
        btn.textContent = "Remove Listing";
      }
    })
    .catch(function () {
      deleteLocally(id);
      loadUserListings();
    });
}

function deleteLocally(id) {
  var all = [];
  try { all = JSON.parse(localStorage.getItem("dmsa_listings") || "[]"); } catch (e) {}
  all = all.filter(function (item) { return item.id != id; });
  localStorage.setItem("dmsa_listings", JSON.stringify(all));
}

function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ========== WIRE UP STATIC PRODUCT CART BUTTONS ==========
function wireStaticCartButtons() {
  var boxes = document.querySelectorAll("#productGrid .electronicBox:not(.dynamic-listing)");
  boxes.forEach(function(box) {
    var cartLink = box.querySelector("a[href='cart.html']");
    if (!cartLink) return;
    var name     = box.getAttribute("data-name") || "Device";
    var price    = parseFloat(box.getAttribute("data-price")) || 0;
    var category = box.getAttribute("data-category") || "electronics";
    var imgEl    = box.querySelector("img");
    var imgSrc   = imgEl ? imgEl.src : "";

    // Replace the anchor with a button
    var btn = document.createElement("button");
    btn.className = "add-to-cart-btn";
    btn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
    btn.onclick = function() { addToCart(name, price, category, imgSrc); };
    cartLink.parentNode.replaceChild(btn, cartLink);
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function () {
  wireStaticCartButtons();
  loadUserListings();

  // Seller-only mode: disable sell tab from buy-only users (just UI hint)
  var session = getSession();
  var mode = getActiveMode();
  if (mode === "buyer") {
    var sellBtn = document.getElementById("sellTabBtn");
    if (sellBtn) {
      sellBtn.title = "Switch to Seller mode in your profile to list devices";
    }
  }
});
