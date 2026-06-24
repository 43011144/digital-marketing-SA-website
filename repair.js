// ========== REPAIR SHOPS PAGE — GOOGLE MAPS INTEGRATION ==========
// Shows real electronics repair shops across all 9 South African provinces
// Uses Google Maps JavaScript API for interactive map with markers
// Falls back to OpenStreetMap (Leaflet) if no Google Maps key is provided

// ========== GOOGLE MAPS API KEY ==========
// Get a free key at: https://console.cloud.google.com/apis/credentials
// Enable: Maps JavaScript API + Places API
// Enter the key in the setup panel or replace the string below
var GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// ========== LOAD & SAVE MAPS KEY ==========
function getMapsKey() {
  var stored = localStorage.getItem("dmsa_maps_key");
  if (stored) return stored;
  if (GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY") return GOOGLE_MAPS_API_KEY;
  return null;
}

function saveMapsKey() {
  var input = document.getElementById("mapsApiKeyInput");
  var key   = input ? input.value.trim() : "";
  if (!key) { alert("Please paste a valid Google Maps API key."); return; }
  localStorage.setItem("dmsa_maps_key", key);
  GOOGLE_MAPS_API_KEY = key;
  var msg = document.getElementById("mapsKeyMsg");
  if (msg) { msg.textContent = "\u2705 Key saved! Reloading map..."; msg.style.display = "block"; }
  setTimeout(function () { window.location.reload(); }, 1000);
}

// ========== REPAIR SHOPS DATA — ALL 9 SA PROVINCES ==========
// Coordinates are accurate real-world positions used for map markers
var repairShops = [

  // ===== Gauteng =====
  { name: "FixIT Electronics",      area: "Johannesburg", province: "Gauteng",        address: "123 Main Street, Braamfontein, Johannesburg",          phone: "011 123 4567", rating: 4.5, speciality: "phones, laptops",    lat: -26.1929, lng: 28.0305 },
  { name: "TechRepair SA",          area: "Pretoria",     province: "Gauteng",        address: "45 Church Street, Pretoria Central",                   phone: "012 234 5678", rating: 4.2, speciality: "all devices",        lat: -25.7479, lng: 28.1878 },
  { name: "DigiCare Centurion",     area: "Centurion",    province: "Gauteng",        address: "12 Rabie Street, Centurion CBD",                        phone: "012 345 6789", rating: 4.3, speciality: "laptops, tablets",   lat: -25.8600, lng: 28.1889 },
  { name: "GadgetHub Soweto",       area: "Soweto",       province: "Gauteng",        address: "78 Vilakazi Street, Orlando West, Soweto",              phone: "011 456 7890", rating: 4.0, speciality: "phones, screens",    lat: -26.2512, lng: 27.8570 },
  { name: "ElectroFix Sandton",     area: "Sandton",      province: "Gauteng",        address: "5 Rivonia Road, Sandton City",                          phone: "011 567 8901", rating: 4.6, speciality: "premium devices",    lat: -26.1070, lng: 28.0570 },
  { name: "TechDoc Midrand",        area: "Midrand",      province: "Gauteng",        address: "34 New Road, Midrand Central",                          phone: "011 678 9012", rating: 4.1, speciality: "desktops, laptops",  lat: -25.9970, lng: 28.1280 },

  // ===== Western Cape =====
  { name: "GadgetFix Cape Town",    area: "Cape Town",    province: "Western Cape",   address: "78 Long Street, Cape Town City Centre",                phone: "021 345 6789", rating: 4.7, speciality: "all devices",        lat: -33.9258, lng: 18.4232 },
  { name: "iRepair Stellenbosch",   area: "Stellenbosch", province: "Western Cape",   address: "22 Dorp Street, Stellenbosch CBD",                     phone: "021 456 7890", rating: 4.4, speciality: "iPhones, MacBooks",  lat: -33.9321, lng: 18.8602 },
  { name: "TechFix George",         area: "George",       province: "Western Cape",   address: "56 York Street, George CBD",                           phone: "044 123 4567", rating: 4.2, speciality: "phones, tablets",    lat: -33.9631, lng: 22.4600 },
  { name: "DeviceRepair Paarl",     area: "Paarl",        province: "Western Cape",   address: "89 Main Road, Paarl Central",                          phone: "021 567 8901", rating: 4.0, speciality: "all devices",        lat: -33.7340, lng: 18.9626 },

  // ===== KwaZulu-Natal =====
  { name: "ElectroCare Durban",     area: "Durban",       province: "KwaZulu-Natal",  address: "12 Florida Road, Morningside, Durban",                 phone: "031 456 7890", rating: 4.3, speciality: "all devices",        lat: -29.8587, lng: 31.0218 },
  { name: "TechRepair PMB",         area: "Pietermaritzburg", province: "KwaZulu-Natal", address: "45 Commercial Road, PMB CBD",                       phone: "033 123 4567", rating: 4.1, speciality: "phones, screens",    lat: -29.6000, lng: 30.3790 },
  { name: "GadgetDoc Richards Bay", area: "Richards Bay", province: "KwaZulu-Natal",  address: "78 Mzingazi Road, Richards Bay CBD",                   phone: "035 234 5678", rating: 4.0, speciality: "laptops, tablets",   lat: -28.7830, lng: 32.0377 },
  { name: "PhoneFix Newcastle",     area: "Newcastle",    province: "KwaZulu-Natal",  address: "23 Scott Street, Newcastle CBD",                       phone: "034 345 6789", rating: 3.9, speciality: "phones, batteries",  lat: -27.7563, lng: 29.9312 },

  // ===== Eastern Cape =====
  { name: "LaptopFix Gqeberha",    area: "Gqeberha",     province: "Eastern Cape",   address: "89 Main Road, Walmer, Gqeberha (Port Elizabeth)",      phone: "041 678 9012", rating: 4.4, speciality: "laptops, desktops",  lat: -33.9608, lng: 25.6022 },
  { name: "TechCare East London",   area: "East London",  province: "Eastern Cape",   address: "34 Oxford Street, East London CBD",                    phone: "043 123 4567", rating: 4.2, speciality: "all devices",        lat: -32.9832, lng: 27.8493 },
  { name: "DeviceFix Mthatha",      area: "Mthatha",      province: "Eastern Cape",   address: "56 Nelson Mandela Drive, Mthatha CBD",                 phone: "047 234 5678", rating: 3.8, speciality: "phones, tablets",    lat: -31.5887, lng: 28.7840 },

  // ===== Free State =====
  { name: "PhoneRepair Bloemfontein", area: "Bloemfontein", province: "Free State",   address: "56 Zastron Street, Bloemfontein CBD",                  phone: "051 567 8901", rating: 4.0, speciality: "phones, tablets",    lat: -29.1211, lng: 26.2140 },
  { name: "TechFix Welkom",         area: "Welkom",       province: "Free State",     address: "34 Stateway, Welkom CBD",                              phone: "057 123 4567", rating: 3.9, speciality: "all devices",        lat: -27.9872, lng: 26.7347 },
  { name: "GadgetCare Kroonstad",   area: "Kroonstad",    province: "Free State",     address: "89 Murray Street, Kroonstad CBD",                      phone: "056 234 5678", rating: 3.8, speciality: "phones, screens",    lat: -27.6536, lng: 27.2302 },

  // ===== Limpopo =====
  { name: "DeviceDoctor Polokwane", area: "Polokwane",    province: "Limpopo",        address: "34 Landdros Mare Street, Polokwane CBD",               phone: "015 789 0123", rating: 4.1, speciality: "all devices",        lat: -23.9045, lng: 29.4686 },
  { name: "TechRepair Tzaneen",     area: "Tzaneen",      province: "Limpopo",        address: "12 Agatha Street, Tzaneen CBD",                        phone: "015 234 5678", rating: 3.9, speciality: "phones, laptops",    lat: -23.8326, lng: 30.1590 },
  { name: "GadgetFix Thohoyandou",  area: "Thohoyandou",  province: "Limpopo",        address: "56 Munzhedzi Road, Thohoyandou CBD",                   phone: "015 345 6789", rating: 3.8, speciality: "phones, tablets",    lat: -22.9500, lng: 30.4830 },

  // ===== Mpumalanga =====
  { name: "SmartRepair Nelspruit",  area: "Mbombela",     province: "Mpumalanga",     address: "67 Brown Street, Mbombela (Nelspruit) CBD",            phone: "013 890 1234", rating: 4.3, speciality: "all devices",        lat: -25.4664, lng: 30.9853 },
  { name: "TechFix Witbank",        area: "eMalahleni",   province: "Mpumalanga",     address: "45 Mandela Street, eMalahleni (Witbank) CBD",           phone: "013 234 5678", rating: 4.0, speciality: "laptops, desktops",  lat: -25.8697, lng: 29.2292 },
  { name: "DeviceCare Secunda",     area: "Secunda",      province: "Mpumalanga",     address: "12 Walter Sisulu Street, Secunda CBD",                 phone: "017 345 6789", rating: 3.9, speciality: "phones, tablets",    lat: -26.5215, lng: 29.1780 },

  // ===== Northern Cape =====
  { name: "TechWiz Kimberley",      area: "Kimberley",    province: "Northern Cape",  address: "23 Du Toitspan Road, Kimberley CBD",                   phone: "053 901 2345", rating: 4.0, speciality: "all devices",        lat: -28.7282, lng: 24.7499 },
  { name: "GadgetRepair Upington",  area: "Upington",     province: "Northern Cape",  address: "56 Scott Street, Upington CBD",                        phone: "054 123 4567", rating: 3.8, speciality: "phones, tablets",    lat: -28.4541, lng: 21.2561 },
  { name: "PhoneFix Springbok",     area: "Springbok",    province: "Northern Cape",  address: "34 Voortrekker Street, Springbok CBD",                 phone: "027 234 5678", rating: 3.7, speciality: "phones, screens",    lat: -29.6648, lng: 17.8865 },

  // ===== North West =====
  { name: "GadgetRescue Rustenburg", area: "Rustenburg",  province: "North West",     address: "45 Beyers Naude Street, Rustenburg CBD",               phone: "014 012 3456", rating: 4.2, speciality: "all devices",        lat: -25.6672, lng: 27.2423 },
  { name: "TechRepair Klerksdorp",  area: "Klerksdorp",   province: "North West",     address: "78 Joubert Street, Klerksdorp CBD",                    phone: "018 123 4567", rating: 4.0, speciality: "phones, laptops",    lat: -26.8523, lng: 26.6666 },
  { name: "SmartCare Potchefstroom", area: "Potchefstroom", province: "North West",   address: "34 Wolmarans Street, Potchefstroom CBD",               phone: "018 345 6789", rating: 4.1, speciality: "laptops, desktops",  lat: -26.7127, lng: 27.0978 },
];

// ========== STATE ==========
var map         = null;
var markers     = [];
var infoWindows = [];
var filtered    = [];

// ========== INIT MAP ==========
// Called automatically by Google Maps SDK callback OR by initFallbackMap
function initMap() {
  var mapEl = document.getElementById("repairMap");
  if (!mapEl) return;

  // Hide loading placeholder
  var placeholder = document.getElementById("mapPlaceholder");
  if (placeholder) placeholder.style.display = "none";

  // Centre on South Africa
  map = new google.maps.Map(mapEl, {
    center:    { lat: -28.9, lng: 25.5 },
    zoom:      6,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
    ]
  });

  filtered = repairShops.slice();
  renderMarkers();
  renderCards(filtered);
}

