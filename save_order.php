<?php
// ========== SAVE ORDER - STORES CART ORDERS IN DATABASE ==========

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

// ========== AUTO-CREATE ORDERS TABLE ==========
$conn->query("
    CREATE TABLE IF NOT EXISTS `orders` (
        `id`           INT AUTO_INCREMENT PRIMARY KEY,
        `order_number` VARCHAR(20)    NOT NULL UNIQUE,
        `buyer_id`     INT            NOT NULL,
        `buyer_name`   VARCHAR(100)   NOT NULL,
        `buyer_email`  VARCHAR(150)   NOT NULL,
        `item_name`    TEXT           NOT NULL,
        `item_count`   INT            NOT NULL DEFAULT 1,
        `total`        DECIMAL(10,2)  NOT NULL,
        `status`       ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
        `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Add item_count to older orders tables that were created without it
$conn->query("ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `item_count` INT NOT NULL DEFAULT 1");

// ========== READ JSON BODY ==========
$raw   = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit;
}

// Sanitize inputs — strip_tags prevents XSS, intval/floatval enforce correct types
$buyer_id    = intval($input["buyer_id"]    ?? 0);
$buyer_name  = strip_tags(trim($input["buyer_name"]  ?? ""));
$buyer_email = strip_tags(trim($input["buyer_email"] ?? ""));
$item_name   = strip_tags(trim($input["item_name"]   ?? ""));
$item_count  = intval($input["item_count"]            ?? 1);
$total       = floatval($input["total"]               ?? 0);

// Validate required fields
if ($buyer_id <= 0 || empty($buyer_name) || empty($buyer_email) || empty($item_name) || $total <= 0) {
    echo json_encode(["success" => false, "message" => "All order fields are required."]);
    exit;
}

// Validate email format
if (!filter_var($buyer_email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email address."]);
    exit;
}

// ========== GENERATE UNIQUE ORDER NUMBER ==========
// Format: DMSA-YYYYMMDD-XXXXX (e.g. DMSA-20260502-48291)
$orderNumber = "DMSA-" . date("Ymd") . "-" . strtoupper(substr(uniqid(), -5));

// ========== INSERT ORDER — prepared statement prevents SQL injection ==========
$stmt = $conn->prepare(
    "INSERT INTO orders (order_number, buyer_id, buyer_name, buyer_email, item_name, item_count, total)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param("sisssd", $orderNumber, $buyer_id, $buyer_name, $buyer_email, $item_name, $item_count, $total);

if ($stmt->execute()) {
    echo json_encode([
        "success"      => true,
        "message"      => "Order placed successfully.",
        "order_number" => $orderNumber,
        "item_count"   => $item_count
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to save order."]);
}

$stmt->close();
$conn->close();
?>
