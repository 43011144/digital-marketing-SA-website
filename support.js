// ========== SUPPORT PAGE CHAT AGENT ==========
// Unified AI: routes questions through ai_agent.php (OpenAI / DeepSeek)
// Falls back to the local knowledge base engine if PHP is not available
// This is the SAME AI as the floating widget on all other pages — one brain, two faces

// ========== REPAIR SHOPS DATABASE - ALL 9 SA PROVINCES ==========
var repairShops = [

  // --- Gauteng ---
  { name: "FixIT Electronics",    area: "Johannesburg", province: "Gauteng",       address: "123 Main Street, Braamfontein, Johannesburg",   phone: "011 123 4567", rating: 4.5, speciality: "phones, laptops" },
  { name: "TechRepair SA",        area: "Pretoria",     province: "Gauteng",       address: "45 Church Street, Pretoria Central, Pretoria",   phone: "012 234 5678", rating: 4.2, speciality: "all devices" },
  { name: "DigiCare Centurion",   area: "Centurion",    province: "Gauteng",       address: "12 Rabie Street, Centurion CBD, Centurion",       phone: "012 345 6789", rating: 4.3, speciality: "laptops, tablets" },
  { name: "GadgetHub Soweto",     area: "Soweto",       province: "Gauteng",       address: "78 Vilakazi Street, Orlando West, Soweto",        phone: "011 456 7890", rating: 4.0, speciality: "phones, screens" },
  { name: "ElectroFix Sandton",   area: "Sandton",      province: "Gauteng",       address: "5 Rivonia Road, Sandton City, Sandton",           phone: "011 567 8901", rating: 4.6, speciality: "premium devices" },
  { name: "TechDoc Midrand",      area: "Midrand",      province: "Gauteng",       address: "34 New Road, Midrand Central",                    phone: "011 678 9012", rating: 4.1, speciality: "desktops, laptops" },

  // --- Western Cape ---
  { name: "GadgetFix Cape Town",  area: "Cape Town",    province: "Western Cape",  address: "78 Long Street, Cape Town City Centre",           phone: "021 345 6789", rating: 4.7, speciality: "all devices" },
  { name: "iRepair Stellenbosch", area: "Stellenbosch", province: "Western Cape",  address: "22 Dorp Street, Stellenbosch CBD",                phone: "021 456 7890", rating: 4.4, speciality: "iPhones, MacBooks" },
  { name: "TechFix George",       area: "George",       province: "Western Cape",  address: "56 York Street, George CBD",                      phone: "044 123 4567", rating: 4.2, speciality: "phones, tablets" },
  { name: "DeviceRepair Paarl",   area: "Paarl",        province: "Western Cape",  address: "89 Main Road, Paarl Central",                     phone: "021 567 8901", rating: 4.0, speciality: "all devices" },
  { name: "SmartFix Worcester",   area: "Worcester",    province: "Western Cape",  address: "12 Church Street, Worcester CBD",                  phone: "023 123 4567", rating: 3.9, speciality: "phones, laptops" },

  // --- KwaZulu-Natal ---
  { name: "ElectroCare Durban",   area: "Durban",       province: "KwaZulu-Natal", address: "12 Florida Road, Morningside, Durban",            phone: "031 456 7890", rating: 4.3, speciality: "all devices" },
  { name: "TechRepair PMB",       area: "Pietermaritzburg", province: "KwaZulu-Natal", address: "45 Commercial Road, PMB CBD",                 phone: "033 123 4567", rating: 4.1, speciality: "phones, screens" },
  { name: "GadgetDoc Richards Bay", area: "Richards Bay", province: "KwaZulu-Natal", address: "78 Mzingazi Road, Richards Bay CBD",           phone: "035 234 5678", rating: 4.0, speciality: "laptops, tablets" },
  { name: "PhoneFix Newcastle",   area: "Newcastle",    province: "KwaZulu-Natal", address: "23 Scott Street, Newcastle CBD",                  phone: "034 345 6789", rating: 3.9, speciality: "phones, batteries" },

  // --- Eastern Cape ---
  { name: "LaptopFix Port Elizabeth", area: "Port Elizabeth", province: "Eastern Cape", address: "89 Main Road, Walmer, Port Elizabeth",      phone: "041 678 9012", rating: 4.4, speciality: "laptops, desktops" },
  { name: "TechCare East London", area: "East London",  province: "Eastern Cape",  address: "34 Oxford Street, East London CBD",               phone: "043 123 4567", rating: 4.2, speciality: "all devices" },
  { name: "GadgetRepair Mthatha", area: "Mthatha",      province: "Eastern Cape",  address: "56 Nelson Mandela Drive, Mthatha CBD",            phone: "047 234 5678", rating: 3.8, speciality: "phones, tablets" },
  { name: "DeviceFix Grahamstown", area: "Grahamstown", province: "Eastern Cape",  address: "12 High Street, Grahamstown CBD",                 phone: "046 345 6789", rating: 4.0, speciality: "phones, laptops" },

  // --- Free State ---
  { name: "PhoneRepair Bloemfontein", area: "Bloemfontein", province: "Free State", address: "56 Zastron Street, Bloemfontein CBD",           phone: "051 567 8901", rating: 4.0, speciality: "phones, tablets" },
  { name: "TechFix Welkom",       area: "Welkom",       province: "Free State",    address: "34 Stateway, Welkom CBD",                         phone: "057 123 4567", rating: 3.9, speciality: "all devices" },
  { name: "GadgetCare Kroonstad", area: "Kroonstad",    province: "Free State",    address: "89 Murray Street, Kroonstad CBD",                 phone: "056 234 5678", rating: 3.8, speciality: "phones, screens" },

  // --- Limpopo ---
  { name: "DeviceDoctor Polokwane", area: "Polokwane",  province: "Limpopo",       address: "34 Landdros Mare Street, Polokwane CBD",          phone: "015 789 0123", rating: 4.1, speciality: "all devices" },
  { name: "TechRepair Tzaneen",   area: "Tzaneen",      province: "Limpopo",       address: "12 Agatha Street, Tzaneen CBD",                   phone: "015 234 5678", rating: 3.9, speciality: "phones, laptops" },
  { name: "GadgetFix Thohoyandou", area: "Thohoyandou", province: "Limpopo",       address: "56 Munzhedzi Road, Thohoyandou CBD",              phone: "015 345 6789", rating: 3.8, speciality: "phones, tablets" },
  { name: "PhoneCare Mokopane",   area: "Mokopane",     province: "Limpopo",       address: "23 Retief Street, Mokopane CBD",                  phone: "015 456 7890", rating: 3.9, speciality: "phones, screens" },

  // --- Mpumalanga ---
  { name: "SmartRepair Nelspruit", area: "Nelspruit",   province: "Mpumalanga",    address: "67 Brown Street, Nelspruit CBD",                  phone: "013 890 1234", rating: 4.3, speciality: "all devices" },
  { name: "TechFix Witbank",      area: "Witbank",      province: "Mpumalanga",    address: "45 Mandela Street, Witbank CBD",                  phone: "013 234 5678", rating: 4.0, speciality: "laptops, desktops" },
  { name: "DeviceCare Secunda",   area: "Secunda",      province: "Mpumalanga",    address: "12 Walter Sisulu Street, Secunda CBD",            phone: "017 345 6789", rating: 3.9, speciality: "phones, tablets" },

  // --- Northern Cape ---
  { name: "TechWiz Kimberley",    area: "Kimberley",    province: "Northern Cape", address: "23 Du Toitspan Road, Kimberley CBD",               phone: "053 901 2345", rating: 4.0, speciality: "all devices" },
  { name: "GadgetRepair Upington", area: "Upington",   province: "Northern Cape", address: "56 Scott Street, Upington CBD",                    phone: "054 123 4567", rating: 3.8, speciality: "phones, tablets" },
  { name: "PhoneFix Springbok",   area: "Springbok",    province: "Northern Cape", address: "34 Voortrekker Street, Springbok CBD",             phone: "027 234 5678", rating: 3.7, speciality: "phones, screens" },

  // --- North West ---
  { name: "GadgetRescue Rustenburg", area: "Rustenburg", province: "North West",  address: "45 Beyers Naude Street, Rustenburg CBD",           phone: "014 012 3456", rating: 4.2, speciality: "all devices" },
  { name: "TechRepair Klerksdorp", area: "Klerksdorp",  province: "North West",   address: "78 Joubert Street, Klerksdorp CBD",                phone: "018 123 4567", rating: 4.0, speciality: "phones, laptops" },
  { name: "DeviceFix Mahikeng",   area: "Mahikeng",     province: "North West",   address: "12 Nelson Mandela Drive, Mahikeng CBD",             phone: "018 234 5678", rating: 3.9, speciality: "phones, tablets" },
  { name: "SmartCare Potchefstroom", area: "Potchefstroom", province: "North West", address: "34 Wolmarans Street, Potchefstroom CBD",         phone: "018 345 6789", rating: 4.1, speciality: "laptops, desktops" },
];

