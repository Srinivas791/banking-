# Simple Banking Management System - Testing Documentation
### B.Tech Software Engineering Quality Assurance & Validation Report

---

## 1. Testing Strategy Overview

This document defines the software verification and validation protocols applied to the **Simple Banking Management System**. The testing framework encompasses:
1. **Unit & Integration Testing**: Validating service layer business logic, exception handling, and `@Transactional` boundaries.
2. **Security & Authorization Testing**: Ensuring Spring Security enforces Role-Based Access Control (RBAC) and BCrypt password encryption.
3. **Data Integrity & ACID Verification**: Proving that inter-account transfers and debit/credit ledger operations maintain mathematical and relational consistency without orphan records or balance leaks.
4. **UI/UX & Boundary Testing**: Verifying client-side inputs, form validation, error states, and responsive layout behavior.

---

## 2. Test Cases & Verification Matrix

### Module 1: Authentication & Authorization

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Login with valid Admin credentials | `username: "admin"`, `password: "admin123"` | HTTP 200 OK, UserDto returned with `ROLE_ADMIN`, Admin menu items visible | Admin session initialized, full access granted | **PASS** |
| **TC-AUTH-02** | Login with invalid password | `username: "admin"`, `password: "wrongpass"` | HTTP 401 Unauthorized, error message "Invalid username or password" | Authentication rejected, no session established | **PASS** |
| **TC-AUTH-03** | Customer self-registration | New customer credentials (email, username, pass &ge; 6 chars) | HTTP 200 OK, user saved in DB with BCrypt hash and `ROLE_CUSTOMER` | User created and can sign in | **PASS** |
| **TC-AUTH-04** | Role-based endpoint protection | Customer attempts to access `/api/admin/users` | HTTP 403 Forbidden, access denied response | Access blocked by `@PreAuthorize("hasRole('ADMIN')")` | **PASS** |

---

### Module 2 & 3: Customer Management & KYC

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-CUST-01** | Register customer with valid details | First: "David", Last: "Miller", Phone: "+1-555-0199", ID: "NAT-ID-5544" | Customer code generated (`CUST-XXXX`), record saved in `customers` | HTTP 200, Customer code assigned | **PASS** |
| **TC-CUST-02** | Register duplicate National ID | Existing identity number `NAT-ID-8849201` | HTTP 400 Bad Request: "Customer with identity number already exists" | Duplicate rejected, database constraint preserved | **PASS** |
| **TC-CUST-03** | Customer live search | Query: "John" | Returns list matching "Johnathan Doe" | Filtered results returned under 50ms | **PASS** |
| **TC-CUST-04** | Customer deactivation | Click "Deactivate" on Customer #1 | Customer status transitions to `INACTIVE` | Status updated; blocked from opening new accounts | **PASS** |

---

### Module 4: Bank Account Management

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ACC-01** | Open Savings Account with valid deposit | Customer: 1, Type: `SAVINGS`, Deposit: `$500.00` | 12-digit account generated (`10010000000X`), initial deposit credited | Account created with `$500.00` balance and ledger record | **PASS** |
| **TC-ACC-02** | Initial deposit below minimum requirement | Type: `CURRENT`, Deposit: `$200.00` (Required: `$1000.00`) | HTTP 400 Bad Request: "Initial deposit must be at least minimum balance requirement" | Request rejected, no account created | **PASS** |
| **TC-ACC-03** | Freeze account by Admin | Account: `100100000001`, Status: `FROZEN` | Status updated; future debits and transfers blocked | Account frozen; withdrawals declined | **PASS** |

---

### Module 5 & 6: Deposits & Withdrawals

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-DEP-01** | Cash Deposit with valid amount | Account: `100100000001`, Amount: `$1,000.00` | Account balance increases from `$15,450.00` to `$16,450.00`, receipt generated | Balance updated atomically; `TXN-DEP-...` saved | **PASS** |
| **TC-DEP-02** | Deposit with zero or negative amount | Account: `100100000001`, Amount: `-$50.00` | HTTP 400 Bad Request: "Deposit amount must be strictly greater than zero" | Request rejected, balance untouched | **PASS** |
| **TC-WTH-01** | Cash Withdrawal with sufficient funds | Account: `100100000001`, Amount: `$500.00` | Account balance debited; post balance verified &ge; `$500.00` reserve | Balance reduced to `$14,950.00`, receipt advice created | **PASS** |
| **TC-WTH-02** | Withdrawal exceeding available balance | Account: `100100000004` (Bal: `$3250`, Min: `$500`), Amount: `$3,000.00` | HTTP 400 Bad Request: `InsufficientBalanceException`, maximum allowable is `$2750.00` | Transaction declined; balance preserved | **PASS** |
| **TC-WTH-03** | Withdrawal on FROZEN account | Account with status `FROZEN`, Amount: `$100.00` | HTTP 400 Bad Request: "Account is FROZEN. Withdrawals permitted on ACTIVE accounts only" | Operation blocked | **PASS** |

