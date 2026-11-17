# Simple Banking Management System
### B.Tech Software Engineering Capstone / Academic Project
**Developed with Java, Spring Boot, Spring Security, Spring Data JPA, MySQL, HTML5, CSS3, JavaScript, and Chart.js**

---

## 1. Project Overview & Abstract

The **Simple Banking Management System** is an enterprise-grade, web-based banking automation platform designed and developed to digitize fundamental retail and corporate banking workflows. The system modernizes conventional banking procedures—including customer onboarding, automated KYC verification, multi-tier account management (Savings & Current), teller cash deposits, strictly audited cash withdrawals, atomic inter-account fund transfers, transaction ledger auditing, certified account statements, and role-based administrative governance.

Engineered with a focus on **data integrity, security, auditability, and responsiveness**, the application enforces strict double-entry ledger bookkeeping, ACID database transaction guarantees, BCrypt password hashing, and role-based access control (RBAC).

> **Academic Notice**: *This software is an educational demonstration prototype configured with sample demonstration data. It does not connect to SWIFT/FEDWIRE/ACH or process real-world customer monetary instruments.*

---

## 2. Technology Stack & Architecture

### Backend Architecture
* **Language**: Java 17+ (JDK 17 / 21 LTS compatible)
* **Framework**: Spring Boot 3.3.5
* **Data Persistence**: Spring Data JPA / Hibernate ORM
* **Security & Auth**: Spring Security 6 with BCrypt Password Hashing (`BCryptPasswordEncoder`)
* **Validation**: Jakarta Bean Validation (`@NotNull`, `@NotBlank`, `@DecimalMin`, `@Email`)
* **Database Engine**: MySQL 8.x (InnoDB Engine, utf8mb4) + Dual Profile H2 In-Memory option

### Frontend & UI/UX Stack
* **Markup & Structure**: HTML5 Semantic Architecture
* **Styling**: Modern Custom CSS3 with Design Tokens (Navy `#0a192f`, Royal Blue `#2563eb`, Emerald `#10b981`, Slate `#0f172a`)
* **Client Logic**: Vanilla ES6+ JavaScript (Modular, Event-Driven, Fetch API)
* **Data Visualization**: Chart.js (Cashflow Bar Charts & Account Portfolio Donut Charts)
* **Print Engine**: Dedicated `@media print` CSS for Official Transaction Advices and Certified Account Statements

### Software Architecture Pattern
The backend adheres strictly to the **Layered Architectural Pattern** (N-Tier Architecture):
```
      [ Presentation Layer: Responsive Web UI / SPA (HTML5/CSS3/JS) ]
                                    │  REST JSON Requests
                                    ▼
       [ Controller Layer: Spring Boot REST Controllers (@RestController) ]
                                    │  Data Transfer Objects (DTOs)
                                    ▼
       [ Service Layer: Business Logic & Transaction Boundaries (@Transactional) ]
                                    │  Entities
                                    ▼
       [ Data Access Layer: Spring Data JPA Repositories (JpaRepository) ]
                                    │  SQL Queries (InnoDB)
                                    ▼
             [ Database Layer: Normalized MySQL Database / H2 Engine ]
```

---

## 3. Database Architecture (5 Normalized Tables + Audit Trail)

The database schema is fully normalized up to 3NF, ensuring data redundancy is eliminated and relational integrity is strictly preserved.

```
┌──────────────┐          1:1          ┌──────────────┐
│    USERS     │ ────────────────────> │  CUSTOMERS   │
└──────────────┘                       └──────────────┘
                                              │ 1
                                              │
                                              │ 1:N
                                              ▼
┌──────────────┐          1:N          ┌──────────────┐
│ TRANSACTIONS │ <──────────────────── │   ACCOUNTS   │
└──────────────┘                       └──────────────┘
                                         ▲          ▲
                         Source Account  │          │ Destination Account
                                         │   1:N    │
                                      ┌──────────────┐
                                      │  TRANSFERS   │
                                      └──────────────┘
```

