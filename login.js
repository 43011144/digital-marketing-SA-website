// ========== LOGIN PAGE SCRIPT ==========

// ========== TAB SWITCHING ==========
function switchTab(tab) {
  var loginTab = document.getElementById("loginTab");
  var regTab   = document.getElementById("registerTab");
  var loginBtn = document.getElementById("loginTabBtn");
  var regBtn   = document.getElementById("registerTabBtn");

  if (tab === "login") {
    loginTab.style.display = "block";
    regTab.style.display   = "none";
    loginBtn.classList.add("active");
    regBtn.classList.remove("active");
  } else {
    loginTab.style.display = "none";
    regTab.style.display   = "block";
    regBtn.classList.add("active");
    loginBtn.classList.remove("active");
  }
}

function showMessage(id, text, type) {
  var msg = document.getElementById(id);
  msg.textContent   = text;
  msg.className     = "auth-message " + type;
  msg.style.display = "block";
  msg.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setSession(user) {
  localStorage.setItem("dmsa_session", JSON.stringify({
    id:         user.id,
    name:       user.name,
    email:      user.email,
    phone:      user.phone,
    role:       user.role,
    activeMode: user.activeMode || "buyer",
    bio:        user.bio || "",
    following:  user.following  || [],
    stories:    user.stories    || []
  }));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem("dmsa_session") || "null"); } catch (e) { return null; }
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem("dmsa_users") || "[]"); } catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem("dmsa_users", JSON.stringify(users));
}

function submitLogin() {
  var email    = document.getElementById("loginEmail").value.trim();
  var password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    showMessage("loginMessage", "Please fill in all fields.", "error");
    return;
  }

  var btn = document.querySelector("#loginTab .auth-submit-btn");
  btn.disabled    = true;
  btn.textContent = "Logging in...";

  fetch("auth.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "login", email: email, password: password })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        setSession(data.user);
        showMessage("loginMessage", "Login successful! Redirecting...", "success");
        setTimeout(function () {
          var redirect = sessionStorage.getItem("dmsa_redirect") || "profile.html";
          sessionStorage.removeItem("dmsa_redirect");
          window.location.href = redirect;
        }, 800);
      } else {
        showMessage("loginMessage", data.message || "Invalid email or password.", "error");
      }
    })
    .catch(function () {
      var users = getUsers();
      var user  = users.find(function (u) { return u.email === email && u.password === password; });
      if (user) {
        setSession(user);
        showMessage("loginMessage", "Login successful! Redirecting...", "success");
        setTimeout(function () {
          var redirect = sessionStorage.getItem("dmsa_redirect") || "profile.html";
          sessionStorage.removeItem("dmsa_redirect");
          window.location.href = redirect;
        }, 800);
      } else {
        showMessage("loginMessage", "Invalid email or password.", "error");
      }
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    });
}

function submitRegister() {
  var name     = document.getElementById("regName").value.trim();
  var email    = document.getElementById("regEmail").value.trim();
  var phone    = document.getElementById("regPhone").value.trim();
  var password = document.getElementById("regPassword").value.trim();
  var bio      = document.getElementById("regBio").value.trim();

  if (!name || !email || !phone || !password) {
    showMessage("registerMessage", "Please fill in all required fields.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("registerMessage", "Password must be at least 6 characters.", "error");
    return;
  }

  var btn = document.querySelector("#registerTab .auth-submit-btn");
  btn.disabled    = true;
  btn.textContent = "Creating account...";

  // All new accounts are unified (role = "both"), defaulting to buyer mode
  var role = "both";

  fetch("auth.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "register", name: name, email: email, phone: phone, password: password, role: role, bio: bio })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        var u = data.user;
        u.activeMode = "buyer";
        u.following  = [];
        u.stories    = [];
        setSession(u);
        showMessage("registerMessage", "Account created! Redirecting to your profile...", "success");
        setTimeout(function () { window.location.href = "profile.html"; }, 900);
      } else {
        showMessage("registerMessage", data.message || "Registration failed.", "error");
      }
    })
    .catch(function () {
      var users = getUsers();
      if (users.find(function (u) { return u.email === email; })) {
        showMessage("registerMessage", "An account with this email already exists.", "error");
        btn.disabled  = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        return;
      }
      var newUser = {
        id:         Date.now(),
        name:       name,
        email:      email,
        phone:      phone,
        password:   password,
        role:       role,
        activeMode: "buyer",
        bio:        bio,
        blocked:    [],
        following:  [],
        stories:    []
      };
      users.push(newUser);
      saveUsers(users);
      setSession(newUser);
      showMessage("registerMessage", "Account created! Redirecting to your profile...", "success");
      setTimeout(function () { window.location.href = "profile.html"; }, 900);
    })
    .finally(function () {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    });
}

document.addEventListener("DOMContentLoaded", function () {
  if (getSession()) {
    window.location.href = "profile.html";
  }
});