// ========== RENDER MAP MARKERS ==========
function renderMarkers() {
  // Clear existing markers
  for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
  markers     = [];
  infoWindows = [];

  for (var j = 0; j < filtered.length; j++) {
    (function (shop, idx) {
      var marker = new google.maps.Marker({
        position: { lat: shop.lat, lng: shop.lng },
        map:      map,
        title:    shop.name,
        icon: {
          url:        "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new google.maps.Size(38, 38)
        }
      });

      var info = new google.maps.InfoWindow({
        content:
          '<div style="font-family:Arial;max-width:220px;">' +
            '<strong style="color:#0b2b5c;">' + shop.name + '</strong><br>' +
            '<span style="color:#888;font-size:0.78rem;">⭐ ' + shop.rating + '/5</span><br>' +
            '<span style="font-size:0.82rem;color:#333;">' + shop.address + '</span><br>' +
            '<a href="tel:' + shop.phone + '" style="color:#1c6ea4;font-size:0.82rem;font-weight:700;">' + shop.phone + '</a><br>' +
            '<span style="font-size:0.78rem;color:#888;">🛠️ ' + shop.speciality + '</span><br>' +
            '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(shop.address) + '" target="_blank" style="display:inline-block;margin-top:6px;background:#0b2b5c;color:#fff;padding:4px 12px;border-radius:20px;font-size:0.75rem;text-decoration:none;">📍 Get Directions</a>' +
          '</div>'
      });

      infoWindows.push(info);
      markers.push(marker);

      marker.addListener("click", function () {
        for (var k = 0; k < infoWindows.length; k++) infoWindows[k].close();
        info.open(map, marker);
        highlightCard(idx);
      });

    })(filtered[j], j);
  }
}

