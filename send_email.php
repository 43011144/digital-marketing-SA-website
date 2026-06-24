<?php
// ========== SEND EMAIL VIA EMAILJS API ==========
// EmailJS works without any SMTP server configuration
// Sign up free at https://www.emailjs.com and get your keys
// Emails are sent directly from the browser to real inboxes (Gmail, Outlook etc.)
//
// SETUP STEPS (do this once):
// 1. Go to https://www.emailjs.com — create a free account
// 2. Add a service: connect your Gmail (kgift699@gmail.com) under "Email Services"
// 3. Create a template under "Email Templates" — use these variables in your template:
//    {{to_email}}, {{buyer_name}}, {{order_number}}, {{item_names}}, {{item_count}}, {{total}}, {{type}}
// 4. Copy your Public Key, Service ID, and Template ID into send_emailjs.js
//
// This PHP file is kept as a server-side fallback for AMPPS environments
// The primary email sending is done client-side in send_emailjs.js via the EmailJS SDK

error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// ========== EMAILJS API KEYS — fill these in after signing up ==========
// Get these from: https://www.emailjs.com/account
define("EMAILJS_SERVICE_ID",  "YOUR_SERVICE_ID");   // e.g. "service_abc123"
define("EMAILJS_TEMPLATE_ID", "YOUR_TEMPLATE_ID");  // e.g. "template_xyz789"
define("EMAILJS_USER_ID",     "YOUR_PUBLIC_KEY");   // e.g. "AbCdEfGhIjKlMnOp"

$raw   = file_get_contents("php://input");
$input = json_decode($raw, true);
if (!is_array($input)) { echo json_encode(["success" => false, "message" => "Invalid data."]); exit; }

$type         = strip_tags(trim($input["type"]         ?? ""));
$to_email     = strip_tags(trim($input["to_email"]     ?? ""));
$buyer_name   = strip_tags(trim($input["buyer_name"]   ?? ""));
$order_number = strip_tags(trim($input["order_number"] ?? ""));
$item_names   = strip_tags(trim($input["item_names"]   ?? ""));
$item_count   = intval($input["item_count"]  ?? 0);
$total        = floatval($input["total"]     ?? 0);

if (empty($type) || empty($to_email) || empty($buyer_name) || empty($order_number)) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]); exit;
}
if (!filter_var($to_email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email address."]); exit;
}
if (!in_array($type, ["order", "payment"])) {
    echo json_encode(["success" => false, "message" => "Invalid type."]); exit;
}

// ========== CALL EMAILJS REST API FROM PHP ==========
// EmailJS has a REST API that can be called server-side with your keys
$emailjsPayload = json_encode([
    "service_id"  => EMAILJS_SERVICE_ID,
    "template_id" => EMAILJS_TEMPLATE_ID,
    "user_id"     => EMAILJS_USER_ID,
    "template_params" => [
        "to_email"     => $to_email,
        "buyer_name"   => $buyer_name,
        "order_number" => $order_number,
        "item_names"   => $item_names,
        "item_count"   => $item_count,
        "total"        => "R" . number_format($total, 2),
        "type"         => $type === "order" ? "Order Confirmed" : "Payment Confirmed",
        "fnb_account"  => "62849301782",
        "branch_code"  => "250655",
        "subject"      => $type === "order"
            ? "Order Confirmation - " . $order_number . " | DigitalMarketingSA"
            : "Payment Confirmed - " . $order_number . " | DigitalMarketingSA"
    ]
]);

$ch = curl_init("https://api.emailjs.com/api/v1.0/email/send");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST,           true);
curl_setopt($ch, CURLOPT_POSTFIELDS,     $emailjsPayload);
curl_setopt($ch, CURLOPT_HTTPHEADER,     ["Content-Type: application/json", "Origin: http://localhost"]);
curl_setopt($ch, CURLOPT_TIMEOUT,        15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo json_encode(["success" => true, "message" => "Email sent to " . $to_email]);
} else {
    // Server-side failed — client-side EmailJS in send_emailjs.js will handle it
    echo json_encode(["success" => false, "message" => "Server email queued. Client-side will retry.", "http_code" => $httpCode]);
}
?>
