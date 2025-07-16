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

-- Create user table
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255),
  data TEXT,
  type VARCHAR(50),
  created BIGINT,
  updated BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for user table
CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);

-- Create MySQL user (optional - you can create this manually)
-- CREATE USER IF NOT EXISTS 'newsnow'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON newsnow.* TO 'newsnow'@'%';
-- FLUSH PRIVILEGES; 