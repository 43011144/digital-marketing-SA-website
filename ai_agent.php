<?php
// ========== AI AGENT - SUPPORTS OPENAI AND DEEPSEEK WITH DMSA SYSTEM PROMPT ==========
// Uses a detailed system prompt so the AI knows everything about DigitalMarketingSA
// This means the API uses fewer tokens on every conversation turn
// OpenAI replaces the 24/7 support assistant — always available

// Suppress PHP warnings/notices from corrupting JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Allow requests from any origin (fixes localhost fetch issues)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// ========== API KEYS — replace with your real keys ==========
// Get OpenAI key from: https://platform.openai.com/api-keys
// Get DeepSeek key from: https://platform.deepseek.com/api_keys
define("OPENAI_API_KEY",  "YOUR_OPENAI_API_KEY_HERE");
define("DEEPSEEK_API_KEY", "YOUR_DEEPSEEK_API_KEY_HERE");

// ========== DIGITALMARKETINGSA SYSTEM PROMPT ==========
// This prompt is sent once per conversation — the AI remembers everything
// about DMSA so users do not need to explain the context every time.
// This reduces token usage on every subsequent turn.
define("DMSA_SYSTEM_PROMPT", "
You are the official 24/7 AI support assistant for DigitalMarketingSA — a secure South African
e-commerce platform for buying and selling second-hand electronics. You help both buyers and sellers.
You are always available and never sleep. You replace the need for a human 24/7 support agent.

ABOUT DIGITALMARKETINGSA:
- Platform: South African second-hand electronics marketplace (digitalmarketingsa.co.za)
- Mission: Secure, affordable trading of electronics for informal businesses and individuals
- Payment: FNB bank transfer (Account Name: DigitalMarketingSA, Bank: FNB, Acc: 62849301782, Branch: 250655)
- Also accepted: EFT, Capitec, ABSA, Standard Bank, SnapScan
- Delivery: Free on all orders
- Return policy: 30 days easy refund

PRODUCTS SOLD (standard listings):
Headphones R400.99 | Earpods R250.99 | Laptops R3000.99 | iPhone 15 Pro-Max R14000.99
Desktop PCs R5500.99 | WiFi Routers R1500.99 | Smart Watches R699.99 | Speakers R1000.99
Plus user-listed second-hand devices at varying prices shown on the shop page.

USER ACCOUNT TYPES:
- All users have a unified account that can switch between Buyer mode and Seller mode
- Buyer mode: Browse shop, add to cart, place orders, receive email confirmations
- Seller mode: List devices for sale (with photos), add/delete contact listings, manage listings,
  block disruptive buyers, access Admin panel (suspend users, flag listings, view audit log)

HOW ORDERING WORKS:
1. Browse shop.html — add items to cart (cart icon shows item count badge)
2. Must be logged in to place an order
3. Go to cart.html — review items, adjust quantities, click 'Place Order & Pay'
4. Get a unique order number (e.g. DMSA-20260502-X4B2A)
5. Order confirmation email is sent to your registered email address automatically
6. Use the order number as payment reference in your banking app
7. Click 'I Have Paid' on the cart confirmation screen — a second payment confirmation email is sent
8. View all your orders on order.html — item count shown on each order card

SELLER FEATURES:
- List devices on shop.html (Sell tab) with name, category, price, condition, photo, contact
- Add contact listings on contact.html so buyers can reach you directly
- Delete your own contact listings from contact.html (Delete My Contact button)
- Switch to Seller mode in profile.html to access Admin panel
- Admin panel: suspend buyers, unsuspend users, flag listings, view your audit log
- Block individual buyers from your profile Discover tab

SECURITY FEATURES:
- Passwords hashed with bcrypt (industry standard, brute-force resistant)
- All database queries use prepared statements (SQL injection protected)
- XSS prevention via strip_tags and htmlspecialchars throughout all PHP files
- Role-based access control: buyers cannot access seller admin features
- Seller mode required to access Admin tab and suspend/flag actions
- Sellers cannot suspend other sellers
- All admin actions logged to audit_log table with timestamp and IP address
- Suspended users are tracked in suspended_users database table
- Flagged listings tracked in flagged_listings table

CONTACT & SUPPORT:
- Sellers add contact details on contact.html (phone, email, location, note)
- Sellers can delete their own contact listings at any time
- Buyers can view all seller contacts on the View Contacts tab
- AI assistant (you) is available 24/7 on every page via the chat bubble

EMAIL SYSTEM:
- Order placed → automatic HTML email to buyer's registered email (order number + payment instructions)
- Payment confirmed → second HTML email when buyer clicks 'I Have Paid'
- Works with Gmail (smtp.gmail.com:587) and Outlook (smtp.office365.com:587) via php.ini SMTP config
- Emails include branded DigitalMarketingSA header, order summary table, payment details

STORIES (Instagram-style):
- Users post stories about devices they are selling or buying
- Stories appear in the Stories bar on profile.html
- Followed users' stories appear automatically
- Stories auto-advance every 5 seconds with a progress bar

Answer helpfully, concisely and in the user's language (English or Afrikaans or Zulu etc).
If asked about prices, refer to the standard list above.
If asked how to pay, give the FNB account details.
If asked about emails, explain the two-email system (order + payment confirmation).
If asked about security, explain bcrypt, prepared statements, XSS protection, and audit logs.
Always be friendly, professional, and solution-focused.
");

// ========== READ JSON BODY ==========
$raw   = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit;
}

