<?php
// ========== DELETE LISTING - REMOVES A DEVICE LISTING FROM THE DATABASE ==========

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

// Include database connection
require_once "db_connect.php";

// Get and decode the JSON body sent by shop.js
$input = json_decode(file_get_contents("php://input"), true);

// Validate that an id was provided
if (empty($input["id"]) || !is_numeric($input["id"])) {
    echo json_encode(["success" => false, "message" => "Invalid listing ID."]);
    exit;
}

$id = intval($input["id"]);

// Fetch the image path before deleting so we can remove the file too
$stmt = $conn->prepare("SELECT image_path FROM listings WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$row    = $result->fetch_assoc();
$stmt->close();

// Delete the listing from the database
$stmt = $conn->prepare("DELETE FROM listings WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // Also delete the uploaded image file if one exists
    if ($row && !empty($row["image_path"])) {
        $filePath = __DIR__ . "/" . $row["image_path"];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    echo json_encode(["success" => true, "message" => "Listing deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete listing: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
