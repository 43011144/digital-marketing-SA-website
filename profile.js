// ========== PROFILE PAGE SCRIPT ==========

// ========== HELPERS ==========
function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

function saveSession(data) {
  localStorage.setItem("dmsa_session", JSON.stringify(data));
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem("dmsa_users") || "[]"); } catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem("dmsa_users", JSON.stringify(users));
}

function getLocalOrders() {
  try { return JSON.parse(localStorage.getItem("dmsa_orders") || "[]"); } catch (e) { return []; }
}

function logout() {
  localStorage.removeItem("dmsa_session");
  window.location.href = "login.html";
}

function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ========== MODE SWITCHING (Buyer / Seller) ==========
function switchMode(mode) {
  var user = getSession();
  if (!user) return;

  user.activeMode = mode;
  saveSession(user);

  // Also persist in users array
  var users = getUsers();
  var idx = users.findIndex(function(u) { return u.id === user.id; });
  if (idx !== -1) {
    users[idx].activeMode = mode;
    saveUsers(users);
  }

  renderModeUI(mode);
}

function renderModeUI(mode) {
  var buyerBtn    = document.getElementById("modeBuyerBtn");
  var sellerBtn   = document.getElementById("modeSellerBtn");
  var infoBar     = document.getElementById("modeInfoBar");
  var adminBtn    = document.getElementById("tabAdmin");
  var blockedStat = document.getElementById("statBlockedStat");

  if (buyerBtn)  buyerBtn.classList.toggle("active", mode === "buyer");
  if (sellerBtn) sellerBtn.classList.toggle("active", mode === "seller");

  if (infoBar) {
    if (mode === "buyer") {
      infoBar.innerHTML = '<i class="fas fa-shopping-bag"></i> <strong>Buyer Mode</strong> — Browse and purchase devices. Emails sent on order & payment.';
      infoBar.className = "mode-info-bar buyer-mode";
    } else {
      infoBar.innerHTML = '<i class="fas fa-store"></i> <strong>Seller Mode</strong> — List devices, manage contacts, block buyers, and access the Admin panel.';
      infoBar.className = "mode-info-bar seller-mode";
    }
  }

  // Admin tab only visible in seller mode
  if (adminBtn)    adminBtn.style.display    = mode === "seller" ? "inline-block" : "none";
  if (blockedStat) blockedStat.style.display = mode === "seller" ? "flex" : "none";
}

// ========== SHOW PROFILE TAB ==========
function showProfileTab(tab) {
  var tabs = ["myListings", "myOrders", "discover", "admin"];
  for (var i = 0; i < tabs.length; i++) {
    var el = document.getElementById(tabs[i]);
    if (el) el.style.display = tabs[i] === tab ? "block" : "none";
    var btnId = "tab" + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1);
    var btn   = document.getElementById(btnId);
    if (btn) btn.classList.remove("active");
  }
  var activeBtnId = "tab" + tab.charAt(0).toUpperCase() + tab.slice(1);
  var activeBtn   = document.getElementById(activeBtnId);
  if (activeBtn) activeBtn.classList.add("active");

  // Load admin panel data when tab is opened
  if (tab === "admin") loadAdminPanel();
}

// ========== LOAD PROFILE ==========
function loadProfile() {
  var user = getSession();
  if (!user) {
    // Not logged in — redirect to login
    sessionStorage.setItem("dmsa_redirect", "profile.html");
    window.location.href = "login.html";
    return;
  }

  // Populate profile header
  document.getElementById("profileName").textContent  = user.name;
  document.getElementById("profileBio").textContent   = user.bio || "";
  document.getElementById("profilePhone").innerHTML   = '<i class="fas fa-phone"></i> ' + esc(user.phone || "");
  document.getElementById("profileEmail").innerHTML   = '<i class="fas fa-envelope"></i> ' + esc(user.email || "");

  // Set role badge
  var badge = document.getElementById("profileRoleBadge");
  badge.textContent = "Buyer & Seller";

  // Set mode and render UI
  var activeMode = user.activeMode || "buyer";
  renderModeUI(activeMode);

  // Follower and following stats
  var following = user.following || [];
  document.getElementById("statFollowing").textContent = following.length;

  var allUsers = getUsers();
  var followerCount = allUsers.filter(function(u) {
    return u.following && u.following.indexOf(user.id) !== -1;
  }).length;
  document.getElementById("statFollowers").textContent = followerCount;

  // Load all tabs
  loadMyListings(user);
  loadMyOrders(user);
  loadAllUsers(user);
  loadStories(user);
}

