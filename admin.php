<?php
// ========== ADMIN - SELLER ADMINISTRATIVE PRIVILEGES ==========
// Handles: suspend users, view audit logs, flag listings, view reports

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

// ========== AUTO-CREATE AUDIT LOG TABLE ==========
// Records all admin actions for security review
$conn->query("
    CREATE TABLE IF NOT EXISTS `audit_log` (
        `id`          INT AUTO_INCREMENT PRIMARY KEY,
        `admin_id`    INT          NOT NULL,
        `action`      VARCHAR(100) NOT NULL,
        `target_id`   INT          DEFAULT NULL,
        `target_type` VARCHAR(50)  DEFAULT NULL,
        `detail`      TEXT,
        `ip_address`  VARCHAR(45)  DEFAULT NULL,
        `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ========== AUTO-CREATE FLAGGED LISTINGS TABLE ==========
$conn->query("
    CREATE TABLE IF NOT EXISTS `flagged_listings` (
        `id`          INT AUTO_INCREMENT PRIMARY KEY,
        `listing_id`  INT          NOT NULL,
        `flagged_by`  INT          NOT NULL,
        `reason`      VARCHAR(255) NOT NULL,
        `status`      ENUM('open','resolved') NOT NULL DEFAULT 'open',
        `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ========== AUTO-CREATE SUSPENDED USERS TABLE ==========
$conn->query("
    CREATE TABLE IF NOT EXISTS `suspended_users` (
        `id`          INT AUTO_INCREMENT PRIMARY KEY,
        `user_id`     INT          NOT NULL UNIQUE,
        `suspended_by` INT         NOT NULL,
        `reason`      VARCHAR(255) NOT NULL,
        `expires_at`  DATETIME     DEFAULT NULL,
        `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ========== READ JSON BODY ==========
$raw   = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit;
}

// Sanitize inputs
$action    = strip_tags(trim($input["action"]    ?? ""));
$admin_id  = intval($input["admin_id"]           ?? 0);
$target_id = intval($input["target_id"]          ?? 0);
$reason    = strip_tags(trim($input["reason"]    ?? ""));

// Validate admin_id
if ($admin_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid admin ID."]);
    exit;
}

// Verify the admin_id belongs to a seller — sellers have admin privileges
$checkStmt = $conn->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
$checkStmt->bind_param("i", $admin_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Admin user not found."]);
    $checkStmt->close();
    exit;
}

$adminUser = $checkResult->fetch_assoc();
$checkStmt->close();

if ($adminUser["role"] !== "seller") {
    echo json_encode(["success" => false, "message" => "Only sellers have admin privileges."]);
    exit;
}

// Get client IP for audit log
$ip = $_SERVER["REMOTE_ADDR"] ?? "unknown";

// ========== ROUTE ADMIN ACTION ==========
switch ($action) {

    // ===== SUSPEND USER =====
    case "suspend_user":
        if ($target_id <= 0 || empty($reason)) {
            echo json_encode(["success" => false, "message" => "Target user ID and reason are required."]);
            break;
        }
        // Sellers cannot suspend other sellers
        $targetCheck = $conn->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
        $targetCheck->bind_param("i", $target_id);
        $targetCheck->execute();
        $targetResult = $targetCheck->get_result();
        if ($targetResult->num_rows > 0) {
            $targetUser = $targetResult->fetch_assoc();
            if ($targetUser["role"] === "seller") {
                echo json_encode(["success" => false, "message" => "Sellers cannot suspend other sellers."]);
                $targetCheck->close();
                break;
            }
        }
        $targetCheck->close();

        $stmt = $conn->prepare(
            "INSERT INTO suspended_users (user_id, suspended_by, reason) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE suspended_by = ?, reason = ?, created_at = NOW()"
        );
        $stmt->bind_param("iissi", $target_id, $admin_id, $reason, $admin_id, $reason);
        $stmt->execute();
        $stmt->close();

        // Log the action
        logAction($conn, $admin_id, "suspend_user", $target_id, "user", $reason, $ip);
        echo json_encode(["success" => true, "message" => "User suspended."]);
        break;

    // ===== UNSUSPEND USER =====
    case "unsuspend_user":
        if ($target_id <= 0) {
            echo json_encode(["success" => false, "message" => "Target user ID is required."]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM suspended_users WHERE user_id = ?");
        $stmt->bind_param("i", $target_id);
        $stmt->execute();
        $stmt->close();

        logAction($conn, $admin_id, "unsuspend_user", $target_id, "user", "User reinstated", $ip);
        echo json_encode(["success" => true, "message" => "User unsuspended."]);
        break;

    // ===== FLAG LISTING =====
    case "flag_listing":
        if ($target_id <= 0 || empty($reason)) {
            echo json_encode(["success" => false, "message" => "Listing ID and reason are required."]);
            break;
        }
        $stmt = $conn->prepare(
            "INSERT INTO flagged_listings (listing_id, flagged_by, reason) VALUES (?, ?, ?)"
        );
        $stmt->bind_param("iis", $target_id, $admin_id, $reason);
        $stmt->execute();
        $stmt->close();

        logAction($conn, $admin_id, "flag_listing", $target_id, "listing", $reason, $ip);
        echo json_encode(["success" => true, "message" => "Listing flagged for review."]);
        break;

    // ===== GET AUDIT LOG =====
    case "get_audit_log":
        $stmt = $conn->prepare(
            "SELECT al.*, u.name AS admin_name FROM audit_log al
             LEFT JOIN users u ON u.id = al.admin_id
             WHERE al.admin_id = ?
             ORDER BY al.created_at DESC LIMIT 50"
        );
        $stmt->bind_param("i", $admin_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $logs   = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        $stmt->close();
        echo json_encode(["success" => true, "logs" => $logs]);
        break;

    // ===== GET SUSPENDED USERS =====
    case "get_suspended":
        $stmt = $conn->prepare(
            "SELECT su.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
             FROM suspended_users su
             LEFT JOIN users u ON u.id = su.user_id
             WHERE su.suspended_by = ?
             ORDER BY su.created_at DESC"
        );
        $stmt->bind_param("i", $admin_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $users  = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        $stmt->close();
        echo json_encode(["success" => true, "suspended" => $users]);
        break;

    // ===== CHECK IF USER IS SUSPENDED =====
    case "check_suspended":
        if ($target_id <= 0) {
            echo json_encode(["success" => false, "message" => "User ID required."]);
            break;
        }
        $stmt = $conn->prepare("SELECT id, reason FROM suspended_users WHERE user_id = ? LIMIT 1");
        $stmt->bind_param("i", $target_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $suspended = $result->num_rows > 0;
        $suspendReason = $suspended ? $result->fetch_assoc()["reason"] : "";
        $stmt->close();
        echo json_encode(["success" => true, "suspended" => $suspended, "reason" => $suspendReason]);
        break;

    // ===== GET FLAGGED LISTINGS =====
    case "get_flagged":
        $stmt = $conn->prepare(
            "SELECT fl.*, u.name AS flagged_by_name FROM flagged_listings fl
             LEFT JOIN users u ON u.id = fl.flagged_by
             WHERE fl.flagged_by = ?
             ORDER BY fl.created_at DESC LIMIT 50"
        );
        $stmt->bind_param("i", $admin_id);
        $stmt->execute();
        $result  = $stmt->get_result();
        $flagged = [];
        while ($row = $result->fetch_assoc()) {
            $flagged[] = $row;
        }
        $stmt->close();
        echo json_encode(["success" => true, "flagged" => $flagged]);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Unknown admin action."]);
        break;
}

$conn->close();

// ========== LOG ADMIN ACTION TO AUDIT TABLE ==========
function logAction($conn, $adminId, $action, $targetId, $targetType, $detail, $ip) {
    $stmt = $conn->prepare(
        "INSERT INTO audit_log (admin_id, action, target_id, target_type, detail, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("isiiss", $adminId, $action, $targetId, $targetType, $detail, $ip);
    $stmt->execute();
    $stmt->close();
}
?>
