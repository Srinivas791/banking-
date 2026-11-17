-- =============================================================================
-- Simple Banking Management System - Sample Demonstration Data (MySQL)
-- Course: B.Tech Software Engineering Academic Project
-- Note: Passwords for demo users are hashed using BCrypt.
-- Default passwords:
--   admin    / admin123   (ROLE_ADMIN)
--   teller   / teller123  (ROLE_EMPLOYEE)
--   john_doe / john123    (ROLE_CUSTOMER)
--   jane_s   / jane123    (ROLE_CUSTOMER)
-- =============================================================================

USE banking_db;

-- Clear previous data in correct FK order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE transfers;
TRUNCATE TABLE transactions;
TRUNCATE TABLE accounts;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Insert Demonstration Users
-- Password for admin: admin123 ($2a$10$X8m1VwA.z6v0J4uFqN0s.e5N7eA4V1yGZ1yWz9mZ1wQe0rTyUiOp2)
-- Password for teller: teller123 ($2a$10$X8m1VwA.z6v0J4uFqN0s.e5N7eA4V1yGZ1yWz9mZ1wQe0rTyUiOp2)
-- Password for customers: customer123 ($2a$10$X8m1VwA.z6v0J4uFqN0s.e5N7eA4V1yGZ1yWz9mZ1wQe0rTyUiOp2)
-- -----------------------------------------------------------------------------
INSERT INTO users (id, username, password, email, full_name, phone, role, status, created_at) VALUES
(1, 'admin', '$2a$10$4v7gY5/wZz6L6bEqj4Q8s.wNlKjD1J5tPzXgBwV9iK2vX0oRy1L0S', 'admin@apexbank.com', 'System Administrator', '+1-800-555-0199', 'ROLE_ADMIN', 'ACTIVE', '2026-01-10 09:00:00'),
(2, 'teller', '$2a$10$4v7gY5/wZz6L6bEqj4Q8s.wNlKjD1J5tPzXgBwV9iK2vX0oRy1L0S', 'teller@apexbank.com', 'Sarah Connor (Senior Teller)', '+1-800-555-0145', 'ROLE_EMPLOYEE', 'ACTIVE', '2026-01-15 10:30:00'),
(3, 'john_doe', '$2a$10$4v7gY5/wZz6L6bEqj4Q8s.wNlKjD1J5tPzXgBwV9iK2vX0oRy1L0S', 'john.doe@gmail.com', 'Johnathan Doe', '+1-555-012-3456', 'ROLE_CUSTOMER', 'ACTIVE', '2026-02-01 11:15:00'),
(4, 'jane_smith', '$2a$10$4v7gY5/wZz6L6bEqj4Q8s.wNlKjD1J5tPzXgBwV9iK2vX0oRy1L0S', 'jane.smith@yahoo.com', 'Jane Smith', '+1-555-019-8765', 'ROLE_CUSTOMER', 'ACTIVE', '2026-02-05 14:20:00'),
(5, 'robert_b', '$2a$10$4v7gY5/wZz6L6bEqj4Q8s.wNlKjD1J5tPzXgBwV9iK2vX0oRy1L0S', 'robert.brown@techcorp.io', 'Robert Brown', '+1-555-014-9988', 'ROLE_CUSTOMER', 'ACTIVE', '2026-02-12 16:45:00');

-- -----------------------------------------------------------------------------
-- 2. Insert Customer Profiles
-- -----------------------------------------------------------------------------
INSERT INTO customers (id, user_id, customer_code, first_name, last_name, email, phone, address, city, state, postal_code, date_of_birth, identity_number, status, created_at) VALUES
(1, 3, 'CUST-1001', 'Johnathan', 'Doe', 'john.doe@gmail.com', '+1-555-012-3456', '742 Evergreen Terrace', 'Springfield', 'IL', '62704', '1990-05-15', 'NAT-ID-8849201', 'ACTIVE', '2026-02-01 11:15:00'),
(2, 4, 'CUST-1002', 'Jane', 'Smith', 'jane.smith@yahoo.com', '+1-555-019-8765', '124 Conch Street', 'Bikini Bottom', 'HI', '96815', '1993-08-22', 'NAT-ID-9928374', 'ACTIVE', '2026-02-05 14:20:00'),
(3, 5, 'CUST-1003', 'Robert', 'Brown', 'robert.brown@techcorp.io', '+1-555-014-9988', '221B Baker Street', 'London', 'OH', '43140', '1985-11-30', 'NAT-ID-3382910', 'ACTIVE', '2026-02-12 16:45:00'),
(4, NULL, 'CUST-1004', 'Emily', 'Davis', 'emily.davis@outlook.com', '+1-555-017-4422', '456 Elm Street', 'Metropolis', 'NY', '10001', '1995-03-10', 'NAT-ID-7728192', 'ACTIVE', '2026-02-20 10:00:00'),
(5, NULL, 'CUST-1005', 'Michael', 'Johnson', 'michael.j@enterprise.net', '+1-555-018-7711', '888 Silicon Way', 'San Jose', 'CA', '95112', '1988-07-19', 'NAT-ID-4491028', 'ACTIVE', '2026-02-28 13:10:00');

