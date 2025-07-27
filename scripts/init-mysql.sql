-- MySQL Database Initialization Script for NewsNow
-- Run this script to create the required database and tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS newsnow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE newsnow;

-- Create cache table
CREATE TABLE IF NOT EXISTS cache (
  id VARCHAR(255) PRIMARY KEY,
  updated BIGINT,
  data TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create MySQL user (optional - you can create this manually)
-- CREATE USER IF NOT EXISTS 'newsnow'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON newsnow.* TO 'newsnow'@'%';
-- FLUSH PRIVILEGES; 