// ========== LOAD MY LISTINGS ==========
function loadMyListings(user) {
  // Try get_listings.php first (AMPPS) — falls back to localStorage on Live Server
  fetch("get_listings.php")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var mine = (data.listings || []).filter(function (l) {
        return l.seller_name === user.name || l.seller_contact === user.phone;
      });
      renderMyListings(mine);
    })
    .catch(function () {
      // PHP not available — filter localStorage listings by seller name
      var local = [];
      try { local = JSON.parse(localStorage.getItem("dmsa_listings") || "[]"); } catch (e) {}
      renderMyListings(local.filter(function (l) { return l.seller_name === user.name; }));
    });
}

function renderMyListings(listings) {
  var grid = document.getElementById("myListingsGrid");
  var none = document.getElementById("noListings");
  grid.innerHTML = "";
  document.getElementById("statListings").textContent = listings.length;

  if (!listings || listings.length === 0) {
    none.style.display = "block";
    return;
  }
  none.style.display = "none";

  for (var i = 0; i < listings.length; i++) {
    grid.appendChild(buildListingCard(listings[i]));
  }
}

function buildListingCard(item) {
  var box = document.createElement("div");
  box.className = "electronicBox";

  // Show image if available, else a placeholder icon
  var imgHtml = item.image_path && item.image_path !== "null"
    ? '<img src="' + esc(item.image_path) + '" alt="' + esc(item.device_name) + '" class="listing-card-img" />'
    : '<div class="no-image-placeholder"><i class="fas fa-mobile-alt"></i></div>';

  box.innerHTML =
    '<div class="description">' +
      imgHtml +
      '<span>' + esc(item.device_name) + '</span>' +
      '<h5>Condition: ' + esc(item.condition_status) + '</h5>' +
      '<h4>R' + parseFloat(item.price).toFixed(2) + '</h4>' +
      '<a href="cart.html"><i class="fas fa-shopping-cart"></i></a>' +
    '</div>';

  return box;
}

// ========== LOAD MY ORDERS ==========
function loadMyOrders(user) {
  // Try get_orders.php first (AMPPS) — falls back to localStorage on Live Server
  fetch("get_orders.php?buyer_id=" + encodeURIComponent(user.id))
    .then(function (r) { return r.json(); })
    .then(function (data) { renderOrders(data.orders || []); })
    .catch(function () {
      var orders = getLocalOrders().filter(function (o) { return o.buyer_email === user.email; });
      renderOrders(orders);
    });
}

function renderOrders(orders) {
  var list = document.getElementById("myOrdersList");
  var none = document.getElementById("noOrders");
  list.innerHTML = "";
  document.getElementById("statOrders").textContent = orders.length;

  if (!orders || orders.length === 0) {
    none.style.display = "block";
    return;
  }
  none.style.display = "none";

  for (var i = 0; i < orders.length; i++) {
    list.appendChild(buildOrderCard(orders[i]));
  }
}

function buildOrderCard(order) {
  var card = document.createElement("div");
  card.className = "order-card";

  // Show item count badge if available
  var countBadge = order.item_count
    ? '<span class="order-item-count-badge"><i class="fas fa-box"></i> ' + order.item_count + ' item' + (order.item_count !== 1 ? "s" : "") + '</span>'
    : "";

  card.innerHTML =
    '<div class="order-card-info">' +
      '<h4>' + esc(order.item_name) + '</h4>' +
      '<p>R' + parseFloat(order.total).toFixed(2) + ' &bull; ' + esc(order.date || "") + '</p>' +
    '</div>' +
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
      countBadge +
      '<span class="order-number-badge">Order #' + esc(String(order.order_number)) + '</span>' +
      '<span class="order-status-badge ' + esc(order.status) + '">' + esc(order.status) + '</span>' +
    '</div>';
  return card;
}

