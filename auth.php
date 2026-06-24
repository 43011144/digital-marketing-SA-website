<?php
// ========== AUTH - HANDLES REGISTER AND LOGIN WITH SECURITY ==========

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

// ========== AUTO-CREATE USERS TABLE ==========
$conn->query("
    CREATE TABLE IF NOT EXISTS `users` (
        `id`         INT AUTO_INCREMENT PRIMARY KEY,
        `name`       VARCHAR(100)  NOT NULL,
        `email`      VARCHAR(150)  NOT NULL UNIQUE,
        `phone`      VARCHAR(20)   NOT NULL,
        `password`   VARCHAR(255)  NOT NULL,
        `role`       ENUM('buyer','seller') NOT NULL DEFAULT 'buyer',
        `bio`        TEXT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ========== AUTO-CREATE BLOCKED USERS TABLE ==========
$conn->query("
    CREATE TABLE IF NOT EXISTS `blocked_users` (
        `id`           INT AUTO_INCREMENT PRIMARY KEY,
        `seller_id`    INT NOT NULL,
        `blocked_id`   INT NOT NULL,
        `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `unique_block` (`seller_id`, `blocked_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ========== READ JSON BODY ==========
// Use php://input to read raw JSON — prevents XSS via $_POST
$raw   = file_get_contents("php://input");
$input = json_decode($raw, true);

// Validate that input is valid JSON
if (!is_array($input)) {
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit;
}

// Sanitize the action field — only allow known values
$action = isset($input["action"]) ? trim($input["action"]) : "";

// ========== ROUTE TO CORRECT ACTION ==========
if ($action === "register") {
    handleRegister($conn, $input);
} elseif ($action === "login") {
    handleLogin($conn, $input);
} else {
    echo json_encode(["success" => false, "message" => "Unknown action."]);
}

$conn->close();

// ========== REGISTER ==========
function handleRegister($conn, $input) {

    // Sanitize all inputs — strip tags prevents XSS, trim removes whitespace
    $name     = strip_tags(trim($input["name"]     ?? ""));
    $email    = strip_tags(trim($input["email"]    ?? ""));
    $phone    = strip_tags(trim($input["phone"]    ?? ""));
    $password = trim($input["password"]            ?? "");
    $role     = trim($input["role"]                ?? "buyer");
    $bio      = strip_tags(trim($input["bio"]      ?? ""));

    // Validate required fields
    if (empty($name) || empty($email) || empty($phone) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All required fields must be filled in."]);
        return;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Please enter a valid email address."]);
        return;
    }

    // Validate password length
    if (strlen($password) < 6) {
        echo json_encode(["success" => false, "message" => "Password must be at least 6 characters."]);
        return;
    }

    // Validate role — only allow buyer or seller, reject anything else
    if (!in_array($role, ["buyer", "seller"])) {
        $role = "buyer";
    }

    // Check if email already exists — use prepared statement to prevent SQL injection
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
        $checkStmt->close();
        return;
    }
    $checkStmt->close();

    // Hash the password using PHP's bcrypt (PASSWORD_DEFAULT)
    // bcrypt is slow by design — makes brute-force attacks impractical
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user — prepared statement prevents SQL injection
    $stmt = $conn->prepare(
        "INSERT INTO users (name, email, phone, password, role, bio)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("ssssss", $name, $email, $phone, $hashedPassword, $role, $bio);

    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        // Return user data (never return the hashed password)
        $user = [
            "id"    => $newId,
            "name"  => $name,
            "email" => $email,
            "phone" => $phone,
            "role"  => $role,
            "bio"   => $bio
        ];
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed. Please try again."]);
    }

    $stmt->close();
}

// ========== LOGIN ==========
function handleLogin($conn, $input) {

    // Sanitize inputs
    $email    = strip_tags(trim($input["email"]    ?? ""));
    $password = trim($input["password"]            ?? "");

    // Validate required fields
    if (empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
        return;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Please enter a valid email address."]);
        return;
    }

    // Fetch user by email — prepared statement prevents SQL injection
    $stmt = $conn->prepare(
        "SELECT id, name, email, phone, password, role, bio FROM users WHERE email = ? LIMIT 1"
    );
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // Use a generic message — do not reveal whether email exists
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        $stmt->close();
        return;
    }

    $row = $result->fetch_assoc();
    $stmt->close();

    // Verify password against the bcrypt hash stored in the database
    // password_verify is timing-safe — prevents timing attacks
    if (!password_verify($password, $row["password"])) {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        return;
    }

    // Return user data (never return the hashed password)
    $user = [
        "id"    => $row["id"],
        "name"  => $row["name"],
        "email" => $row["email"],
        "phone" => $row["phone"],
        "role"  => $row["role"],
        "bio"   => $row["bio"]
    ];

    echo json_encode(["success" => true, "user" => $user]);
}
?>
