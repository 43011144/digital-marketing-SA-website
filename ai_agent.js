// ========== AI AGENT WIDGET SCRIPT ==========
// Floating chat bubble powered by OpenAI (primary) or DeepSeek (alternative)
// The AI knows all about DigitalMarketingSA from the system prompt in ai_agent.php
// OpenAI replaces the 24/7 support page — always available on every page

(function () {

  // ========== CONVERSATION HISTORY ==========
  // Stored in memory — kept to last 10 turns to save API tokens
  var history = [];

  // ========== CURRENTLY SELECTED AI PROVIDER ==========
  var provider = "openai"; // openai (default / 24-7 support) or deepseek

  // ========== CREATE WIDGET HTML ==========
  function createWidget() {
    var widget = document.createElement("div");
    widget.id  = "aiWidget";
    widget.innerHTML =

      // Floating toggle button — replaces 24/7 support icon
      '<button id="aiToggleBtn" onclick="toggleAiChat()" title="24/7 AI Support — Ask me anything!">' +
        '<i class="fas fa-robot"></i>' +
        '<span id="aiOnlineDot"></span>' +
      '</button>' +

      // Chat panel
      '<div id="aiChatPanel" style="display:none;">' +

        // Header
        '<div id="aiChatHeader">' +
          '<div class="ai-header-left">' +
            '<i class="fas fa-robot"></i>' +
            '<div>' +
              '<strong>DMSA Assistant</strong>' +
              '<small id="aiProviderLabel">OpenAI &bull; 24/7 Support</small>' +
            '</div>' +
          '</div>' +
          '<div class="ai-header-right">' +
            // Provider switcher — switch between OpenAI and DeepSeek
            '<select id="aiProvider" onchange="switchProvider(this.value)" title="Switch AI provider">' +
              '<option value="openai">OpenAI</option>' +
              '<option value="deepseek">DeepSeek</option>' +
            '</select>' +
            '<button onclick="clearChat()" class="ai-clear-btn" title="Clear chat"><i class="fas fa-redo"></i></button>' +
            '<button onclick="toggleAiChat()" class="ai-close-btn" title="Close"><i class="fas fa-times"></i></button>' +
          '</div>' +
        '</div>' +

        // Messages area
        '<div id="aiMessages">' +
          '<div class="ai-msg ai-msg-bot">' +
            '<i class="fas fa-robot ai-msg-icon"></i>' +
            '<div class="ai-msg-bubble">Hi! I\'m the DigitalMarketingSA 24/7 assistant. I\'m powered by OpenAI and I know everything about this platform. Ask me about products, how to buy or sell, payment methods, emails, security, or anything else!</div>' +
          '</div>' +
        '</div>' +

        // Input row
        '<div id="aiInputRow">' +
          '<input type="text" id="aiInput" placeholder="Ask me anything..." onkeydown="if(event.key===\'Enter\')sendAiMessage()" />' +
          '<button onclick="sendAiMessage()" id="aiSendBtn" title="Send"><i class="fas fa-paper-plane"></i></button>' +
        '</div>' +

      '</div>';

    document.body.appendChild(widget);
  }

  // ========== TOGGLE CHAT PANEL ==========
  window.toggleAiChat = function () {
    var panel = document.getElementById("aiChatPanel");
    if (panel) {
      panel.style.display = panel.style.display === "none" ? "flex" : "none";
      if (panel.style.display === "flex") {
        document.getElementById("aiInput").focus();
        scrollMessages();
      }
    }
  };

  // ========== SWITCH PROVIDER ==========
  window.switchProvider = function (val) {
    provider = val;
    var label = document.getElementById("aiProviderLabel");
    if (label) {
      label.textContent = val === "openai" ? "OpenAI \u2022 24/7 Support" : "DeepSeek \u2022 24/7 Support";
    }
  };

  // ========== CLEAR CHAT ==========
  window.clearChat = function () {
    history = [];
    var messages = document.getElementById("aiMessages");
    if (messages) {
      messages.innerHTML =
        '<div class="ai-msg ai-msg-bot">' +
          '<i class="fas fa-robot ai-msg-icon"></i>' +
          '<div class="ai-msg-bubble">Chat cleared! How can I help you?</div>' +
        '</div>';
    }
  };

  // ========== SEND MESSAGE ==========
  window.sendAiMessage = function () {
    var input = document.getElementById("aiInput");
    var msg   = input.value.trim();
    if (!msg) return;

    // Append user message to chat
    appendMessage(msg, "user");
    input.value = "";

    // Add to history before sending
    history.push({ role: "user", content: msg });

    // Show typing indicator
    var typingId = appendTyping();

    var sendBtn = document.getElementById("aiSendBtn");
    if (sendBtn) sendBtn.disabled = true;

    // Call ai_agent.php with selected provider and conversation history
    // History is trimmed server-side to last 10 turns to save tokens
    fetch("ai_agent.php", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ provider: provider, message: msg, history: history.slice(0, -1) })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        removeTyping(typingId);
        if (data.success) {
          appendMessage(data.reply, "bot");
          history.push({ role: "assistant", content: data.reply });
          // Keep history at 20 entries max to save tokens
          if (history.length > 20) history = history.slice(-20);
        } else {
          appendMessage("Sorry, I couldn't get a response. " + (data.message || "Check your API key in ai_agent.php."), "bot");
        }
      })
      .catch(function () {
        removeTyping(typingId);
        appendMessage("I need a PHP server (AMPPS) to connect to OpenAI. I'm available on the live site!", "bot");
      })
      .finally(function () {
        if (sendBtn) sendBtn.disabled = false;
      });
  };

  // ========== APPEND MESSAGE TO CHAT ==========
  function appendMessage(text, role) {
    var messages = document.getElementById("aiMessages");
    if (!messages) return;

    var row = document.createElement("div");
    row.className = "ai-msg ai-msg-" + role;

    // Format line breaks in bot responses
    var formatted = escHtml(text).replace(/\n/g, "<br>");

    if (role === "bot") {
      row.innerHTML =
        '<i class="fas fa-robot ai-msg-icon"></i>' +
        '<div class="ai-msg-bubble">' + formatted + '</div>';
    } else {
      row.innerHTML =
        '<div class="ai-msg-bubble">' + formatted + '</div>' +
        '<i class="fas fa-user ai-msg-icon"></i>';
    }

    messages.appendChild(row);
    scrollMessages();
  }

  // ========== SCROLL TO BOTTOM OF MESSAGES ==========
  function scrollMessages() {
    var messages = document.getElementById("aiMessages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  // ========== TYPING INDICATOR ==========
  function appendTyping() {
    var messages = document.getElementById("aiMessages");
    var id       = "typing-" + Date.now();
    var row      = document.createElement("div");
    row.className = "ai-msg ai-msg-bot";
    row.id        = id;
    row.innerHTML =
      '<i class="fas fa-robot ai-msg-icon"></i>' +
      '<div class="ai-msg-bubble ai-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(row);
    scrollMessages();
    return id;
  }

  function removeTyping(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  // ========== HTML ESCAPE HELPER ==========
  function escHtml(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
  }

  // ========== INJECT WIDGET CSS ==========
  function injectStyles() {
    var style = document.createElement("style");
    style.textContent = `
      /* ========== AI WIDGET ========== */
      #aiWidget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      }

      /* ========== TOGGLE BUTTON ========== */
      #aiToggleBtn {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0b2b5c, #1c6ea4);
        color: #fff;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        transition: transform 0.2s ease, background 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      #aiToggleBtn:hover {
        transform: scale(1.08);
        background: linear-gradient(135deg, #66c50e, #1ec2d8);
      }

      /* Online indicator dot */
      #aiOnlineDot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 12px;
        height: 12px;
        background: #28a745;
        border-radius: 50%;
        border: 2px solid #fff;
        animation: aiPulse 2s infinite;
      }

      @keyframes aiPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }

      /* ========== CHAT PANEL ========== */
      #aiChatPanel {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 340px;
        height: 480px;
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        flex-direction: column;
        overflow: hidden;
        animation: aiSlideUp 0.25s ease;
      }

      @keyframes aiSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ========== CHAT HEADER ========== */
      #aiChatHeader {
        background: linear-gradient(95deg, #0b2b5c, #1c6ea4);
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }

      .ai-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
      }

      .ai-header-left i      { font-size: 1.4rem; }
      .ai-header-left strong { font-size: 0.95rem; display: block; }
      .ai-header-left small  { font-size: 0.72rem; color: #aad4f5; }

      .ai-header-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #aiProvider {
        background: rgba(255,255,255,0.15);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 20px;
        padding: 3px 8px;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .ai-clear-btn,
      .ai-close-btn {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 0.95rem;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .ai-clear-btn:hover,
      .ai-close-btn:hover { background: rgba(255,255,255,0.18); }

      /* ========== MESSAGES AREA ========== */
      #aiMessages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #f8f9fc;
      }

      .ai-msg {
        display: flex;
        align-items: flex-end;
        gap: 8px;
      }

      .ai-msg-bot  { justify-content: flex-start; }
      .ai-msg-user { justify-content: flex-end; }

      .ai-msg-icon {
        font-size: 1rem;
        color: #1c6ea4;
        flex-shrink: 0;
        margin-bottom: 2px;
      }

      .ai-msg-user .ai-msg-icon { color: #0b2b5c; }

      .ai-msg-bubble {
        max-width: 78%;
        padding: 9px 13px;
        border-radius: 14px;
        font-size: 0.87rem;
        line-height: 1.5;
      }

      .ai-msg-bot  .ai-msg-bubble {
        background: #fff;
        color: #1a2c3e;
        border: 1px solid #dce3ee;
        border-bottom-left-radius: 4px;
      }
      .ai-msg-user .ai-msg-bubble {
        background: linear-gradient(95deg, #0b2b5c, #1c6ea4);
        color: #fff;
        border-bottom-right-radius: 4px;
      }

      /* ========== TYPING INDICATOR ========== */
      .ai-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
      .ai-typing span {
        width: 7px; height: 7px; border-radius: 50%;
        background: #1c6ea4; display: inline-block;
        animation: aiDot 1.2s infinite;
      }
      .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
      .ai-typing span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes aiDot {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40%           { transform: scale(1.2); opacity: 1; }
      }

      /* ========== INPUT ROW ========== */
      #aiInputRow {
        display: flex;
        gap: 8px;
        padding: 10px 12px;
        border-top: 1px solid #dce3ee;
        background: #fff;
        flex-shrink: 0;
      }

      #aiInput {
        flex: 1;
        padding: 8px 14px;
        border: 1px solid #c5d0de;
        border-radius: 30px;
        font-size: 0.88rem;
        outline: none;
        color: #1a2c3e;
      }

      #aiInput:focus { border-color: #1c6ea4; }

      #aiSendBtn {
        background: linear-gradient(95deg, #0b2b5c, #1c6ea4);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #aiSendBtn:hover    { background: linear-gradient(95deg, #66c50e, #1ec2d8); }
      #aiSendBtn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ========== RESPONSIVE ========== */
      @media (max-width: 420px) {
        #aiChatPanel { width: calc(100vw - 32px); right: -8px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ========== INIT ==========
  // On support.html the full-page chat IS the AI — suppress the floating bubble
  document.addEventListener("DOMContentLoaded", function () {
    if (window.__dmsaSuppressWidget) return;
    injectStyles();
    createWidget();
  });

})();