// ========== PROVINCE ALIASES (handles common spelling variations) ==========
var provinceAliases = {
  "gauteng": "Gauteng", "gp": "Gauteng",
  "western cape": "Western Cape", "wc": "Western Cape", "cape": "Western Cape",
  "kwazulu natal": "KwaZulu-Natal", "kwazulu-natal": "KwaZulu-Natal", "kzn": "KwaZulu-Natal", "natal": "KwaZulu-Natal",
  "eastern cape": "Eastern Cape", "ec": "Eastern Cape",
  "free state": "Free State", "fs": "Free State",
  "limpopo": "Limpopo", "lp": "Limpopo",
  "mpumalanga": "Mpumalanga", "mp": "Mpumalanga",
  "northern cape": "Northern Cape", "nc": "Northern Cape",
  "north west": "North West", "nw": "North West", "northwest": "North West",
};

// ========== FLEXIBLE GREETING VARIATIONS ==========
var greetings = [
  "Hello! 👋 How can I help you today?",
  "Hi there! What can I do for you?",
  "Hey! Need any assistance?",
  "Greetings! How may I assist you?",
  "Welcome! What brings you here today?",
];

// ========== FLEXIBLE GOODBYE VARIATIONS ==========
var goodbyes = [
  "You're welcome! Have a great day! 😊",
  "Glad I could help! Take care!",
  "Anytime! Come back if you need anything else.",
  "Happy to help! Have a wonderful day!",
  "See you next time! 👋",
];