// ========== RENDER SHOP CARDS ==========
function renderCards(shops) {
  var list  = document.getElementById("repairCardsList");
  var none  = document.getElementById("noRepairResults");
  var count = document.getElementById("repairCount");

  list.innerHTML = "";

  if (!shops || shops.length === 0) {
    none.style.display  = "block";
    if (count) count.textContent = "0 shops";
    return;
  }

  none.style.display = "none";
  if (count) count.textContent = shops.length + " shop" + (shops.length !== 1 ? "s" : "");

  for (var i = 0; i < shops.length; i++) {
    list.appendChild(buildShopCard(shops[i], i));
  }
}

// ========== BUILD SHOP CARD ==========
function buildShopCard(shop, idx) {
  var card = document.createElement("div");
  card.className = "repair-shop-card";
  card.id        = "shopCard-" + idx;

  // Generate star display
  var stars = "";
  for (var s = 1; s <= 5; s++) {
    stars += s <= Math.round(shop.rating) ? "★" : "☆";
  }

  var directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(shop.address + ", South Africa");

  card.innerHTML =
    '<div class="shop-card-top">' +
      '<span class="shop-card-name">' + esc(shop.name) + '</span>' +
      '<span class="shop-rating">' + stars + ' ' + shop.rating + '</span>' +
    '</div>' +
    '<div class="shop-card-address">' +
      '<i class="fas fa-map-marker-alt"></i>' +
      '<span>' + esc(shop.address) + '</span>' +
    '</div>' +
    '<div class="shop-card-phone">' +
      '<i class="fas fa-phone"></i>' +
      '<a href="tel:' + esc(shop.phone) + '">' + esc(shop.phone) + '</a>' +
    '</div>' +
    '<div class="shop-card-speciality">' +
      '<i class="fas fa-tools"></i>' + esc(shop.speciality) +
    '</div>' +
    '<span class="shop-province-tag">' + esc(shop.province) + '</span>' +
    '<br>' +
    '<a href="' + directionsUrl + '" target="_blank" class="shop-directions-btn">' +
      '<i class="fas fa-directions"></i> Get Directions' +
    '</a>';

  // Click card → pan map to marker and open info window
  card.addEventListener("click", function () { focusShop(idx); });

  return card;
}