// Sanitize inputs
$provider = trim($input["provider"] ?? "openai"); // "openai" or "deepseek"
$message  = strip_tags(trim($input["message"]  ?? ""));
$history  = $input["history"] ?? []; // Array of previous {role, content} messages

// Validate inputs
if (empty($message)) {
    echo json_encode(["success" => false, "message" => "Message cannot be empty."]);
    exit;
}

// Validate provider — only allow known providers
if (!in_array($provider, ["openai", "deepseek"])) {
    $provider = "openai";
}

// Limit message length to prevent excessive token use
if (strlen($message) > 2000) {
    echo json_encode(["success" => false, "message" => "Message too long. Please keep it under 2000 characters."]);
    exit;
}

// ========== BUILD MESSAGE ARRAY ==========
// System prompt is sent once — AI remembers DMSA context across the whole conversation
// This is what keeps token usage low while the AI knows everything about the platform
$messages = [
    ["role" => "system", "content" => DMSA_SYSTEM_PROMPT]
];

// Add conversation history (limit to last 10 turns to save tokens)
if (is_array($history)) {
    $trimmed = array_slice($history, -10);
    foreach ($trimmed as $h) {
        if (isset($h["role"], $h["content"]) && in_array($h["role"], ["user", "assistant"])) {
            $messages[] = [
                "role"    => strip_tags($h["role"]),
                "content" => strip_tags(substr($h["content"], 0, 1000)) // truncate long history
            ];
        }
    }
}

// Add current user message
$messages[] = ["role" => "user", "content" => $message];

// ========== CALL AI API ==========
if ($provider === "openai") {

    // ===== OPENAI API CALL — replaces 24/7 human support =====
    $apiUrl  = "https://api.openai.com/v1/chat/completions";
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer " . OPENAI_API_KEY
    ];
    $body = json_encode([
        "model"       => "gpt-4o-mini", // cost-effective model — good for support chat
        "messages"    => $messages,
        "max_tokens"  => 500,           // keep responses concise to save tokens
        "temperature" => 0.7
    ]);

} else {

    // ===== DEEPSEEK API CALL — alternative provider =====
    $apiUrl  = "https://api.deepseek.com/v1/chat/completions";
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer " . DEEPSEEK_API_KEY
    ];
    $body = json_encode([
        "model"       => "deepseek-chat",
        "messages"    => $messages,
        "max_tokens"  => 500,
        "temperature" => 0.7
    ]);
}

// ========== EXECUTE CURL REQUEST ==========
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST,           true);
curl_setopt($ch, CURLOPT_POSTFIELDS,     $body);
curl_setopt($ch, CURLOPT_HTTPHEADER,     $headers);
curl_setopt($ch, CURLOPT_TIMEOUT,        20);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$response) {
    echo json_encode(["success" => false, "message" => "Could not reach AI provider. Please try again."]);
    exit;
}

$data = json_decode($response, true);

// Extract the reply text from the API response
$reply = $data["choices"][0]["message"]["content"] ?? null;

if (!$reply) {
    // Return detailed error so developer can diagnose API key / quota issues
    $errMsg = $data["error"]["message"] ?? "No response from AI. Check your API key and quota.";
    echo json_encode(["success" => false, "message" => $errMsg]);
    exit;
}

echo json_encode(["success" => true, "reply" => trim($reply), "provider" => $provider]);
?>
