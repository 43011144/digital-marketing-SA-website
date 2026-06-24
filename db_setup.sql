-- ========== DATABASE SETUP FOR DIGITALMARKETINGSA ==========
-- Run this file once in phpMyAdmin or MySQL CLI to create the database and table

CREATE DATABASE IF NOT EXISTS digitalmarketingsa;

USE digitalmarketingsa;

-- Listings table stores devices submitted by sellers
CREATE TABLE IF NOT EXISTS listings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    device_name      VARCHAR(150)   NOT NULL,
    category         VARCHAR(50)    NOT NULL,
    price            DECIMAL(10, 2) NOT NULL,
    condition_status VARCHAR(50)    NOT NULL,
    description      TEXT,
    seller_name      VARCHAR(100)   NOT NULL,
    seller_contact   VARCHAR(20)    NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
