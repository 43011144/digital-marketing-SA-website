<?php
// ========== SELL DEVICE - HANDLES MULTIPART FORM WITH OPTIONAL IMAGE ==========

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

// Create uploads directory if it does not exist
$uploadDir = __DIR__ . "/uploads/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// ========== HANDLE OPTIONAL IMAGE UPLOAD ==========
$image_path = null;

if (isset($_FILES["deviceImage"]) && $_FILES["deviceImage"]["error"] === UPLOAD_ERR_OK) {
    $file      = $_FILES["deviceImage"];
    $maxSize   = 5 * 1024 * 1024; // 5MB

    // Validate file size
    if ($file["size"] > $maxSize) {
        echo json_encode(["success" => false, "message" => "Image must be under 5MB."]);
        exit;
    }

    // Validate file type using MIME
    $allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    $finfo        = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType     = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        echo json_encode(["success" => false, "message" => "Only JPG, PNG and WEBP images are allowed."]);
        exit;
    }

    // Generate unique filename
    $ext      = pathinfo($file["name"], PATHINFO_EXTENSION);
    $fileName = time() . "_" . uniqid() . "." . strtolower($ext);
    $destPath = $uploadDir . $fileName;

    if (move_uploaded_file($file["tmp_name"], $destPath)) {
        // Store relative path for use in HTML src attributes
        $image_path = "uploads/" . $fileName;
    }
}

// ========== GET FORM FIELDS (sent as FormData from shop.js) ==========
$device_name    = htmlspecialchars(trim($_POST["device_name"]      ?? ""));
$category       = htmlspecialchars(trim($_POST["category"]         ?? ""));
$price          = floatval($_POST["price"]                         ?? 0);
$condition      = htmlspecialchars(trim($_POST["condition_status"] ?? ""));
$description    = htmlspecialchars(trim($_POST["description"]      ?? ""));
$seller_name    = htmlspecialchars(trim($_POST["seller_name"]      ?? ""));
$seller_contact = htmlspecialchars(trim($_POST["seller_contact"]   ?? ""));

// Validate required fields
if (empty($device_name) || empty($category) || $price <= 0 || empty($condition) || empty($seller_name) || empty($seller_contact)) {
    echo json_encode(["success" => false, "message" => "All required fields must be filled in."]);
    exit;
}

// ========== INSERT INTO DATABASE ==========
$stmt = $conn->prepare(
    "INSERT INTO listings (device_name, category, price, condition_status, description, seller_name, seller_contact, image_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param("ssdsssss", $device_name, $category, $price, $condition, $description, $seller_name, $seller_contact, $image_path);

if ($stmt->execute()) {
    echo json_encode([
        "success"    => true,
        "message"    => "Device listed successfully.",
        "image_path" => $image_path
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to save listing: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
