<?php
// ========== DELETE CONTACT - SELLER REMOVES THEIR OWN CONTACT LISTING ==========

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

// Sanitize inputs — intval ensures only integers, strip_tags prevents XSS
$contact_id  = intval($input["contact_id"]   ?? 0);
$seller_name = strip_tags(trim($input["seller_name"] ?? ""));

// Validate inputs
if ($contact_id <= 0 || empty($seller_name)) {
    echo json_encode(["success" => false, "message" => "Contact ID and seller name are required."]);
    exit;
}

// ========== DELETE CONTACT — prepared statement prevents SQL injection ==========
// seller_name check ensures sellers can only delete their own contacts
$stmt = $conn->prepare(
    "DELETE FROM contacts WHERE id = ? AND seller_name = ?"
);
$stmt->bind_param("is", $contact_id, $seller_name);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Contact deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Contact not found or you do not have permission to delete it."]);
}

$stmt->close();
$conn->close();
?>
