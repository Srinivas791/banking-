-- =============================================================================
-- Simple Banking Management System - Database Schema (MySQL)
-- Course: B.Tech Software Engineering Academic Project
-- Database: banking_db
-- =============================================================================

DROP DATABASE IF EXISTS banking_db;
CREATE DATABASE banking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banking_db;

-- -----------------------------------------------------------------------------
-- Table 1: USERS (Authentication & Role-Based Access Control)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CUSTOMER') NOT NULL DEFAULT 'ROLE_CUSTOMER',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table 2: CUSTOMERS (Customer Profiles & KYC Details)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NULL,
    customer_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    date_of_birth DATE,
    identity_number VARCHAR(50) NOT NULL UNIQUE, -- Aadhaar / National ID / SSN
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_customer_code (customer_code),
    INDEX idx_customer_email (email),
    INDEX idx_customer_phone (phone)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table 3: ACCOUNTS (Bank Accounts: Savings & Current)
-- -----------------------------------------------------------------------------
CREATE TABLE accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    account_type ENUM('SAVINGS', 'CURRENT') NOT NULL DEFAULT 'SAVINGS',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    minimum_balance DECIMAL(15, 2) NOT NULL DEFAULT 500.00,
    currency VARCHAR(5) NOT NULL DEFAULT 'USD',
    status ENUM('ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_balance CHECK (balance >= 0.00),
    CONSTRAINT fk_account_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_account_number (account_number),
    INDEX idx_account_customer (customer_id),
    INDEX idx_account_status (status)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table 4: TRANSACTIONS (Financial Ledger for Deposits, Withdrawals, Transfers)
-- -----------------------------------------------------------------------------
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref VARCHAR(50) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    status ENUM('SUCCESS', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_txn_amount CHECK (amount > 0.00),
    CONSTRAINT fk_transaction_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    INDEX idx_txn_ref (transaction_ref),
    INDEX idx_txn_account (account_id),
    INDEX idx_txn_type (transaction_type),
    INDEX idx_txn_date (created_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table 5: TRANSFERS (Atomic Inter-Account Fund Transfers)
-- -----------------------------------------------------------------------------
CREATE TABLE transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_ref VARCHAR(50) NOT NULL UNIQUE,
    source_account_id BIGINT NOT NULL,
    destination_account_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    remark VARCHAR(255),
    status ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_transfer_amount CHECK (amount > 0.00),
    CONSTRAINT fk_transfer_source FOREIGN KEY (source_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfer_destination FOREIGN KEY (destination_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    INDEX idx_transfer_ref (transfer_ref),
    INDEX idx_transfer_source (source_account_id),
    INDEX idx_transfer_dest (destination_account_id),
    INDEX idx_transfer_date (created_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table 6: AUDIT_LOGS (Security, Tracking & Administrative Auditing)
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action),
    INDEX idx_audit_user (performed_by),
    INDEX idx_audit_date (created_at)
) ENGINE=InnoDB;
