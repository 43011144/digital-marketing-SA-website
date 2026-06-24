<?php
// ========== GET CONTACTS - RETURNS ALL SELLER CONTACTS AS JSON ==========

// Suppress PHP warnings/notices from corrupting JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Allow requests from any origin (fixes localhost fetch issues)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
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

// Fetch all contacts ordered by newest first — include id so sellers can delete their own
$result = $conn->query(
    "SELECT id, seller_name, seller_phone, seller_email, seller_location, seller_note
     FROM contacts
     ORDER BY id DESC"
);

$contacts = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $contacts[] = $row;
    }
}

echo json_encode(["success" => true, "contacts" => $contacts]);

$conn->close();
?>