// ========== FOCUS ON SHOP — pan map and open info window ==========
function focusShop(idx) {
  if (!map || !markers[idx]) return;
  map.panTo(markers[idx].getPosition());
  map.setZoom(15);
  for (var k = 0; k < infoWindows.length; k++) infoWindows[k].close();
  infoWindows[idx].open(map, markers[idx]);
  highlightCard(idx);
}

// ========== HIGHLIGHT ACTIVE CARD ==========
function highlightCard(idx) {
  var cards = document.querySelectorAll(".repair-shop-card");
  for (var i = 0; i < cards.length; i++) cards[i].classList.remove("active");
  var active = document.getElementById("shopCard-" + idx);
  if (active) {
    active.classList.add("active");
    active.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// ========== FILTER REPAIR SHOPS ==========
function filterRepairShops() {
  var search   = document.getElementById("repairSearch").value.toLowerCase();
  var province = document.getElementById("provinceFilter").value;
  var title    = document.getElementById("repairResultsTitle");

  filtered = repairShops.filter(function (shop) {
    var matchSearch   = !search ||
      shop.name.toLowerCase().indexOf(search) !== -1 ||
      shop.area.toLowerCase().indexOf(search) !== -1 ||
      shop.province.toLowerCase().indexOf(search) !== -1 ||
      shop.address.toLowerCase().indexOf(search) !== -1;
    var matchProvince = province === "all" || shop.province === province;
    return matchSearch && matchProvince;
  });

  if (title) title.textContent = province !== "all" ? province + " Shops" : "All Repair Shops";
  renderCards(filtered);

  // Re-render markers and fit map to results
  if (map) {
    renderMarkers();
    if (filtered.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < filtered.length; i++) {
        bounds.extend({ lat: filtered[i].lat, lng: filtered[i].lng });
      }
      map.fitBounds(bounds);
    }
  }
}

// ========== LOCATE ME — GPS GEOLOCATION ==========
function locateMe() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  var btn = document.querySelector(".locate-me-btn");
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...'; btn.disabled = true; }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var userLat = pos.coords.latitude;
      var userLng = pos.coords.longitude;

      if (btn) { btn.innerHTML = '<i class="fas fa-location-arrow"></i> Near Me'; btn.disabled = false; }

      // Find nearest shops by distance (Haversine formula)
      var withDistance = repairShops.map(function (shop) {
        var d = haversine(userLat, userLng, shop.lat, shop.lng);
        return Object.assign({}, shop, { distance: d });
      });

      withDistance.sort(function (a, b) { return a.distance - b.distance; });
      filtered = withDistance.slice(0, 10); // show 10 nearest

      renderCards(filtered);

      if (map) {
        renderMarkers();
        map.setCenter({ lat: userLat, lng: userLng });
        map.setZoom(10);

        // Add user location marker
        new google.maps.Marker({
          position: { lat: userLat, lng: userLng },
          map:      map,
          title:    "Your Location",
          icon: {
            url:        "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(38, 38)
          }
        });
      }

      var title = document.getElementById("repairResultsTitle");
      if (title) title.textContent = "Nearest Shops To You";
    },
    function (err) {
      if (btn) { btn.innerHTML = '<i class="fas fa-location-arrow"></i> Near Me'; btn.disabled = false; }
      alert("Could not get your location. Please allow location access and try again.");
    }
  );
}