// ========== POSITIVE ACKNOWLEDGMENT VARIATIONS ==========
var positiveResponses = [
  "Great! Let me help you with that.",
  "Awesome! Here's what you need to know:",
  "Perfect! I've got that information for you.",
  "Of course! Here you go:",
  "Absolutely! Let me share the details:",
];

// ========== CASUAL CONVERSATION RESPONSES ==========
var casualResponses = {
  thankYou:   ["You're welcome! 😊", "My pleasure!", "Happy to help!", "Anytime!"],
  howAreYou:  ["I'm doing great, thanks for asking! How can I assist you today?", "Doing well! Ready to help you. What do you need?", "I'm good! What brings you here?"],
  name:       ["I'm DigiAssist, your DigitalMarketingSA support agent! 🤖", "I'm the support agent for DigitalMarketingSA. Nice to meet you!"],
  help:       ["I can help you with: Free Shipping, 30 Day Returns, Secure Payments, finding repair shops near you, buying or selling electronics, and anything about DigitalMarketingSA. Just ask!"],
  sorry:      ["No worries at all! How can I help you?", "That's okay! What can I do for you?", "No problem! What do you need help with?"],
  confused:   ["I'm here to help! Could you rephrase that? You can ask me about shipping, returns, payments, repair shops, or our products.", "Let me try to help! Could you be more specific?"],
};

