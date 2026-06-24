<?php
error_reporting(0);
ini_set('display_errors', 0);
// ========== GET LISTINGS - RETURNS ALL SELLER LISTINGS AS JSON ==========

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

// Fetch all listings ordered by newest first (including image_path)
$result = $conn->query(
    "SELECT id, device_name, category, price, condition_status, description, seller_name, seller_contact, image_path
     FROM listings
     ORDER BY id DESC"
);

$listings = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $listings[] = $row;
    }
}

echo json_encode(["success" => true, "listings" => $listings]);

$conn->close();
?>