### Table Definitions:

1. **`users`**: Manages login identities, credentials, role authorizations (`ROLE_ADMIN`, `ROLE_EMPLOYEE`, `ROLE_CUSTOMER`), and activation flags.
2. **`customers`**: Stores KYC personal details, customer unique code (`CUST-XXXX`), national identity number (Aadhaar/SSN), contact coordinates, and residential address.
3. **`accounts`**: Stores bank accounts linked to customer profiles, unique 12-digit account numbers (`100100000001`), account types (`SAVINGS`, `CURRENT`), real-time balances, currency (`USD`), and minimum reserve thresholds.
4. **`transactions`**: Double-entry financial ledger recording deposits, cash withdrawals, debit legs, and credit legs with immutable references (`TXN-YYYYMMDD-XXXX`), timestamps, and post-transaction balances.
5. **`transfers`**: Inter-account fund transfers linking source and destination accounts with unique transfer references (`TRF-YYYYMMDD-XXXX`).
6. **`audit_logs`**: System security trail capturing timestamps, administrative actions, initiating username, details, and client IP addresses.

---

## 4. Application Modules (Functional Specification)

* **Module 1: Authentication & Access Control**  
  * Secure sign-in and sign-out endpoints.
  * Role-based authorization (`ROLE_ADMIN`, `ROLE_EMPLOYEE`, `ROLE_CUSTOMER`).
  * One-click demo credential auto-fill for viva examiners and professors.
  * BCrypt one-way password hashing.
* **Module 2: Real-Time Executive Dashboard**  
  * Key performance metrics: Total registered customers, active accounts, total bank reserves, cumulative deposits, and withdrawals.
  * Chart.js interactive visualizations: Monthly transaction volume and Savings vs Current distribution.
  * Live recent transactions feed with instant advice receipt triggers.
* **Module 3: Customer Relationship Management**  
  * Customer registration form with client and server-side validation.
  * Real-time debounce search by customer name, code, email, or telephone.
  * Comprehensive KYC dossier modal displaying linked accounts and total portfolio balance.
  * Profile status toggle (ACTIVE / INACTIVE).
* **Module 4: Bank Account Management**  
  * Automatic generation of unique 12-digit account numbers.
  * Support for Savings ($500.00 minimum reserve) and Current accounts ($1,000.00 minimum reserve).
  * Initial deposit processing with atomic opening transaction generation.
  * Administrative account freeze and unfreeze capabilities.
* **Module 5: Deposit Management**  
  * Account selection with automated validation (ensures account is ACTIVE).
  * Strict `amount > 0` validation.
  * Atomic balance credit and immediate ledger entry generation.
  * Instant electronic receipt generation modal.
* **Module 6: Withdrawal Management**  
  * Account validation ensuring account is ACTIVE.
  * Strict overdraft prevention: Verifies `(Current Balance - Withdrawal Amount) >= Minimum Reserve`.
  * Atomic balance debit and immutable ledger entry.
  * Instant electronic debit advice modal.
* **Module 7: Atomic Inter-Account Fund Transfer**  
  * Select source and beneficiary accounts.
  * Enforces `source != destination`.
  * Verifies source account has sufficient funds beyond minimum reserve.
  * Atomic `@Transactional` execution:
    1. Debits sender account.
    2. Credits receiver account.
    3. Records master `Transfer` entity.
    4. Records sender ledger `TRANSFER_DEBIT` transaction.
    5. Records receiver ledger `TRANSFER_CREDIT` transaction.
    6. Logs event to `audit_logs`.