// ========== KNOWLEDGE BASE - RESPONSE TEMPLATES ==========
var knowledgeBase = {
  freeShipping:  "📦 <strong>Free Shipping Policy:</strong><br>Our free shipping applies to all orders over <strong>R500</strong> within South Africa. Delivery takes <strong>3–5 business days</strong>. For orders under R500, a flat rate of <strong>R60</strong> applies. Express shipping is available for an extra <strong>R100</strong>, delivering within <strong>1–2 business days</strong>.",
  returnPolicy:  "🔄 <strong>30 Day Return Policy:</strong><br>You can return any item within <strong>30 days of delivery</strong> if it's in original condition. Return shipping is <strong>free for defective items</strong>. Refunds are processed within <strong>5–7 business days</strong> after inspection.",
  securePayment: "🔒 <strong>Secure Payment:</strong><br>Your payments are <strong>100% secure</strong>. We use industry-standard <strong>SSL encryption</strong>. We accept all major credit cards, instant EFT, and mobile payments. Your payment information is <strong>never stored</strong> on our servers.",
  makePayment:   "💳 To make a payment, click the <strong>Cart 🛒</strong> icon in the navigation bar. You can pay via credit card, instant EFT, or mobile payment. <a href='cart.html' style='color:#7bc9ff;'>Go to Cart →</a>",
  aboutUs:       "🏢 <strong>About DigitalMarketingSA:</strong><br>We are a South African platform providing <strong>affordable second-hand electronics</strong>. We empower both buyers and sellers to trade electronics securely and legally, making quality tech accessible to everyone.",
  trackOrder:    "📋 <strong>Tracking Your Order:</strong><br>Go to the <a href='order.html' style='color:#7bc9ff;'>Order page →</a> from the navigation menu. You'll need your order number which was sent to your email after purchase.",
  warranty:      "🛡️ <strong>Warranty Information:</strong><br>All second-hand electronics come with a <strong>30-day warranty</strong> covering manufacturer defects. If your device develops a fault within 30 days, contact us for a free repair or replacement.",
  contact:       "📞 <strong>Contact Us:</strong><br>You can reach our team via the <a href='contact.html' style='color:#7bc9ff;'>Contact page →</a>. We respond within <strong>24 hours</strong> on weekdays. For urgent issues, use this chat!",
  products:      "🛒 <strong>Our Products:</strong><br>We sell second-hand electronics including: Phones (from R250.99), Laptops (from R3000.99), Desktops (R5500.99), Headphones (R400.99), Smart Watches (R699.99), WiFi Routers (R1500.99), and Speakers (R1000.99). <a href='shop.html' style='color:#7bc9ff;'>Browse the Shop →</a>",
  sellDevice:    "💼 <strong>Sell Your Device:</strong><br>Go to the <a href='shop.html' style='color:#7bc9ff;'>Shop page →</a> and click the <strong>Sell Your Device</strong> tab. Fill in your device details, add a photo, and your listing will be live immediately.",
  repairIntro:   "🔧 I can find repair shops near you! Please tell me your <strong>city, town, or province</strong> (e.g. Johannesburg, Cape Town, KZN, Limpopo) and I'll show you the closest options.",
  repairNotFound:"😔 I couldn't find repair shops for that location. Try using your city name or province such as: Johannesburg, Cape Town, Durban, Pretoria, Bloemfontein, Polokwane, Nelspruit, Kimberley, Rustenburg, or province names like Gauteng, KZN, Limpopo, etc.",
  default:       "🤔 I'm not quite sure about that. I can help you with:<br>• 📦 Free Shipping<br>• 🔄 30 Day Returns<br>• 🔒 Secure Payments<br>• 🔧 Finding Repair Shops<br>• 🛒 Buying &amp; Selling Electronics<br>• 📋 Order Tracking<br>• 🛡️ Warranty Info<br><br>Try rephrasing your question or click a quick button above!",
};

// ========== CONVERSATION STATE ==========
var waitingForLocation = false;
var conversationContext = "";
var userName = "";

// ========== AI CONVERSATION HISTORY ==========
// Shared with the same engine used by ai_agent.js — one brain
var supportHistory = [];

// ========== CURRENTLY SELECTED AI PROVIDER ==========
// Defaults to openai — can be switched by user via the provider selector
var supportProvider = "openai";

