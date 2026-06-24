<?php
// ========== GET USERS - RETURNS ALL USERS FOR DISCOVER TAB ==========

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

// ========== GET CURRENT USER ID (passed as query param) ==========
// intval sanitizes the value — only integers allowed, no SQL injection possible
$currentId = intval($_GET["current_id"] ?? 0);

// ========== FETCH ALL USERS EXCEPT CURRENT USER ==========
// Prepared statement prevents SQL injection
$stmt = $conn->prepare(
    "SELECT id, name, email, phone, role, bio FROM users WHERE id != ? ORDER BY created_at DESC"
);
$stmt->bind_param("i", $currentId);
$stmt->execute();

$result = $stmt->get_result();
$users  = [];

while ($row = $result->fetch_assoc()) {
    // Never return passwords — only return safe fields
    $users[] = [
        "id"    => $row["id"],
        "name"  => $row["name"],
        "email" => $row["email"],
        "phone" => $row["phone"],
        "role"  => $row["role"],
        "bio"   => $row["bio"]
    ];
}

$stmt->close();

// ========== FETCH BLOCKED LIST FOR CURRENT USER ==========
$blocked = [];

if ($currentId > 0) {
    $blockStmt = $conn->prepare(
        "SELECT blocked_id FROM blocked_users WHERE seller_id = ?"
    );
    $blockStmt->bind_param("i", $currentId);
    $blockStmt->execute();
    $blockResult = $blockStmt->get_result();

    while ($row = $blockResult->fetch_assoc()) {
        $blocked[] = $row["blocked_id"];
    }
    $blockStmt->close();
}

echo json_encode(["success" => true, "users" => $users, "blocked" => $blocked]);

$conn->close();
?>