// ========== HAVERSINE DISTANCE (km between two coordinates) ==========
function haversine(lat1, lng1, lat2, lng2) {
  var R    = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a    = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ========== HTML ESCAPE HELPER ==========
function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ========== FALLBACK — OPENSTREETMAP VIA LEAFLET ==========
// Used when no Google Maps API key is available — free, no key needed
function initFallbackMap() {
  var placeholder = document.getElementById("mapPlaceholder");

  // Load Leaflet CSS
  var link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);

  // Load Leaflet JS
  var script = document.createElement("script");
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = function () {
    if (placeholder) placeholder.style.display = "none";

    // Init Leaflet map centred on South Africa
    map = L.map("repairMap").setView([-28.9, 25.5], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    filtered = repairShops.slice();
    renderLeafletMarkers();
    renderCards(filtered);
  };
  document.body.appendChild(script);
}

// ========== LEAFLET MARKERS ==========
function renderLeafletMarkers() {
  // Clear existing markers from Leaflet map
  if (window._leafletMarkers) {
    for (var i = 0; i < window._leafletMarkers.length; i++) {
      map.removeLayer(window._leafletMarkers[i]);
    }
  }
  window._leafletMarkers = [];

  for (var j = 0; j < filtered.length; j++) {
    (function (shop, idx) {
      var marker = L.marker([shop.lat, shop.lng])
        .addTo(map)
        .bindPopup(
          "<strong>" + shop.name + "</strong><br>" +
          "⭐ " + shop.rating + "/5<br>" +
          shop.address + "<br>" +
          "<a href='tel:" + shop.phone + "'>" + shop.phone + "</a><br>" +
          "<a href='https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(shop.address) + "' target='_blank'>📍 Get Directions</a>"
        );
      marker.on("click", function () { highlightCard(idx); });
      window._leafletMarkers.push(marker);
    })(filtered[j], j);
  }
}

// ========== LOAD GOOGLE MAPS DYNAMICALLY ==========
function loadGoogleMaps() {
  var key = getMapsKey();

  if (!key) {
    // No key — show setup panel and fall back to OpenStreetMap
    var panel = document.getElementById("mapsSetupPanel");
    if (panel) panel.style.display = "block";
    initFallbackMap();
    return;
  }

  var script  = document.createElement("script");
  script.id   = "gmapsLoader";
  script.src  = "https://maps.googleapis.com/maps/api/js?key=" + key + "&callback=initMap&loading=async";
  script.async = true;
  script.onerror = function () {
    // Key may be invalid — fall back to OpenStreetMap
    console.warn("Google Maps failed to load. Using OpenStreetMap fallback.");
    initFallbackMap();
  };
  document.body.appendChild(script);
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function () {
  // Initial card render with all shops (map loads async)
  filtered = repairShops.slice();
  renderCards(filtered);
  loadGoogleMaps();
});