// ========== LOAD ALL USERS (Discover tab + follow + block) ==========
function loadAllUsers(user) {
  // Try get_users.php first (AMPPS) — falls back to localStorage on Live Server
  fetch("get_users.php?current_id=" + encodeURIComponent(user.id))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderUsers(data.users || [], data.blocked || [], user);
    })
    .catch(function () {
      var allUsers = getUsers().filter(function (u) { return u.id !== user.id; });
      var myData   = getUsers().find(function (u) { return u.id === user.id; }) || {};
      renderUsers(allUsers, myData.blocked || [], user);
    });
}

function renderUsers(users, blocked, currentUser) {
  var grid = document.getElementById("usersGrid");
  var none = document.getElementById("noUsers");
  grid.innerHTML = "";
  document.getElementById("statBlocked").textContent = blocked.length;

  if (!users || users.length === 0) {
    none.style.display = "block";
    return;
  }
  none.style.display = "none";

  for (var i = 0; i < users.length; i++) {
    grid.appendChild(buildUserCard(users[i], blocked, currentUser));
  }

  // Render blocked list in admin tab
  renderBlockedList(blocked, users);
}

function buildUserCard(user, blocked, currentUser) {
  var isBlocked    = blocked.indexOf(user.id) !== -1;
  var isSellerMode = (currentUser.activeMode || "buyer") === "seller";
  var following    = currentUser.following || [];
  var isFollowing  = following.indexOf(user.id) !== -1;

  var card = document.createElement("div");
  card.className = "user-card";
  card.setAttribute("data-name", user.name.toLowerCase());
  card.setAttribute("data-role", user.role || "buyer");

  // Show story ring if user has stories
  var hasStory    = user.stories && user.stories.length > 0;
  var avatarClass = hasStory ? "user-card-avatar has-story" : "user-card-avatar";

  // Story view button — only shown if user has stories
  var storyBtn = hasStory
    ? '<button class="btn-view-story" onclick="viewUserStory(' + user.id + ', \'' + esc(user.name) + '\')">' +
        '<i class="fas fa-play-circle"></i> Story' +
      '</button>'
    : "";

  // Block button — only shown to sellers in seller mode
  var blockBtn = isSellerMode
    ? '<button class="btn-block-user' + (isBlocked ? " blocked" : "") + '" onclick="toggleBlock(' + user.id + ', this)">' +
        (isBlocked ? '<i class="fas fa-lock"></i> Unblock' : '<i class="fas fa-ban"></i> Block') +
      '</button>'
    : "";

  card.innerHTML =
    '<div class="' + avatarClass + '" onclick="' + (hasStory ? 'viewUserStory(' + user.id + ',\'' + esc(user.name) + '\')' : '') + '">' +
      '<i class="fas fa-user"></i>' +
    '</div>' +
    '<h4>' + esc(user.name) + '</h4>' +
    '<span class="user-role-badge">' + esc(user.role || "buyer") + '</span>' +
    '<p>' + esc(user.bio || "No bio yet") + '</p>' +
    '<div class="user-card-actions">' +
      '<button class="btn-follow' + (isFollowing ? " following" : "") + '" onclick="toggleFollow(' + user.id + ', this)">' +
        '<i class="fas fa-' + (isFollowing ? 'user-check' : 'user-plus') + '"></i> ' + (isFollowing ? 'Following' : 'Follow') +
      '</button>' +
      storyBtn +
      blockBtn +
    '</div>';

  return card;
}

// ========== FOLLOW / UNFOLLOW ==========
function toggleFollow(targetId, btn) {
  var user = getSession();
  if (!user) return;

  var following = user.following || [];
  var idx       = following.indexOf(targetId);
  var isNowFollowing;

  if (idx === -1) {
    following.push(targetId);
    isNowFollowing = true;
  } else {
    following.splice(idx, 1);
    isNowFollowing = false;
  }

  user.following = following;
  saveSession(user);

  // Persist in users array
  var users = getUsers();
  var myIdx = users.findIndex(function(u) { return u.id === user.id; });
  if (myIdx !== -1) {
    users[myIdx].following = following;
    saveUsers(users);
  }

  // Update button UI
  if (isNowFollowing) {
    btn.innerHTML = '<i class="fas fa-user-check"></i> Following';
    btn.classList.add("following");
  } else {
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
    btn.classList.remove("following");
  }

  document.getElementById("statFollowing").textContent = following.length;
  loadStories(user);
}

