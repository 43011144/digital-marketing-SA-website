<?php
// ========== SHOP PAGE ==========
// The sell form submits via AJAX to sell_device.php (see shop.js submitDevice).
// This page only serves the HTML — no form POST processing needed here.
?>
<!doctype html>

<html lang="en" data-bs-theme="light">
  <head>
    <title>DigitalMarketingSA - Shop</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Bootstrap 5 CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <!-- Font Awesome 6 (Free) -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    />
    <link rel="shortcut icon" href="images/Logo2.png" type="image/x-icon" />
    <link rel="stylesheet" href="index.css" />
    <link rel="stylesheet" href="shop.css" />
  </head>

  <body>
    <header id="header">
      <a href="index.html" class="logo-link">
        <img src="images/Logo.png" class="logo" alt="DigitalMarketingSA" />
      </a>
      <!--Navigation bar-->
      <nav class="navigation">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a class="active" href="shop.php">Shop</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="order.html">Order</a></li>
          <li><a href="login.html">Login</a></li>
          <li><a href="cart.html">Cart 🛒</a></li>
        </ul>
      </nav>
    </header>

    <main>

      <!-- Shop Hero Banner -->
      <section id="shop-hero">
        <h1>🛒 DigitalMarketingSA Shop</h1>
        <p>Buy affordable second-hand electronics or list yours for sale</p>
      </section>

      <!-- Buy / Sell Tab Switcher -->
      <section id="shop-tabs">
        <div class="tab-switcher">
          <button class="tab-btn active" id="buyTabBtn" onclick="switchTab('buy')">
            <i class="fas fa-shopping-bag"></i> Buy Electronics
          </button>
          <button class="tab-btn" id="sellTabBtn" onclick="switchTab('sell')">
            <i class="fas fa-tag"></i> Sell Your Device
          </button>
        </div>
      </section>

      <!-- ===== BUY TAB ===== -->
      <section id="buyTab" class="shop-tab-content">

        <!-- Filter Bar -->
        <div class="shop-filter-bar">
          <input
            type="text"
            id="searchInput"
            placeholder="Search products..."
            oninput="filterProducts()"
          />
          <select id="categoryFilter" onchange="filterProducts()">
            <option value="all">All Categories</option>
            <option value="audio">Audio</option>
            <option value="phone">Phones</option>
            <option value="computer">Computers</option>
            <option value="accessory">Accessories</option>
          </select>
          <select id="sortFilter" onchange="filterProducts()">
            <option value="default">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <!-- Product Grid (static products + user-listed products added by shop.js) -->
        <div class="electronic-container" id="productGrid">

          <!--headphones-->
          <div class="electronicBox" data-name="headphones" data-category="audio" data-price="400.99">
            <div class="description">
              <img src="images/products/headphones.png" alt="headphones" />
              <span>Headphones</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R400.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--earpods-->
          <div class="electronicBox" data-name="earpods" data-category="audio" data-price="250.99">
            <div class="description">
              <img src="images/products/earpods.png" alt="earpods" />
              <span>Earpods</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R250.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--Laptop-->
          <div class="electronicBox" data-name="laptop" data-category="computer" data-price="3000.99">
            <div class="description">
              <img src="images/products/laptop.png" alt="laptop" />
              <span>Laptop</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R3 000.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--iphone 15-->
          <div class="electronicBox" data-name="iphone 15 pro max" data-category="phone" data-price="14000.99">
            <div class="description">
              <img src="images/products/iphone 15 pro max.jpg" alt="iphone" />
              <span>iPhone 15 Pro-Max</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R14 000.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--Desktop PC-->
          <div class="electronicBox" data-name="desktop pc" data-category="computer" data-price="5500.99">
            <div class="description">
              <img src="images/products/desktop.jpg" alt="desktop" />
              <span>Desktop PC</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R5 500.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--wifi router-->
          <div class="electronicBox" data-name="wifi router" data-category="accessory" data-price="1500.99">
            <div class="description">
              <img src="images/products/wifi router.jpg" alt="wifi router" />
              <span>WiFi Router</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R1 500.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--smart watch-->
          <div class="electronicBox" data-name="smart watch" data-category="accessory" data-price="699.99">
            <div class="description">
              <img src="images/products/smartwatch.jpg" alt="smartwatch" />
              <span>Smart Watch</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R699.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

          <!--Speaker-->
          <div class="electronicBox" data-name="speaker" data-category="audio" data-price="1000.99">
            <div class="description">
              <img src="images/products/speaker.webp" alt="speaker" />
              <span>Speaker</span>
              <h5>South African Electronics</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>R1 000.99</h4>
              <a href="cart.html"><i class="fas fa-shopping-cart"></i></a>
            </div>
          </div>

        </div>

        <!-- No results message -->
        <p id="noResults" style="display:none; text-align:center; padding:30px; color:#1a2c3e; font-weight:600;">
          No products found. Try a different search or filter.
        </p>

      </section>

      <!-- ===== SELL TAB ===== -->
      <section id="sellTab" class="shop-tab-content" style="display:none;">

        <div class="sell-intro">
          <h2>📦 List Your Device for Sale</h2>
          <p>Fill in the details below. Once submitted, your device will appear on the Buy page for others to purchase.</p>
        </div>

        <!-- Sell Form — submitted via AJAX to sell_device.php -->
        <div class="sell-form-wrapper">
          <div class="sell-form-card">

            <div class="form-group">
              <label for="deviceName">Device Name <span class="required">*</span></label>
              <input type="text" id="deviceName" placeholder="e.g. Samsung Galaxy S21" />
            </div>

            <div class="form-group">
              <label for="deviceCategory">Category <span class="required">*</span></label>
              <select id="deviceCategory">
                <option value="">-- Select Category --</option>
                <option value="audio">Audio</option>
                <option value="phone">Phones</option>
                <option value="computer">Computers</option>
                <option value="accessory">Accessories</option>
              </select>
            </div>

            <div class="form-group">
              <label for="devicePrice">Asking Price (R) <span class="required">*</span></label>
              <input type="number" id="devicePrice" placeholder="e.g. 1500" min="1" />
            </div>

            <div class="form-group">
              <label for="deviceCondition">Condition <span class="required">*</span></label>
              <select id="deviceCondition">
                <option value="">-- Select Condition --</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div class="form-group">
              <label for="deviceDescription">Description</label>
              <textarea id="deviceDescription" rows="3" placeholder="Describe the device, accessories included, reason for selling..."></textarea>
            </div>

            <!-- Image Upload Field -->
            <div class="form-group">
              <label>Device Image <span class="image-hint">(optional — JPG, PNG, WEBP, max 5MB)</span></label>
              <div class="image-upload-area" id="imageUploadArea">

                <!-- Hidden file input — triggered by the label below -->
                <input type="file" id="deviceImage" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="previewImage(this)" />

                <!-- Clickable upload zone — label triggers the file input reliably -->
                <label for="deviceImage" class="image-upload-placeholder" id="imagePlaceholder">
                  <i class="fas fa-camera"></i>
                  <span>Click to upload a photo of your device</span>
                  <small>JPG, PNG or WEBP &bull; Max 5MB</small>
                </label>

                <!-- Preview shown after image is selected -->
                <div class="image-preview-wrapper" id="imagePreviewWrapper" style="display:none;">
                  <img id="imagePreview" src="" alt="Device preview" />
                  <button type="button" class="image-remove-btn" onclick="removeImage()">
                    <i class="fas fa-times"></i> Remove photo
                  </button>
                </div>

              </div>
            </div>

            <div class="form-group">
              <label for="sellerName">Your Name <span class="required">*</span></label>
              <input type="text" id="sellerName" placeholder="Your full name" />
            </div>

            <div class="form-group">
              <label for="sellerContact">Contact Number <span class="required">*</span></label>
              <input type="tel" id="sellerContact" placeholder="e.g. 073 123 4567" />
            </div>

            <!-- Feedback message shown by shop.js after AJAX response -->
            <div id="sellMessage" class="sell-message" style="display:none;"></div>

            <button class="sell-submit-btn" onclick="submitDevice()">
              <i class="fas fa-upload"></i> Submit Device for Sale
            </button>

          </div>
        </div>

        <!-- Seller-listed devices injected here by shop.js after a successful submit -->
        <div id="userListingsSection" style="display:none;">
          <div class="sell-intro" style="margin-top:50px;">
            <h2>🛍️ Devices Listed for Sale</h2>
            <p>These devices have been submitted by sellers and are now available to buy.</p>
          </div>
          <div class="electronic-container" id="userListingsGrid"></div>
        </div>

      </section>

    </main>

    <footer>
      <p>&copy; 2025 DigitalMarketingSA. All rights reserved.</p>
    </footer>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Shop JS -->
    <script src="shop.js"></script>

  </body>
</html>