// ========== HELPER - GET RANDOM ITEM FROM ARRAY ==========
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========== HELPER - CLEAN AND NORMALIZE TEXT ==========
function normalize(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .replace(/\s+/g, " ");
}

// ========== HELPER - CHECK IF TEXT CONTAINS ANY KEYWORD ==========
function containsAny(text, keywords) {
  for (var i = 0; i < keywords.length; i++) {
    if (text.indexOf(keywords[i]) !== -1) return true;
  }
  return false;
}

// ========== FIND REPAIR SHOPS BY CITY OR PROVINCE ==========
function findRepairShops(location) {
  var loc = normalize(location);
  var matches = [];

  // Check province aliases first
  var matchedProvince = null;
  for (var alias in provinceAliases) {
    if (loc.indexOf(alias) !== -1) {
      matchedProvince = provinceAliases[alias];
      break;
    }
  }

  for (var i = 0; i < repairShops.length; i++) {
    var shop = repairShops[i];
    var areaMatch    = shop.area.toLowerCase().indexOf(loc) !== -1 || loc.indexOf(shop.area.toLowerCase()) !== -1;
    var provinceMatch = matchedProvince && shop.province === matchedProvince;
    if (areaMatch || provinceMatch) matches.push(shop);
  }
  return matches;
}

// ========== FORMAT REPAIR SHOP RESULTS ==========
function formatRepairShops(shops, userLocation) {
  if (shops.length === 0) return knowledgeBase.repairNotFound;
  var result = "🔧 <strong>Repair shops near " + userLocation + ":</strong><br><br>";
  for (var i = 0; i < shops.length; i++) {
    var shop = shops[i];
    result += "<strong>" + (i + 1) + ". " + shop.name + "</strong>";
    result += " ⭐ " + shop.rating + "/5<br>";
    result += "📍 " + shop.address + "<br>";
    result += "📞 " + shop.phone + "<br>";
    result += "🛠️ Speciality: " + shop.speciality + "<br>";
    result += "🏙️ Province: " + shop.province + "<br><br>";
  }
  result += "You can call them directly using the numbers above. Need anything else?";
  return result;
}

// ========== DETECT AND EXTRACT USER NAME ==========
function extractName(text) {
  var lower = normalize(text);
  var patterns = ["my name is ", "i am ", "i'm ", "call me "];
  for (var i = 0; i < patterns.length; i++) {
    var idx = lower.indexOf(patterns[i]);
    if (idx !== -1) {
      var rest = text.substring(idx + patterns[i].length).trim().split(" ")[0];
      if (rest.length > 1) return rest;
    }
  }
  return null;
}

// ========== HANDLE CASUAL CONVERSATION ==========
function handleCasualConversation(question) {
  var lower = normalize(question);

  var detectedName = extractName(question);
  if (detectedName) {
    userName = detectedName;
    return "Nice to meet you, <strong>" + userName + "</strong>! 😊 How can I help you today?";
  }

  if (containsAny(lower, ["hello", "hi ", "hey", "howzit", "hiya", "greetings", "sup ", "good morning", "good afternoon", "good evening"])) {
    var greeting = randomItem(greetings);
    return userName ? greeting.replace("!", ", " + userName + "!") : greeting;
  }
  if (containsAny(lower, ["thank", "thanks", "thx", "dankie", "appreciated"]))  return randomItem(casualResponses.thankYou);
  if (containsAny(lower, ["how are you", "how are u", "how r u", "hows it going", "you okay", "you good"])) return randomItem(casualResponses.howAreYou);
  if (containsAny(lower, ["your name", "who are you", "what are you", "are you a bot", "are you human", "are you ai"])) return randomItem(casualResponses.name);
  if (containsAny(lower, ["what can you do", "help me with", "what do you do", "capabilities", "what can you help"])) return randomItem(casualResponses.help);
  if (containsAny(lower, ["sorry", "apologies", "my bad", "excuse me"])) return randomItem(casualResponses.sorry);
  if (containsAny(lower, ["bye", "goodbye", "see you", "later", "cya", "totsiens", "seeya"])) return randomItem(goodbyes);
  return null;
}

