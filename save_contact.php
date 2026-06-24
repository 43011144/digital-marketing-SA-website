<?php
// ========== SAVE CONTACT - RECEIVES JSON AND SAVES TO DATABASE ==========

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

// Include database connection - auto-creates DB and table in phpMyAdmin
require_once "db_connect.php";

// Auto-create the contacts table if it does not exist
$conn->query("
    CREATE TABLE IF NOT EXISTS `contacts` (
        `id`               INT AUTO_INCREMENT PRIMARY KEY,
        `seller_name`      VARCHAR(100)  NOT NULL,
        `seller_phone`     VARCHAR(20)   NOT NULL,
        `seller_email`     VARCHAR(150)  DEFAULT NULL,
        `seller_location`  VARCHAR(150)  NOT NULL,
        `seller_note`      TEXT,
        `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Read JSON body sent by contact.js fetch()
$input = json_decode(file_get_contents("php://input"), true);

// Sanitize inputs
$seller_name     = htmlspecialchars(trim($input["seller_name"]     ?? ""));
$seller_phone    = htmlspecialchars(trim($input["seller_phone"]    ?? ""));
$seller_email    = htmlspecialchars(trim($input["seller_email"]    ?? ""));
$seller_location = htmlspecialchars(trim($input["seller_location"] ?? ""));
$seller_note     = htmlspecialchars(trim($input["seller_note"]     ?? ""));

// Validate required fields
if (empty($seller_name) || empty($seller_phone) || empty($seller_location)) {
    echo json_encode(["success" => false, "message" => "Name, phone and location are required."]);
    exit;
}

// Insert into contacts table
$stmt = $conn->prepare(
    "INSERT INTO contacts (seller_name, seller_phone, seller_email, seller_location, seller_note)
     VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param("sssss", $seller_name, $seller_phone, $seller_email, $seller_location, $seller_note);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Contact saved successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to save contact: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
