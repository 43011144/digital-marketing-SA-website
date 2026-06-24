<?php
error_reporting(0);
ini_set('display_errors', 0);
// ========== DATABASE CONNECTION & AUTO SETUP ==========
// This file creates the database and table automatically in phpMyAdmin
// Just include this file in any PHP file that needs the database

$host     = "localhost";
$dbname   = "digitalmarketingsa";
$username = "root";
$password = "mysql";

// Connect to MySQL server (no database selected yet)
$conn = new mysqli($host, $username, $password);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "MySQL connection failed: " . $conn->connect_error]);
    exit;
}

// Auto-create the database if it does not exist in phpMyAdmin
$conn->query("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");

// Select the database
$conn->select_db($dbname);

// Auto-create the listings table if it does not exist (with image column)
$conn->query("
    CREATE TABLE IF NOT EXISTS `listings` (
        `id`               INT AUTO_INCREMENT PRIMARY KEY,
        `device_name`      VARCHAR(150)   NOT NULL,
        `category`         VARCHAR(50)    NOT NULL,
        `price`            DECIMAL(10,2)  NOT NULL,
        `condition_status` VARCHAR(50)    NOT NULL,
        `description`      TEXT,
        `seller_name`      VARCHAR(100)   NOT NULL,
        `seller_contact`   VARCHAR(20)    NOT NULL,
        `image_path`       VARCHAR(500)   DEFAULT NULL,
        `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Add image_path to any older tables that were created without it
$conn->query("ALTER TABLE `listings` ADD COLUMN IF NOT EXISTS `image_path` VARCHAR(500) DEFAULT NULL");
?>