// ========== LOCAL KNOWLEDGE BASE RESPONSE (offline / PHP not available) ==========
function getLocalResponse(question) {
  var lower = normalize(question);

  var casual = handleCasualConversation(question);
  if (casual) { waitingForLocation = false; conversationContext = ""; return casual; }

  if (waitingForLocation) {
    waitingForLocation = false;
    var shops = findRepairShops(question);
    if (shops.length === 0) return knowledgeBase.repairNotFound;
    return formatRepairShops(shops, question.trim());
  }

  if (containsAny(lower, ["repair", "fix", "broken", "not working", "cracked", "screen", "technician", "service centre", "service center", "where can i fix", "find shop", "nearest shop"])) {
    waitingForLocation = true; conversationContext = "repair";
    return knowledgeBase.repairIntro + " You can also <a href='repair.html' style='color:#7bc9ff;'>view all shops on the interactive map →</a>";
  }

  var directLocation = findRepairShops(question);
  if (directLocation.length > 0 && lower.length < 40) {
    return randomItem(positiveResponses) + "<br><br>" + formatRepairShops(directLocation, question.trim());
  }

  if (containsAny(lower, ["shipping", "delivery", "deliver", "ship", "courier", "how long", "when will", "free shipping", "postage"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.freeShipping;
  if (containsAny(lower, ["return", "refund", "30 day", "money back", "give back", "exchange", "swap", "not happy", "unhappy with"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.returnPolicy;
  if (containsAny(lower, ["secure payment", "safe payment", "is it safe", "payment safe", "protected", "ssl", "encryption", "trust"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.securePayment;
  if (containsAny(lower, ["pay", "checkout", "purchase", "make a payment", "how to pay", "payment method", "eft", "credit card"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.makePayment;
  if (containsAny(lower, ["track", "order status", "where is my order", "my order", "order number", "order tracking", "when will it arrive"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.trackOrder;
  if (containsAny(lower, ["warranty", "guarantee", "faulty", "defective", "broken after", "stopped working"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.warranty;
  if (containsAny(lower, ["sell", "list my device", "list a device", "want to sell", "selling my", "i have a device", "sell my phone"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.sellDevice;
  if (containsAny(lower, ["products", "what do you sell", "items", "stock", "available", "electronics", "devices", "shop"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.products;
  if (containsAny(lower, ["contact", "call you", "email", "reach you", "get in touch", "speak to someone", "human agent", "real person"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.contact;
  if (containsAny(lower, ["about", "who are you", "what is digitalmarketingsa", "company", "tell me about", "background", "history"])) return randomItem(positiveResponses) + "<br><br>" + knowledgeBase.aboutUs;

  waitingForLocation = false; conversationContext = "";
  return knowledgeBase.default;
}

// ========== ADD A MESSAGE TO THE CHAT ==========
function addMessage(sender, text) {
  var chatMessages = document.getElementById("chatMessages");
  var messageDiv   = document.createElement("div");
  messageDiv.className = "message " + sender;

  if (sender === "agent") {
    // Agent messages include the robot avatar on the left
    messageDiv.innerHTML =
      '<div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>' +
      '<div class="message-bubble">' + text + '</div>';
  } else {
    // User messages align to the right, no avatar
    messageDiv.innerHTML = '<div class="message-bubble">' + text + '</div>';
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========== SHOW TYPING INDICATOR ==========
function showTyping() {
  var chatMessages = document.getElementById("chatMessages");
  var loadingDiv   = document.createElement("div");
  loadingDiv.className = "message agent";
  loadingDiv.id        = "loadingMessage";
  loadingDiv.innerHTML =
    '<div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>' +
    '<div class="message-bubble typing-dots"><span></span><span></span><span></span></div>';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  var el = document.getElementById("loadingMessage");
  if (el) el.remove();
}

// ========== UPDATE PROVIDER LABEL ==========
function updateProviderLabel() {
  var label = document.getElementById("supportProviderLabel");
  if (label) label.textContent = supportProvider === "openai" ? "OpenAI • 24/7" : "DeepSeek • 24/7";
}

// ========== SEND A MESSAGE ==========
// Tries ai_agent.php (OpenAI/DeepSeek) first — falls back to local engine if PHP unavailable
function sendMessage() {
  var input    = document.getElementById("chatInput");
  var question = input.value.trim();
  if (!question) return;

  addMessage("user", question);
  input.value = "";

  // Add to history before sending
  supportHistory.push({ role: "user", content: question });

  showTyping();

  var sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.disabled = true;

  // ===== CALL ai_agent.php — same endpoint the floating widget uses =====
  fetch("ai_agent.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      provider: supportProvider,
      message:  question,
      history:  supportHistory.slice(0, -1) // send prior turns, not current
    })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      removeTyping();
      var reply;
      if (data.success) {
        // Format line breaks from AI response
        reply = data.reply.replace(/\n/g, "<br>");
        supportHistory.push({ role: "assistant", content: data.reply });
        // Keep history at 20 entries max to save tokens
        if (supportHistory.length > 20) supportHistory = supportHistory.slice(-20);
      } else {
        // AI API error — fall back to local engine silently
        reply = getLocalResponse(question);
        supportHistory.push({ role: "assistant", content: reply });
      }
      addMessage("agent", reply);
      // Offer cart link for payment questions
      if (containsAny(normalize(question), ["pay", "checkout", "payment", "cart"])) {
        setTimeout(function () {
          addMessage("agent", '<a href="cart.html" style="color:#7bc9ff;">Click here to go to Cart 🛒</a>');
        }, 700);
      }
    })
    .catch(function () {
      // PHP not available (Live Server) — use local knowledge base engine
      removeTyping();
      var localReply = getLocalResponse(question);
      supportHistory.push({ role: "assistant", content: localReply });
      addMessage("agent", localReply);
      if (containsAny(normalize(question), ["pay", "checkout", "payment", "cart"])) {
        setTimeout(function () {
          addMessage("agent", '<a href="cart.html" style="color:#7bc9ff;">Click here to go to Cart 🛒</a>');
        }, 700);
      }
    })
    .finally(function () {
      if (sendBtn) sendBtn.disabled = false;
    });
}

// ========== SETUP QUICK BUTTONS ==========
function setupQuickButtons() {
  var buttons = document.querySelectorAll(".quick-btn, .info-card");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      var question = this.getAttribute("data-question");
      if (question) {
        document.getElementById("chatInput").value = question;
        sendMessage();
      }
    });
  }
}

// ========== ADD REPAIR QUICK BUTTON DYNAMICALLY ==========
function addRepairButton() {
  var quickButtonsDiv = document.getElementById("quickButtons");
  if (!quickButtonsDiv) return;
  // Avoid duplicates
  var existing = quickButtonsDiv.querySelector("[data-question='I need a repair shop']");
  if (existing) return;

  var repairBtn = document.createElement("button");
  repairBtn.className = "quick-btn";
  repairBtn.setAttribute("data-question", "I need a repair shop");
  repairBtn.innerHTML = "🔧 Find Repair Shop";
  repairBtn.addEventListener("click", function () {
    document.getElementById("chatInput").value = this.getAttribute("data-question");
    sendMessage();
  });
  quickButtonsDiv.appendChild(repairBtn);
}

// ========== HANDLE ENTER KEY ==========
function setupEnterKey() {
  var input = document.getElementById("chatInput");
  if (input) {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") sendMessage();
    });
  }
}

// ========== TOGGLE SIDEBAR EMAIL PANEL ==========
function toggleSidebarEmailPanel() {
  var panel = document.getElementById("emailSetupPanel");
  if (!panel) return;
  panel.style.display = panel.style.display === "none" ? "block" : "none";
  if (panel.style.display === "block") {
    if (typeof prefillSetupPanel === "function") prefillSetupPanel();
  }
}

// ========== UPDATE EMAIL SETUP STATUS LABEL ==========
function updateEmailSetupStatus() {
  var label = document.getElementById("emailSetupStatus");
  if (!label) return;
  if (typeof emailJSConfigured === "function" && emailJSConfigured()) {
    label.textContent = "✅ Configured";
    label.style.color = "#28a745";
  } else {
    label.textContent = "Not configured";
    label.style.color = "#dc3545";
  }
}

// ========== CLEAR CHAT ==========
function clearSupportChat() {
  supportHistory = [];
  waitingForLocation = false;
  conversationContext = "";
  var chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML =
    '<div class="message agent">' +
      '<div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>' +
      '<div class="message-bubble">Chat cleared! How can I help you? 😊</div>' +
    '</div>';
}

// ========== VOICE RECOGNITION ==========
// Uses the Web Speech API — works in Chrome and Edge on desktop and Android
// Safari has limited support; Firefox requires a flag
var recognition   = null;
var isListening   = false;

function initVoice() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Browser does not support voice — hide the button gracefully
    var btn = document.getElementById("voiceBtn");
    if (btn) { btn.title = "Voice not supported in this browser. Try Chrome."; btn.style.opacity = "0.4"; }
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.lang        = "en-ZA"; // South African English
  recognition.continuous  = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // ===== WHEN SPEECH IS DETECTED =====
  recognition.onresult = function (event) {
    var transcript = event.results[0][0].transcript;
    document.getElementById("chatInput").value = transcript;
    stopListening();
    // Auto-send after a short delay so user can see what was captured
    setTimeout(function () { sendMessage(); }, 400);
  };

  recognition.onerror = function (event) {
    stopListening();
    // Common errors: no-speech, not-allowed (mic permission denied)
    if (event.error === "not-allowed") {
      addMessage("agent", "⚠️ Microphone access was denied. Please allow microphone permission in your browser settings and try again.");
    } else if (event.error === "no-speech") {
      addMessage("agent", "I didn't hear anything. Please try again!");
    }
  };

  recognition.onend = function () { stopListening(); };
  return true;
}

function toggleVoice() {
  if (isListening) {
    // Stop listening
    if (recognition) recognition.stop();
    stopListening();
  } else {
    // Start listening
    if (!recognition && !initVoice()) return;
    try {
      recognition.start();
      startListening();
    } catch (e) {
      // Already started — ignore
    }
  }
}

function startListening() {
  isListening = true;
  var btn    = document.getElementById("voiceBtn");
  var icon   = document.getElementById("voiceIcon");
  var status = document.getElementById("voiceStatus");

  if (btn)    btn.classList.add("listening");
  if (icon)   { icon.className = "fas fa-microphone-slash"; }
  if (status) { status.style.display = "flex"; }
}

function stopListening() {
  isListening = false;
  var btn    = document.getElementById("voiceBtn");
  var icon   = document.getElementById("voiceIcon");
  var status = document.getElementById("voiceStatus");

  if (btn)    btn.classList.remove("listening");
  if (icon)   { icon.className = "fas fa-microphone"; }
  if (status) { status.style.display = "none"; }
}

// ========== SIDEBAR CARD CLICKS ==========
function setupSidebarCards() {
  var cards = document.querySelectorAll(".sidebar-card");
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", function () {
      var question = this.getAttribute("data-question");
      if (question) {
        document.getElementById("chatInput").value = question;
        sendMessage();
      }
    });
  }
}

// ========== INITIALIZE THE PAGE ==========
document.addEventListener("DOMContentLoaded", function () {
  setupQuickButtons();
  setupEnterKey();
  addRepairButton();

  // Wire send button
  var sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.addEventListener("click", sendMessage);

  // Set initial provider label
  updateProviderLabel();

  // Wire provider switcher
  var providerSelect = document.getElementById("supportProvider");
  if (providerSelect) {
    providerSelect.addEventListener("change", function () {
      supportProvider = this.value;
      updateProviderLabel();
    });
  }

  // Setup sidebar topic cards
  setupSidebarCards();

  // Initialise voice recognition if browser supports it
  initVoice();

  // Update the email setup status badge in the sidebar
  updateEmailSetupStatus();
});