// ========== FILTER USERS (Discover tab) ==========
function filterUsers() {
  var search  = document.getElementById("discoverSearch").value.toLowerCase();
  var filter  = document.getElementById("discoverFilter").value;
  var cards   = document.getElementById("usersGrid").querySelectorAll(".user-card");
  var visible = 0;

  for (var i = 0; i < cards.length; i++) {
    var name = cards[i].getAttribute("data-name");
    var role = cards[i].getAttribute("data-role");
    var matchSearch = name.indexOf(search) !== -1;
    var matchRole   = filter === "all" || role === filter;

    if (matchSearch && matchRole) {
      cards[i].style.display = "block";
      visible++;
    } else {
      cards[i].style.display = "none";
    }
  }
  document.getElementById("noUsers").style.display = visible === 0 ? "block" : "none";
}

// ========== TOGGLE BLOCK (Seller mode only) ==========
function toggleBlock(userId, btn) {
  var user = getSession();
  if (!user || (user.activeMode || "buyer") !== "seller") return;

  var action = btn.classList.contains("blocked") ? "unblock" : "block";

  // Try block_user.php first (AMPPS) — falls back to localStorage on Live Server
  fetch("block_user.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ seller_id: user.id, blocked_id: userId, action: action })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) { updateBlockBtn(btn, action); }
    })
    .catch(function () {
      // PHP not available — toggle in localStorage
      var users   = getUsers();
      var myIndex = users.findIndex(function (u) { return u.id === user.id; });
      if (myIndex === -1) return;
      var blocked = users[myIndex].blocked || [];
      var idx     = blocked.indexOf(userId);
      if (action === "block"   && idx === -1)  blocked.push(userId);
      if (action === "unblock" && idx !== -1)  blocked.splice(idx, 1);
      users[myIndex].blocked = blocked;
      saveUsers(users);
      updateBlockBtn(btn, action);
      document.getElementById("statBlocked").textContent = blocked.length;
    });
}

function updateBlockBtn(btn, action) {
  if (action === "block") {
    btn.innerHTML = '<i class="fas fa-lock"></i> Unblock';
    btn.classList.add("blocked");
  } else {
    btn.innerHTML = '<i class="fas fa-ban"></i> Block';
    btn.classList.remove("blocked");
  }
}

// ========== RENDER BLOCKED LIST (Admin tab) ==========
function renderBlockedList(blocked, allUsers) {
  var list = document.getElementById("blockedList");
  var none = document.getElementById("noBlocked");
  if (!list) return;
  list.innerHTML = "";

  if (!blocked || blocked.length === 0) {
    if (none) none.style.display = "block";
    return;
  }
  if (none) none.style.display = "none";

  for (var i = 0; i < blocked.length; i++) {
    var found = allUsers.find(function (u) { return u.id === blocked[i]; });
    if (!found) continue;
    var card = document.createElement("div");
    card.className = "blocked-card";
    card.innerHTML =
      '<span><i class="fas fa-user"></i> ' + esc(found.name) + ' (' + esc(found.role) + ')</span>' +
      '<button class="btn-unblock" onclick="toggleBlock(' + found.id + ', this)"><i class="fas fa-unlock"></i> Unblock</button>';
    list.appendChild(card);
  }
}

// ============================================================
// ========== ADMIN PANEL (Seller Mode Only) ==========
// Covers: suspend users, unsuspend, flag listings, audit log,
// security overview — all backed by admin.php and audit_log table
// ============================================================

// ========== LOAD ADMIN PANEL ==========
function loadAdminPanel() {
  var user = getSession();
  if (!user || (user.activeMode || "buyer") !== "seller") return;

  loadSuspendedUsers(user);
  loadAuditLog(user);
  loadFlaggedListings(user);
}