* **Module 8: Financial Transaction Ledger**  
  * Complete ledger displaying all banking transactions.
  * Filterable by transaction category (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER_DEBIT`, `TRANSFER_CREDIT`).
  * Debounced keyword search by transaction reference or account number.
  * Printable transaction receipt for every ledger record.
* **Module 9: Reports & Certified Account Statements**  
  * Select any customer account and date range (From Date &mdash; To Date).
  * Calculates Total Inflows (Deposits), Total Outflows (Withdrawals), Net Flow, and Closing Balance.
  * Chronological statement ledger table.
  * Official Print / PDF view with bank letterhead, disclaimer, and officer signature blocks.
* **Module 10: System Administration & Governance**  
  * User management table for all system identities.
  * Dynamic role reassignment (`ROLE_ADMIN`, `ROLE_EMPLOYEE`, `ROLE_CUSTOMER`).
  * Account activation/deactivation.
  * Live immutable security audit trail viewer.

---

## 5. Pre-Seeded Demonstration Data & Credentials

The system automatically initializes demonstration data upon first run via `DataInitializer.java` (or via `sample_data.sql` in MySQL):

| Username | Password | Role | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | `ROLE_ADMIN` | Full System Access | Executive Dashboard, User Roles, Audit Logs |
| **`teller`** | `teller123` | `ROLE_EMPLOYEE` | Banking Operations | Customer Onboarding, Deposits, Withdrawals, Accounts |
| **`john_doe`** | `john123` | `ROLE_CUSTOMER` | Customer Portal | Self-service transfers, balance enquiry, statements |
| **`jane_smith`** | `jane123` | `ROLE_CUSTOMER` | Customer Portal | Customer account holder |
| **`robert_b`** | `robert123` | `ROLE_CUSTOMER` | Customer Portal | Corporate Current account holder |

### Pre-Seeded Bank Accounts:
* `100100000001`: Johnathan Doe &mdash; **Savings** &mdash; Balance: `$15,450.00`
* `100100000002`: Jane Smith &mdash; **Savings** &mdash; Balance: `$8,920.50`
* `100100000003`: Robert Brown &mdash; **Current** &mdash; Balance: `$42,100.00`
* `100100000004`: Emily Davis &mdash; **Savings** &mdash; Balance: `$3,250.00`
* `100100000005`: Michael Johnson &mdash; **Current** &mdash; Balance: `$18,700.00`
* `100100000006`: Johnathan Doe &mdash; **Current** &mdash; Balance: `$5,000.00`

---

## 6. Project Directory Structure

```
simple-banking-system/
├── pom.xml                                   # Maven dependencies & build configuration
├── mvnw                                      # Maven wrapper script for Linux/macOS
├── mvnw.cmd                                  # Maven wrapper script for Windows
├── .mvn/wrapper/maven-wrapper.properties      # Maven wrapper configuration
├── .gitignore                                # Git ignore rules
├── README.md                                 # Academic project documentation
├── TESTING.md                                # Software testing documentation & test cases
├── database/
│   ├── schema.sql                            # Normalized MySQL DDL schema script
│   └── sample_data.sql                       # Sample DML demonstration seed script
└── src/
    ├── main/
    │   ├── java/com/bank/
    │   │   ├── BankingApplication.java       # Spring Boot main class
    │   │   ├── config/
    │   │   │   ├── DataInitializer.java      # Automatic startup demo data seeder
    │   │   │   ├── SecurityConfig.java       # Spring Security 6 RBAC configuration
    │   │   │   └── WebConfig.java            # WebMvc & CORS configuration
    │   │   ├── controller/
    │   │   │   ├── AccountController.java    # Account management REST endpoints
    │   │   │   ├── AdminController.java      # Administration & user management endpoints
    │   │   │   ├── AuthController.java       # Login, logout & authentication endpoints
    │   │   │   ├── CustomerController.java   # Customer KYC endpoints
    │   │   │   ├── DashboardController.java  # Metrics & KPI endpoints
    │   │   │   ├── ReportController.java     # Statements & financial summary endpoints
    │   │   │   ├── TransactionController.java# Deposit & withdrawal endpoints
    │   │   │   └── TransferController.java   # Atomic fund transfer endpoints
    │   │   ├── dto/                          # Data Transfer Objects
    │   │   │   ├── AccountDto.java
    │   │   │   ├── ApiResponse.java
    │   │   │   ├── CustomerDto.java
    │   │   │   ├── DashboardStatsDto.java
    │   │   │   ├── DepositRequest.java
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── RegisterRequest.java
    │   │   │   ├── TransactionDto.java
    │   │   │   ├── TransferDto.java
    │   │   │   ├── TransferRequest.java
    │   │   │   ├── UserDto.java
    │   │   │   └── WithdrawRequest.java
    │   │   ├── entity/                       # JPA Database Entities
    │   │   │   ├── Account.java
    │   │   │   ├── AccountStatus.java
    │   │   │   ├── AccountType.java
    │   │   │   ├── AuditLog.java
    │   │   │   ├── Customer.java
    │   │   │   ├── Role.java
    │   │   │   ├── Transaction.java
    │   │   │   ├── TransactionStatus.java
    │   │   │   ├── TransactionType.java
    │   │   │   ├── Transfer.java
    │   │   │   └── User.java
    │   │   ├── exception/                    # Global Exception Handling
    │   │   │   ├── BankingException.java
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   ├── InsufficientBalanceException.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── repository/                   # Spring Data JPA Repositories
    │   │   │   ├── AccountRepository.java
    │   │   │   ├── AuditLogRepository.java
    │   │   │   ├── CustomerRepository.java
    │   │   │   ├── TransactionRepository.java
    │   │   │   ├── TransferRepository.java
    │   │   │   └── UserRepository.java
    │   │   ├── security/
    │   │   │   ├── CustomUserDetailsService.java
    │   │   │   └── SecurityUtils.java
    │   │   └── service/                      # Transactional Business Services
    │   │       ├── AccountService.java
    │   │       ├── AuditLogService.java
    │   │       ├── CustomerService.java
    │   │       ├── DashboardService.java
    │   │       ├── ReportService.java
    │   │       ├── TransactionService.java
    │   │       ├── TransferService.java
    │   │       └── UserService.java
    │   └── resources/
    │       ├── application.properties        # Master application properties
    │       ├── application-h2.properties     # Zero-configuration H2 in-memory profile
    │       ├── application-mysql.properties  # MySQL database production profile
    │       └── static/                       # Frontend Single Page Web Application
    │           ├── index.html                # Responsive UI layout & view templates
    │           ├── css/
    │           │   ├── styles.css            # Enterprise banking styling system
    │           │   └── print.css             # A4 print stylesheets for receipts/statements
    │           └── js/
    │               ├── accounts.js           # Account actions controller
    │               ├── admin.js              # Admin & audit controller
    │               ├── api.js                # Centralized REST API client
    │               ├── app.js                # App orchestrator & router
    │               ├── auth.js               # Auth & RBAC manager
    │               ├── customers.js          # Customer management controller
    │               ├── dashboard.js          # Chart.js & metrics controller
    │               ├── reports.js            # Statement generator controller
    │               ├── transactions.js       # Deposit & withdrawal controller
    │               └── transfers.js          # Fund transfer controller
    └── test/
        └── java/com/bank/
            └── BankingApplicationTests.java  # Spring Boot Context verification test
```

---

## 7. Step-by-Step Installation & Execution Guide

### Prerequisites
1. **Java Development Kit (JDK 17 or higher)** installed (`java -version`).
2. **VS Code** (with Extension Pack for Java) OR **IntelliJ IDEA**.
3. *(Optional)* **MySQL Server 8.0+** (Default configuration works out of the box with zero-setup H2).

---

### Execution Option A: Zero-Configuration Instant Run (Recommended for Lab Demos & Viva)

The application includes an embedded in-memory database profile (`h2`) with automated startup data seeding. **No MySQL installation or database creation is needed.**

1. Open your terminal in this project root directory:
   ```powershell
   cd "c:\Users\Srinivas\OneDrive\Documents\New folder"
   ```
2. Run the application using the Maven Wrapper:
   * **On Windows**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **On Linux / macOS**:
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080/
   ```
4. Click **Sign In** and use one of the pre-filled demo accounts (e.g. `admin` / `admin123`).
5. *(Optional)* To inspect the database tables directly via H2 Web Console, navigate to `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:mem:banking_db` and Username `sa` (Password empty).

---

### Execution Option B: MySQL Database Run (Evaluation Standard)

1. Ensure MySQL Server is running on port `3306`.
2. Create the database and import the schema and sample data:
   * Using MySQL Command-Line Client:
     ```bash
     mysql -u root -p < database/schema.sql
     mysql -u root -p < database/sample_data.sql
     ```
   * Or open `database/schema.sql` and `database/sample_data.sql` in **MySQL Workbench** / **phpMyAdmin** and execute them.
3. In `src/main/resources/application.properties`, activate the MySQL profile:
   ```properties
   spring.profiles.active=mysql
   ```
4. Verify your MySQL username and password in `src/main/resources/application-mysql.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=root
   ```
5. Start the application:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
6. Access the portal at `http://localhost:8080/`.

---

## 8. REST API Reference

| Module | Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticates credentials and returns user details |
| **Auth** | `POST` | `/api/auth/register` | Public | Self-registration for retail customers |
| **Auth** | `GET` | `/api/auth/current-user` | Authenticated | Retrieves current logged-in user session |
| **Auth** | `POST` | `/api/auth/logout` | Authenticated | Terminates active user session |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Authenticated | Aggregates bank KPIs, charts, and recent activity |
| **Customers** | `GET` | `/api/customers` | Authenticated | Retrieves list of all customers |
| **Customers** | `GET` | `/api/customers/search?query=` | Authenticated | Searches customers by keyword |
| **Customers** | `GET` | `/api/customers/{id}` | Authenticated | Retrieves customer profile dossier |
| **Customers** | `POST` | `/api/customers` | Admin/Employee | Registers new customer with KYC data |
| **Customers** | `PUT` | `/api/customers/{id}` | Admin/Employee | Updates customer profile coordinates |
| **Customers** | `PATCH` | `/api/customers/{id}/status` | Admin/Employee | Toggles customer active status |
| **Accounts** | `GET` | `/api/accounts` | Authenticated | Lists all accounts |
| **Accounts** | `POST` | `/api/accounts` | Admin/Employee | Creates new bank account with initial balance |
| **Accounts** | `PATCH` | `/api/accounts/{num}/status` | Admin | Updates account status (ACTIVE/FROZEN) |
| **Transactions** | `POST` | `/api/transactions/deposit` | Admin/Employee | Credits cash to an active account |
| **Transactions** | `POST` | `/api/transactions/withdraw` | Admin/Employee | Debits cash enforcing minimum reserve |
| **Transactions** | `GET` | `/api/transactions` | Authenticated | Retrieves complete transaction ledger |
| **Transfers** | `POST` | `/api/transfers` | Authenticated | Executes atomic inter-account transfer |
| **Reports** | `GET` | `/api/reports/statement` | Authenticated | Generates certified account statement |
| **Admin** | `GET` | `/api/admin/users` | Admin | Lists all user identities |
| **Admin** | `PATCH` | `/api/admin/users/{id}/role` | Admin | Reassigns user authorization role |
| **Admin** | `GET` | `/api/admin/audit-logs` | Admin | Retrieves security audit logs |

---

## 9. Academic Project Submission Checklist
* [x] Complete normalized 3NF MySQL Database Schema (`schema.sql`)
* [x] Pre-seeded sample demonstration data (`sample_data.sql`)
* [x] Clean Java Spring Boot backend with layered architecture
* [x] Spring Security role-based access control with BCrypt hashing
* [x] ACID compliant `@Transactional` atomic money transfers
* [x] Modern responsive UI with navy blue, white, and subtle grey design system
* [x] Interactive Chart.js charts for financial metrics
* [x] Printable electronic transaction receipts and certified statements
* [x] Zero-config in-memory H2 profile for instant demonstration
* [x] Comprehensive testing documentation with test cases (`TESTING.md`)
