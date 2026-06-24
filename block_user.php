<?php
// ========== BLOCK / UNBLOCK USER - SELLER ONLY ==========

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

// Include database connection - auto-creates DB and tables in phpMyAdmin
require_once "db_connect.php";

// ========== READ JSON BODY ==========
$raw   = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit;
}

// Sanitize inputs — intval ensures only integers, no SQL injection possible
$seller_id  = intval($input["seller_id"]  ?? 0);
$blocked_id = intval($input["blocked_id"] ?? 0);
$action     = trim($input["action"]       ?? "");

// Validate inputs
if ($seller_id <= 0 || $blocked_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid user IDs."]);
    exit;
}

// Prevent a user from blocking themselves
if ($seller_id === $blocked_id) {
    echo json_encode(["success" => false, "message" => "You cannot block yourself."]);
    exit;
}

// Validate action
if (!in_array($action, ["block", "unblock"])) {
    echo json_encode(["success" => false, "message" => "Invalid action."]);
    exit;
}

// Verify the seller_id belongs to a seller role — prepared statement prevents SQL injection
$checkStmt = $conn->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
$checkStmt->bind_param("i", $seller_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Seller not found."]);
    $checkStmt->close();
    exit;
}

$seller = $checkResult->fetch_assoc();
$checkStmt->close();

if ($seller["role"] !== "seller") {
    echo json_encode(["success" => false, "message" => "Only sellers can block users."]);
    exit;
}

// ========== BLOCK OR UNBLOCK ==========
if ($action === "block") {
    // Insert block record — prepared statement prevents SQL injection
    $stmt = $conn->prepare(
        "INSERT IGNORE INTO blocked_users (seller_id, blocked_id) VALUES (?, ?)"
    );
    $stmt->bind_param("ii", $seller_id, $blocked_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(["success" => true, "message" => "User blocked."]);

} else {
    // Remove block record — prepared statement prevents SQL injection
    $stmt = $conn->prepare(
        "DELETE FROM blocked_users WHERE seller_id = ? AND blocked_id = ?"
    );
    $stmt->bind_param("ii", $seller_id, $blocked_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(["success" => true, "message" => "User unblocked."]);
}

$conn->close();
?>