// ========== SUSPEND USER ==========
function suspendUser() {
  var user   = getSession();
  var target = document.getElementById("suspendUserId").value.trim();
  var reason = document.getElementById("suspendReason").value.trim();

  if (!target || !reason) {
    showAdminMessage("Please enter a user ID and reason.", "error");
    return;
  }

  var btn = document.getElementById("suspendBtn");
  btn.disabled    = true;
  btn.textContent = "Suspending...";

  // Try admin.php first (AMPPS) — falls back to localStorage
  fetch("admin.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "suspend_user", admin_id: user.id, target_id: parseInt(target), reason: reason })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      showAdminMessage(data.message || (data.success ? "User suspended." : "Failed."), data.success ? "success" : "error");
      if (data.success) {
        document.getElementById("suspendUserId").value = "";
        document.getElementById("suspendReason").value = "";
        loadSuspendedUsers(user);
        loadAuditLog(user);
      }
    })
    .catch(function () {
      // PHP not available — simulate locally
      var suspended = [];
      try { suspended = JSON.parse(localStorage.getItem("dmsa_suspended") || "[]"); } catch (e) {}
      suspended.push({ user_id: parseInt(target), reason: reason, suspended_by: user.id, date: new Date().toLocaleDateString("en-ZA") });
      localStorage.setItem("dmsa_suspended", JSON.stringify(suspended));
      showAdminMessage("User suspended (local).", "success");
      document.getElementById("suspendUserId").value = "";
      document.getElementById("suspendReason").value = "";
      renderSuspendedUsers(suspended);
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-user-slash"></i> Suspend User';
    });
}

// ========== LOAD SUSPENDED USERS ==========
function loadSuspendedUsers(user) {
  fetch("admin.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "get_suspended", admin_id: user.id })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) { renderSuspendedUsers(data.suspended || []); })
    .catch(function () {
      try { renderSuspendedUsers(JSON.parse(localStorage.getItem("dmsa_suspended") || "[]")); } catch (e) {}
    });
}

function renderSuspendedUsers(suspended) {
  var list = document.getElementById("suspendedList");
  var none = document.getElementById("noSuspended");
  if (!list) return;
  list.innerHTML = "";

  if (!suspended || suspended.length === 0) {
    if (none) none.style.display = "block";
    return;
  }
  if (none) none.style.display = "none";

  for (var i = 0; i < suspended.length; i++) {
    var s    = suspended[i];
    var card = document.createElement("div");
    card.className = "admin-user-card";
    card.innerHTML =
      '<div class="admin-user-info">' +
        '<i class="fas fa-user-slash"></i>' +
        '<div>' +
          '<strong>' + esc(s.user_name || "User #" + s.user_id) + '</strong>' +
          '<small>' + esc(s.user_email || "") + ' &bull; ' + esc(s.user_role || "") + '</small>' +
          '<p class="admin-reason">Reason: ' + esc(s.reason) + '</p>' +
        '</div>' +
      '</div>' +
      '<button class="btn-unsuspend" onclick="unsuspendUser(' + s.user_id + ', this)">' +
        '<i class="fas fa-user-check"></i> Reinstate' +
      '</button>';
    list.appendChild(card);
  }
}

// ========== UNSUSPEND USER ==========
function unsuspendUser(userId, btn) {
  var user = getSession();
  if (!user) return;

  btn.disabled    = true;
  btn.textContent = "Reinstating...";

  fetch("admin.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "unsuspend_user", admin_id: user.id, target_id: userId })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      showAdminMessage(data.message || "User reinstated.", "success");
      if (data.success) {
        loadSuspendedUsers(user);
        loadAuditLog(user);
      }
    })
    .catch(function () {
      // PHP not available — remove from localStorage
      var suspended = [];
      try { suspended = JSON.parse(localStorage.getItem("dmsa_suspended") || "[]"); } catch (e) {}
      suspended = suspended.filter(function (s) { return s.user_id !== userId; });
      localStorage.setItem("dmsa_suspended", JSON.stringify(suspended));
      showAdminMessage("User reinstated (local).", "success");
      renderSuspendedUsers(suspended);
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-user-check"></i> Reinstate';
    });
}