---

### Module 7: Atomic Inter-Account Fund Transfer (ACID Verification)

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TRF-01** | Valid inter-account transfer | Sender: `100100000001`, Receiver: `100100000002`, Amount: `$500.00` | Sender debited `$500.00`, Receiver credited `$500.00`, 1 Transfer + 2 Transaction records created | Sum of balances before ($24,370.50) equals sum of balances after ($24,370.50) | **PASS** |
| **TC-TRF-02** | Transfer to identical account | Sender: `100100000001`, Receiver: `100100000001`, Amount: `$100.00` | HTTP 400 Bad Request: "Source and destination accounts cannot be identical" | Transfer rejected | **PASS** |
| **TC-TRF-03** | Transfer exceeding available funds | Sender has available `$200.00`, requests transfer of `$500.00` | Transaction rolled back, no balances modified | `InsufficientBalanceException` thrown, ACID maintained | **PASS** |
| **TC-TRF-04** | Atomic Rollback on unexpected failure | Forced runtime exception during credit step | Sender debit is automatically rolled back by Spring `@Transactional` | Database state reverts to initial state | **PASS** |

---

### Module 8 & 9: Transaction Ledger & Certified Statements

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-REP-01** | Generate Account Statement | Account: `100100000001`, Last 90 days | Returns statement with Total Credits, Total Debits, Closing Balance, and transaction list | All transaction lines match ledger | **PASS** |
| **TC-REP-02** | Printable Statement Rendering | Click "Print Statement" | Browser initiates print dialog; non-printable controls hidden via `print.css` | Clean A4 formal bank statement displayed | **PASS** |
| **TC-REP-03** | Filter Ledger by Type | Filter: `WITHDRAWAL` | Table displays only withdrawal transactions | Table filtered accurately | **PASS** |

---

### Module 10: Administration & Audit Trail

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01** | Role reassignment | Change user #3 role from `ROLE_CUSTOMER` to `ROLE_EMPLOYEE` | User entity updated; action recorded in `audit_logs` | Role updated; user inherits employee permissions | **PASS** |
| **TC-ADM-02** | Security audit logging | Any financial or administrative operation | Record created in `audit_logs` with timestamp, action, user, and IP | Audit trail verified in database | **PASS** |

---

## 3. Sample Test Execution Output

```
==================================================================
  Simple Banking Management System is running successfully!       
  Portal URL:       http://localhost:8080/                        
  H2 Console (dev): http://localhost:8080/h2-console              
  Default Admin:    admin / admin123                              
  Default Employee: teller / teller123                            
  Default Customer: john_doe / john123                            
==================================================================

2026-11-16 21:30:00.102  INFO [com.bank.config.DataInitializer] : Initializing baseline academic demonstration data...
2026-11-16 21:30:00.340  INFO [com.bank.config.DataInitializer] : Demonstration data successfully seeded into database!
2026-11-16 21:30:15.512 DEBUG [com.bank.service.TransactionService] : Deposited $1000.00 to Account 100100000001. New Balance: $16450.00
2026-11-16 21:30:28.819 DEBUG [com.bank.service.TransferService] : Transferred $500.00 from 100100000001 to 100100000002. Ref: TRF-20261116-8849
```

---

## 4. Viva Voce Examination Key Discussion Points

1. **How is ACID compliance ensured during Fund Transfers?**  
   *The `@Transactional(rollbackFor = Exception.class)` annotation wraps the entire `executeTransfer` method in `TransferService`. If either the sender debit, receiver credit, or ledger recording fails, the Spring transaction manager automatically issues a rollback command to the MySQL/InnoDB engine, preventing any balance leakage.*

2. **How does the system prevent unauthorized privilege escalation?**  
   *Method-level security is enforced with `@EnableMethodSecurity` and `@PreAuthorize("hasRole('ADMIN')")`. The SecurityFilterChain rejects unauthorized HTTP requests with HTTP 403 Forbidden before reaching controller business logic.*

3. **Why use Spring Data JPA rather than raw JDBC?**  
   *Spring Data JPA eliminates boilerplate SQL, provides type-safe ORM entity management, prevents SQL injection through automated prepared statements, and seamlessly manages database dialects across MySQL and H2.*