-- -----------------------------------------------------------------------------
-- 3. Insert Bank Accounts
-- -----------------------------------------------------------------------------
INSERT INTO accounts (id, account_number, customer_id, account_type, balance, minimum_balance, currency, status, created_at) VALUES
(1, '100100000001', 1, 'SAVINGS', 15450.00, 500.00, 'USD', 'ACTIVE', '2026-02-01 11:30:00'),
(2, '100100000002', 2, 'SAVINGS', 8920.50, 500.00, 'USD', 'ACTIVE', '2026-02-05 14:35:00'),
(3, '100100000003', 3, 'CURRENT', 42100.00, 1000.00, 'USD', 'ACTIVE', '2026-02-12 17:00:00'),
(4, '100100000004', 4, 'SAVINGS', 3250.00, 500.00, 'USD', 'ACTIVE', '2026-02-20 10:15:00'),
(5, '100100000005', 5, 'CURRENT', 18700.00, 1000.00, 'USD', 'ACTIVE', '2026-02-28 13:30:00'),
(6, '100100000006', 1, 'CURRENT', 5000.00, 1000.00, 'USD', 'ACTIVE', '2026-03-05 09:40:00');

-- -----------------------------------------------------------------------------
-- 4. Insert Financial Transactions
-- -----------------------------------------------------------------------------
INSERT INTO transactions (id, transaction_ref, account_id, transaction_type, amount, balance_after, description, status, created_at) VALUES
(1, 'TXN-20260201-1001', 1, 'DEPOSIT', 10000.00, 10000.00, 'Initial Account Opening Deposit', 'SUCCESS', '2026-02-01 11:30:00'),
(2, 'TXN-20260205-1002', 2, 'DEPOSIT', 5000.00, 5000.00, 'Initial Account Opening Deposit', 'SUCCESS', '2026-02-05 14:35:00'),
(3, 'TXN-20260212-1003', 3, 'DEPOSIT', 40000.00, 40000.00, 'Initial Corporate Current Account Deposit', 'SUCCESS', '2026-02-12 17:00:00'),
(4, 'TXN-20260215-1004', 1, 'DEPOSIT', 6000.00, 16000.00, 'Salary Credit February 2026', 'SUCCESS', '2026-02-15 08:30:00'),
(5, 'TXN-20260218-1005', 1, 'WITHDRAWAL', 1500.00, 14500.00, 'ATM Cash Withdrawal - Main Branch', 'SUCCESS', '2026-02-18 19:10:00'),
(6, 'TXN-20260220-1006', 4, 'DEPOSIT', 3500.00, 3500.00, 'Initial Opening Deposit', 'SUCCESS', '2026-02-20 10:15:00'),
(7, 'TXN-20260222-1007', 2, 'DEPOSIT', 4500.00, 9500.00, 'Consulting Fee Credit', 'SUCCESS', '2026-02-22 15:45:00'),
(8, 'TXN-20260225-1008', 2, 'WITHDRAWAL', 579.50, 8920.50, 'Utility Bill Payment', 'SUCCESS', '2026-02-25 12:20:00'),
(9, 'TXN-20260301-1009', 1, 'TRANSFER_DEBIT', 500.00, 14000.00, 'Transfer to Jane Smith (100100000002)', 'SUCCESS', '2026-03-01 10:00:00'),
(10, 'TXN-20260301-1010', 2, 'TRANSFER_CREDIT', 500.00, 9420.50, 'Received from Johnathan Doe (100100000001)', 'SUCCESS', '2026-03-01 10:00:00'),
(11, 'TXN-20260302-1011', 1, 'DEPOSIT', 1950.00, 15950.00, 'Dividend Payment Credit', 'SUCCESS', '2026-03-02 14:15:00'),
(12, 'TXN-20260303-1012', 1, 'WITHDRAWAL', 500.00, 15450.00, 'Online Shopping Payment', 'SUCCESS', '2026-03-03 16:30:00'),
(13, 'TXN-20260304-1013', 3, 'DEPOSIT', 2100.00, 42100.00, 'Client Retainer Invoice #4092', 'SUCCESS', '2026-03-04 11:00:00');

-- -----------------------------------------------------------------------------
-- 5. Insert Inter-Account Transfers
-- -----------------------------------------------------------------------------
INSERT INTO transfers (id, transfer_ref, source_account_id, destination_account_id, amount, remark, status, created_at) VALUES
(1, 'TRF-20260301-8849', 1, 2, 500.00, 'Monthly Shared Apartment Utility Split', 'SUCCESS', '2026-03-01 10:00:00');

-- -----------------------------------------------------------------------------
-- 6. Insert System Audit Logs
-- -----------------------------------------------------------------------------
INSERT INTO audit_logs (id, action, performed_by, details, ip_address, created_at) VALUES
(1, 'SYSTEM_INITIALIZATION', 'admin', 'System database initialized with baseline academic schema', '127.0.0.1', '2026-01-10 09:00:00'),
(2, 'CUSTOMER_REGISTRATION', 'teller', 'Registered new customer CUST-1001 (Johnathan Doe)', '192.168.1.102', '2026-02-01 11:15:00'),
(3, 'ACCOUNT_OPENING', 'teller', 'Opened Savings Account 100100000001 with initial deposit $10,000.00', '192.168.1.102', '2026-02-01 11:30:00'),
(4, 'FUND_TRANSFER', 'john_doe', 'Transferred $500.00 from 100100000001 to 100100000002. Ref: TRF-20260301-8849', '192.168.1.55', '2026-03-01 10:00:00'),
(5, 'SECURITY_LOGIN', 'admin', 'Administrator login successful', '127.0.0.1', '2026-03-10 08:30:00');