// ========== FLAG LISTING ==========
function flagListing() {
  var user      = getSession();
  var listingId = document.getElementById("flagListingId").value.trim();
  var reason    = document.getElementById("flagReason").value.trim();

  if (!listingId || !reason) {
    showAdminMessage("Please enter a listing ID and reason to flag.", "error");
    return;
  }

  var btn = document.getElementById("flagBtn");
  btn.disabled    = true;
  btn.textContent = "Flagging...";

  fetch("admin.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "flag_listing", admin_id: user.id, target_id: parseInt(listingId), reason: reason })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      showAdminMessage(data.message || (data.success ? "Listing flagged." : "Failed."), data.success ? "success" : "error");
      if (data.success) {
        document.getElementById("flagListingId").value = "";
        document.getElementById("flagReason").value    = "";
        loadAuditLog(user);
        loadFlaggedListings(user);
      }
    })
    .catch(function () {
      // PHP not available — simulate locally
      var flags = [];
      try { flags = JSON.parse(localStorage.getItem("dmsa_flags") || "[]"); } catch (e) {}
      flags.push({ listing_id: parseInt(listingId), reason: reason, flagged_by: user.id, date: new Date().toLocaleDateString("en-ZA") });
      localStorage.setItem("dmsa_flags", JSON.stringify(flags));
      showAdminMessage("Listing flagged (local).", "success");
      document.getElementById("flagListingId").value = "";
      document.getElementById("flagReason").value    = "";
      renderFlaggedListings(flags);
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-flag"></i> Flag Listing';
    });
}

