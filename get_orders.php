<?php
// ========== GET ORDERS - RETURNS ORDERS FOR A SPECIFIC BUYER ==========

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

// Include database connection - auto-creates DB and tables in phpMyAdmin
require_once "db_connect.php";

// ========== GET BUYER ID (passed as query param) ==========
// intval sanitizes the value — only integers allowed, no SQL injection possible
$buyer_id = intval($_GET["buyer_id"] ?? 0);

if ($buyer_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid buyer ID."]);
    exit;
}

// ========== FETCH ORDERS FOR THIS BUYER — prepared statement prevents SQL injection ==========
$stmt = $conn->prepare(
    "SELECT order_number, item_name, item_count, total, status, created_at
     FROM orders
     WHERE buyer_id = ?
     ORDER BY created_at DESC"
);
$stmt->bind_param("i", $buyer_id);
$stmt->execute();

$result = $stmt->get_result();
$orders = [];

while ($row = $result->fetch_assoc()) {
    $orders[] = [
        "order_number" => $row["order_number"],
        "item_name"    => $row["item_name"],
        "item_count"   => intval($row["item_count"]),
        "total"        => $row["total"],
        "status"       => $row["status"],
        "date"         => date("d M Y", strtotime($row["created_at"]))
    ];
}

$stmt->close();

echo json_encode(["success" => true, "orders" => $orders]);

$conn->close();
?>
