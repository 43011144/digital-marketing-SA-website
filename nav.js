// ========== SHARED NAV SCRIPT ==========
// Handles: cart badge count, dynamic nav profile/login link

function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("dmsa_cart") || "[]"); } catch (e) { return []; }
}

function updateCartBadge() {
  var badge = document.getElementById("cartCountBadge");
  if (!badge) return;
  var count = getCart().length;
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = "inline-flex";
  } else {
    badge.style.display = "none";
  }
}

function updateNavLinks() {
  var session = getSession();
  // Replace Login link with Profile if logged in
  var loginLinks = document.querySelectorAll('a[href="login.html"]');
  loginLinks.forEach(function(link) {
    if (session) {
      link.href = "profile.html";
      link.textContent = session.name.split(" ")[0]; // first name
      link.innerHTML = '<i class="fas fa-user-circle"></i> ' + session.name.split(" ")[0];
      if (link.classList.contains("active")) link.classList.remove("active");
      if (window.location.href.indexOf("profile.html") !== -1) link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  updateCartBadge();
  updateNavLinks();
  // Re-check badge whenever storage changes (cart updated in another tab or in same page)
  window.addEventListener("storage", updateCartBadge);
});