// ========== LOAD & RENDER FLAGGED LISTINGS ==========
function loadFlaggedListings(user) {
  fetch("admin.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "get_flagged", admin_id: user.id })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) { renderFlaggedListings(data.flagged || []); })
    .catch(function () {
      try { renderFlaggedListings(JSON.parse(localStorage.getItem("dmsa_flags") || "[]")); } catch (e) {}
    });
}

function renderFlaggedListings(flags) {
  var list = document.getElementById("flaggedList");
  var none = document.getElementById("noFlagged");
  if (!list) return;
  list.innerHTML = "";

  if (!flags || flags.length === 0) {
    if (none) none.style.display = "block";
    return;
  }
  if (none) none.style.display = "none";

  for (var i = 0; i < flags.length; i++) {
    var f    = flags[i];
    var card = document.createElement("div");
    card.className = "admin-flag-card";
    card.innerHTML =
      '<i class="fas fa-flag" style="color:#dc3545;"></i>' +
      '<div>' +
        '<strong>Listing #' + esc(String(f.listing_id || f.id || "?")) + '</strong>' +
        '<p>' + esc(f.reason) + '</p>' +
        '<small>' + esc(f.date || f.created_at || "") + '</small>' +
      '</div>';
    list.appendChild(card);
  }
}

// ========== LOAD AUDIT LOG ==========
function loadAuditLog(user) {
  fetch("admin.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "get_audit_log", admin_id: user.id })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) { renderAuditLog(data.logs || []); })
    .catch(function () {
      // PHP not available — show empty state on Live Server
      renderAuditLog([]);
    });
}

function renderAuditLog(logs) {
  var list = document.getElementById("auditLogList");
  var none = document.getElementById("noAuditLog");
  if (!list) return;
  list.innerHTML = "";

  if (!logs || logs.length === 0) {
    if (none) none.style.display = "block";
    return;
  }
  if (none) none.style.display = "none";

  for (var i = 0; i < logs.length; i++) {
    var log  = logs[i];
    var row  = document.createElement("div");
    row.className = "audit-log-row";
    row.innerHTML =
      '<span class="audit-action">' + esc(log.action) + '</span>' +
      '<span class="audit-detail">' + esc(log.detail || "") + '</span>' +
      '<span class="audit-time">' + esc(log.created_at || "") + '</span>' +
      '<span class="audit-ip">' + esc(log.ip_address || "") + '</span>';
    list.appendChild(row);
  }
}

// ========== ADMIN MESSAGE HELPER ==========
function showAdminMessage(text, type) {
  var msg = document.getElementById("adminMessage");
  if (!msg) return;
  msg.textContent   = text;
  msg.className     = "admin-message " + type;
  msg.style.display = "block";
  setTimeout(function () { msg.style.display = "none"; }, 4000);
}

// ============================================================
// ========== STORIES SYSTEM ==========
// ============================================================

var currentStories  = []; // array of {userId, userName, stories:[]}
var _curStoryIdx    = 0;  // index within current user's stories array
var storyTimer      = null;

// ========== PURGE EXPIRED STORIES (older than 24 hours) ==========
// Stories without expiresAt (old format) are treated as never expiring
function purgeExpiredStories(stories) {
  var now = Date.now();
  return (stories || []).filter(function (s) {
    return !s.expiresAt || s.expiresAt > now;
  });
}

function loadStories(user) {
  var scroll    = document.getElementById("storiesScroll");
  var allUsers  = getUsers();
  var following = user.following || [];

  // Clear old story items (keep "myStoryItem")
  var existing = scroll.querySelectorAll(".story-item:not(.my-story)");
  existing.forEach(function(el) { el.remove(); });

  // My story bubble — show ring if I have active (non-expired) stories
  var myStoryItem = document.getElementById("myStoryItem");
  var myUser      = allUsers.find(function(u) { return u.id === user.id; });
  var myStories   = purgeExpiredStories((myUser && myUser.stories) ? myUser.stories : (user.stories || []));

  if (myStories.length > 0) {
    myStoryItem.querySelector(".story-ring").classList.replace("new-story", "has-story");
    myStoryItem.onclick = function() { viewUserStory(user.id, user.name); };
  } else {
    myStoryItem.querySelector(".story-ring").classList.replace("has-story", "new-story");
    myStoryItem.onclick = openMyStoryUpload;
  }

  // Followed users' stories — only show if they have active (non-expired) stories
  following.forEach(function(fid) {
    var fu = allUsers.find(function(u) { return u.id === fid; });
    if (!fu) return;
    fu.stories = purgeExpiredStories(fu.stories);
    if (!fu.stories || fu.stories.length === 0) return;

    var item = document.createElement("div");
    item.className = "story-item";
    item.innerHTML =
      '<div class="story-ring has-story">' +
        '<div class="story-avatar"><i class="fas fa-user"></i></div>' +
      '</div>' +
      '<span class="story-name">' + esc(fu.name.split(" ")[0]) + '</span>';
    item.onclick = (function(uid, uname) {
      return function() { viewUserStory(uid, uname); };
    })(fid, fu.name);
    scroll.appendChild(item);
  });
}

// ========== VIEW USER STORY ==========
function viewUserStory(userId, userName) {
  var allUsers = getUsers();
  var session  = getSession();

  var fu;
  if (session && session.id === userId) {
    // Own story — merge session with localStorage data
    fu = allUsers.find(function(u) { return u.id === session.id; });
    if (!fu) fu = session;
    fu = Object.assign({}, fu, { stories: fu.stories || session.stories || [] });
  } else {
    fu = allUsers.find(function(u) { return u.id === userId; });
  }

  // Purge expired stories before viewing
  fu.stories = purgeExpiredStories(fu.stories);

  if (!fu || !fu.stories || fu.stories.length === 0) {
    if (session && session.id === userId) openMyStoryUpload();
    return;
  }

  currentStories = [{ userId: userId, userName: userName, stories: fu.stories }];
  _curStoryIdx   = 0;
  renderStory(0);
  document.getElementById("storyModal").style.display = "flex";
}

function renderStory(storyIdx) {
  var entry = currentStories[0];
  if (!entry) return;
  var story = entry.stories[storyIdx];
  if (!story) return;

  document.getElementById("storyModalName").textContent = entry.userName;

  var typeIcon = story.type === "selling" ? "\uD83C\uDFF7\uFE0F Selling" : "\uD83D\uDECD\uFE0F Buying";

  // Calculate time remaining on story (24h expiry)
  var timeLeft  = "";
  var session   = getSession();
  if (story.expiresAt) {
    var msLeft   = story.expiresAt - Date.now();
    var hoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
    var minsLeft  = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60)));
    timeLeft = hoursLeft > 0
      ? hoursLeft + "h " + minsLeft + "m remaining"
      : minsLeft + "m remaining";
  }

  // Delete button — only shown on your own stories
  var isMyStory  = session && session.id === entry.userId;
  var deleteBtn  = isMyStory
    ? '<button class="story-delete-btn" onclick="deleteMyStory(' + storyIdx + ')">' +
        '<i class="fas fa-trash-alt"></i> Delete Story' +
      '</button>'
    : "";

  var body = document.getElementById("storyModalBody");
  body.innerHTML =
    '<div class="story-card ' + (story.type || "selling") + '-card">' +
      '<div class="story-type-label">' + typeIcon + '</div>' +
      '<div class="story-device-name"><i class="fas fa-mobile-alt"></i> ' + esc(story.device || "Device") + '</div>' +
      '<div class="story-price">' + esc(story.price || "") + '</div>' +
      '<div class="story-text">' + esc(story.text || "") + '</div>' +
      '<div class="story-date"><i class="far fa-clock"></i> ' + esc(story.date || "") + '</div>' +
      (timeLeft ? '<div class="story-expiry"><i class="fas fa-hourglass-half"></i> ' + timeLeft + '</div>' : "") +
      deleteBtn +
    '</div>';

  // Progress bar — auto-advance after 5 seconds
  clearTimeout(storyTimer);
  var fill = document.getElementById("storyProgressFill");
  fill.style.transition = "none";
  fill.style.width      = "0%";
  setTimeout(function() {
    fill.style.transition = "width 5s linear";
    fill.style.width      = "100%";
  }, 30);
  storyTimer = setTimeout(function() { nextStory(); }, 5100);

  // Show/hide nav buttons
  var total = entry.stories.length;
  document.getElementById("storyPrevBtn").style.visibility = storyIdx > 0 ? "visible" : "hidden";
  document.getElementById("storyNextBtn").style.visibility = storyIdx < total - 1 ? "visible" : "hidden";
}

// ========== DELETE MY STORY ==========
function deleteMyStory(storyIdx) {
  if (!confirm("Delete this story? It cannot be undone.")) return;

  var session = getSession();
  if (!session) return;

  var stories = session.stories || [];
  stories.splice(storyIdx, 1);
  session.stories = stories;
  saveSession(session);

  // Persist in users array
  var users = getUsers();
  var myIdx = users.findIndex(function(u) { return u.id === session.id; });
  if (myIdx !== -1) { users[myIdx].stories = stories; saveUsers(users); }

  // Close modal and refresh stories bar
  closeStoryModal();
  loadStories(session);
}

function nextStory() {
  var entry = currentStories[0];
  if (!entry) { closeStoryModal(); return; }
  _curStoryIdx++;
  if (_curStoryIdx >= entry.stories.length) {
    closeStoryModal();
  } else {
    renderStory(_curStoryIdx);
  }
}

function prevStory() {
  _curStoryIdx = Math.max(0, _curStoryIdx - 1);
  renderStory(_curStoryIdx);
}

function closeStoryModal(e) {
  if (e && e.target !== document.getElementById("storyModal")) return;
  clearTimeout(storyTimer);
  _curStoryIdx = 0;
  document.getElementById("storyModal").style.display = "none";
}

// ========== POST STORY ==========
function openMyStoryUpload() {
  document.getElementById("storyUploadModal").style.display = "flex";
  document.getElementById("storyText").focus();
}

function closeUploadModal(e) {
  if (e && e.target !== document.getElementById("storyUploadModal")) return;
  document.getElementById("storyUploadModal").style.display = "none";
}

function showUploadMsg(text, type) {
  var m = document.getElementById("storyUploadMsg");
  m.textContent   = text;
  m.className     = "story-upload-msg " + type;
  m.style.display = "block";
}

function postStory() {
  var text   = document.getElementById("storyText").value.trim();
  var device = document.getElementById("storyDevice").value.trim();
  var price  = document.getElementById("storyPrice").value.trim();
  var type   = document.querySelector('input[name="storyType"]:checked').value;

  if (!device) {
    showUploadMsg("Please enter the device name.", "error");
    return;
  }

  // expiresAt is 24 hours from now — stories auto-expire after one day
  var story = {
    text:      text,
    device:    device,
    price:     price,
    type:      type,
    date:      new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }),
    postedAt:  Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
  };

  var session = getSession();
  var stories = session.stories || [];
  // Keep last 5 stories max
  if (stories.length >= 5) stories = stories.slice(-4);
  stories.push(story);
  session.stories = stories;
  saveSession(session);

  // Persist in users array
  var users = getUsers();
  var myIdx = users.findIndex(function(u) { return u.id === session.id; });
  if (myIdx !== -1) {
    users[myIdx].stories = stories;
    saveUsers(users);
  }

  showUploadMsg("Story posted!", "success");
  setTimeout(function() {
    document.getElementById("storyUploadModal").style.display = "none";
    document.getElementById("storyText").value                = "";
    document.getElementById("storyDevice").value              = "";
    document.getElementById("storyPrice").value               = "";
    document.getElementById("storyUploadMsg").style.display   = "none";
    loadStories(session);
  }, 1000);
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function () {
  loadProfile();
});
