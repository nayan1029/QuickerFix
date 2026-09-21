# QuickerFix — Complete Implementation Guide
## From Basics to Deployment | Phase-by-Phase
**Author:** Nayan Kumar Shukla | VIT Bhopal University | B.Tech CSE  
**Tech Stack:** Java 21 · Spring Boot 3.2.5 · Spring Security 6 · JWT · PostgreSQL · React 18 · Bootstrap 5  


---

## TABLE OF CONTENTS
- [1. Project Overview](#section-1-project-overview)
- [2. System Architecture](#section-2-system-architecture)
- [3. Prerequisites & Environment Setup](#section-3-prerequisites--environment-setup)
- [4. Phase 1 — Project Foundation (pom.xml, application.properties)](#section-4-phase-1--project-foundation)
- [5. Phase 2 — Enums](#section-5-phase-2--enums)
- [6. Phase 3 — JPA Entities (Data Model)](#section-6-phase-3--jpa-entities)
- [7. Phase 4 — Repositories](#section-7-phase-4--repositories)
- [8. Phase 5 — Security Layer (JWT)](#section-8-phase-5--security-layer-jwt)
- [9. Phase 6 — Configuration & Data Seeding](#section-9-phase-6--configuration--data-seeding)
- [10. Phase 7 — DTOs](#section-10-phase-7--dtos-data-transfer-objects)
- [11. Phase 8 — Exception Handling](#section-11-phase-8--exception-handling)
- [12. Phase 9 — Utility Classes (Algorithms)](#section-12-phase-9--utility-classes)
- [13. Phase 10 — Services (Business Logic)](#section-13-phase-10--services-business-logic)
- [14. Phase 11 — Controllers (REST API)](#section-14-phase-11--controllers-rest-api)
- [15. Phase 12 — Frontend (React + Bootstrap 5)](#section-15-phase-12--frontend-react--bootstrap-5)
- [**ENHANCED FEATURES - NEW**](#enhanced-features)
  - [20. Aadhar & OTP Identity Verification](#section-20-aadhar--otp-identity-verification)
  - [21. Admin Registration & Verification System](#section-21-admin-registration--verification-system)
  - [22. Location Intelligence (Google Maps & State/District DB)](#section-22-location-intelligence)
  - [23. Real-Time Chat System](#section-23-real-time-chat-system)
  - [24. Announcements & Notifications System](#section-24-announcements--notifications-system)
  - [25. Identity Verification Workflow](#section-25-identity-verification-workflow)
- [26. Running the Application](#section-26-running-the-application)
- [27. Docker Deployment](#section-27-docker-deployment)
- [28. REST API Reference](#section-28-complete-rest-api-reference)
- [29. TCS Interview Q&A](#section-29-tcs-interview-preparation)

---

## SECTION 1: Project Overview

### 1.1 What is QuickerFix?
A citizen-facing full-stack platform where residents report civic problems (potholes, broken streetlights, garbage, water leakage, fallen trees, etc.) with photos and GPS location. Reports follow an 8-stage tracked lifecycle, are intelligently prioritized by a weighted algorithm, assigned to municipal workers by admins, resolved with photographic proof, and confirmed by the citizen before closure.

### 1.2 The Problem It Solves
- Citizens have no way to track if their complaint was acted upon
- Multiple people report the same pothole → wasteful duplicate work orders
- Workers have no priority system — they fix random issues
- No accountability — workers can mark issues resolved without fixing them
- No citizen verification before closure

### 1.3 The Solution — Feature Table
| Problem | QuickerFix Solution |
|---------|--------------------|
| No tracking | 8-stage lifecycle with real-time status updates |
| Duplicates | Haversine 100m radius + category matching auto-merges duplicates |
| No priority | Weighted scoring algorithm (Severity + Age + Duplicates + Upvotes + Location) |
| No accountability | Workers must upload photographic proof of resolution |
| No verification | Citizens verify and confirm closure (or reopen if unsatisfied) |
| Unfair closure | CITIZEN_VERIFICATION stage — citizen has final say |
| False complaints | **Aadhar-based identity verification with OTP** — prevents fraudulent complaints |
| Rogue admins | **Admin registration + verification** with designation/post transparency |
| Wrong location | **Google Maps API + State/District DB** — precise geo-location tracking |
| No communication | **Real-time chat** between citizens ↔ admins ↔ workers |
| Lack of awareness | **Announcements system** for government notifications & essential updates |
| Identity fraud | **Multi-tier identity verification** — admin verifies Aadhar authenticity |

### 1.4 Complete 8-Stage Complaint Lifecycle
```text
REPORTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CITIZEN_VERIFICATION → CLOSED
                                                                                  ↓ (citizen rejects)
                                                                            REOPENED → IN_PROGRESS
```

| Stage | Who Acts | What Happens |
|-------|----------|--------------|
| REPORTED | Citizen | Submits with photo, GPS, category, severity |
| UNDER_REVIEW | Admin | Reviews the complaint for validity |
| VERIFIED | Admin | Confirms it is a real civic issue |
| ASSIGNED | Admin | Assigns a worker from matching department |
| IN_PROGRESS | Worker | Accepts assignment, starts work |
| RESOLVED | Worker | Uploads proof photo, marks complete |
| CITIZEN_VERIFICATION | Citizen | Notified to verify worker's proof |
| CLOSED | Citizen | Confirms fix. Optional 1-5 star rating. |
| REOPENED | Citizen | Rejects proof with reason → back to IN_PROGRESS |

### 1.5 Priority Scoring Algorithm
```text
Priority Score (0–100) =
  Severity Score      (max 30) — CRITICAL=30, HIGH=25, MEDIUM=15, LOW=5
+ Duplicate Reports   (max 25) — duplicateCount × 2.5, capped at 25
+ Age Score           (max 20) — daysOld × 2, capped at 20
+ Upvote Score        (max 15) — upvotes × 0.5, capped at 15
+ Location Score      (max 10) — default 5 (extensible per area importance)
```

**Example:**
| Complaint | Severity | Duplicates | Age | Upvotes | Total Score |
|-----------|----------|------------|-----|---------|-------------|
| Water leakage (7 days, 5 dupes, 8 upvotes) | 30 | 12.5 | 14 | 4 | 65.5 |
| Broken bench (new, 0 dupes, 0 upvotes) | 5 | 0 | 0 | 0 | 10 |

The water leakage is 6× higher priority — critical infrastructure comes first.

**Anti-Starvation:** Age score ensures old low-severity complaints eventually climb the queue.

### 1.6 Duplicate Detection
When citizen submits a report:
1. Extract lat/lng
2. Query DB: all non-CLOSED reports within 100m radius using Haversine formula, same category
3. If match found → increment original's `duplicateCount` → recalculate priority → return original report (no new report created)
4. Saves municipal resources — 1 work order instead of 10 for the same pothole

### 1.7 Roles & Access Control
| Role | What They Can Do |
|------|------------------|
| CITIZEN | Submit reports (Aadhar-verified), upvote, comment, verify/reject resolution, rate, chat with admin |
| WORKER | View assigned tasks, accept/reject assignments, upload resolution proof, chat with citizen/admin |
| ADMIN | Verify reports, verify citizen identity (Aadhar), assign workers, manage users/categories/departments, broadcast announcements, chat with citizens, view analytics |

### 1.8 Enhanced Features — Aadhar, Admin Verification, Location Intelligence, Chat & Announcements

#### A. Aadhar-Based Identity Verification
- **Citizen Registration Flow:**
  1. Citizen enters Aadhar number during registration
  2. System validates Aadhar format and generates OTP
  3. OTP sent to registered mobile number (via SMS/Email)
  4. Citizen verifies OTP — identity confirmed
  5. Report submission only allowed for verified citizens
  6. Prevents duplicate accounts and false complaints

- **Database Integration:**
  - `aadhar_records` table: Stores verified Aadhar mappings (encrypted)
  - `otp_records` table: OTP generation, validation, expiry tracking (5-minute expiry)
  - `identity_verification_logs` table: Audit trail of all verification attempts

#### B. Admin Registration & Verification System
- **Admin Registration Process:**
  1. Admin enters: name, email, phone, Aadhar, designation, post, department
  2. System generates unique admin ID
  3. Status: `PENDING_VERIFICATION` → `VERIFIED` → `ACTIVE`
  4. Super-admin reviews credentials and approves
  5. Admin receives login credentials via secure email
  6. First login requires password change
  7. Admin profile shows designation/post for transparency

- **Transparency Features:**
  - Public "Admins Directory" showing all verified admins with designations
  - Audit trail: Who verified each admin, timestamp, reasons
  - Department mapping: Citizens know which admin oversees their area

#### C. Google Maps API & State/District Database
- **Hierarchical Geographic Database:**
  - `states` table: All Indian states (28 states + 8 UTs)
  - `districts` table: 750+ districts with state_id FK
  - `areas_or_zones` table: Sub-district localities with coordinates
  - Location hierarchy: State → District → Area/Zone

- **Google Maps Integration:**
  - Frontend: Google Maps embed for real-time location selection
  - Citizen drops pin → auto-fills address via reverse geocoding
  - Geocoding API: Converts address to lat/lng
  - Distance Matrix API: Calculates distance between complaint and worker
  - Route optimization: Admin assigns workers closest to issue location

- **Duplicate Detection Enhancement:**
  - Original Haversine 100m radius now geo-zone aware
  - Detects duplicates within same state/district only (avoids false matches)
  - Automatic: If duplicate found → original report gets +1 to duplicateCount → priority recalculated

#### D. Real-Time Chat System
- **Chat Participants:**
  - Citizen ↔ Assigned Admin (status updates, clarifications)
  - Admin ↔ Assigned Worker (task coordination)
  - Worker ↔ Citizen (work progress updates)

- **Database:**
  - `chat_messages` table: message_id, sender_id, receiver_id, report_id, content, timestamp, is_read
  - `chat_rooms` table: report_id, participants, created_at, archived (one room per report)

- **Features:**
  - Real-time delivery via WebSocket (optional) or polling
  - Message history searchable per report
  - Attachments: Photos, documents within chat
  - Read receipts: "Message read at HH:MM:SS"
  - Typing indicators: "Admin is typing..."
  - Archive old chats when report closed

#### E. Announcements & Notifications System
- **Announcement Types:**
  1. **System Announcements:** Platform maintenance, new features
  2. **Area Announcements:** Specific to districts/zones (e.g., "Road work in XYZ area next week")
  3. **Category Announcements:** Relevant to complaint types (e.g., "Water supply alert for pothole reports")
  4. **Emergency Alerts:** High-priority notifications requiring immediate action

- **Database:**
  - `announcements` table: announcement_id, title, content, created_by_id (admin), scope (ALL/DISTRICT/CATEGORY), target_location, created_at, expires_at, priority
  - `announcement_reads` table: announcement_id, user_id, read_at (for tracking citizen engagement)

- **Delivery Channels:**
  - In-app dashboard widget (featured announcements)
  - Email notifications (daily digest)
  - SMS push for high-priority alerts
  - Admin broadcast dashboard to create/schedule announcements

#### F. Multi-Tier Identity Verification Workflow
```text
┌─────────────────────────────────────────┐
│  Citizen Registers with Aadhar & OTP    │
│  (Identity verified by AADHAAR DB)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Citizen Submits Complaint               │
│  (Aadhar-verified citizen only)          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Admin Reviews Complaint                 │
│  - Checks citizen Aadhar match            │
│  - Validates complaint authenticity       │
│  - May request additional verification   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Status: VERIFIED (Identity confirmed)   │
│  Proceed to ASSIGNED stage               │
└─────────────────────────────────────────┘
```

---

## SECTION 2: System Architecture

### 2.1 High-Level Architecture
```text
┌─────────────────────────────────────────────────────────────────┐
│         React Frontend (Port 3000)                               │
│  Bootstrap 5 · Axios · React Router v6 · Google Maps SDK        │
│  Real-time Chat (WebSocket) · Google Geolocation API            │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTP/JSON + JWT Bearer Token + WebSocket
┌─────────────────▼───────────────────────────────────────────────┐
│      Spring Boot Backend (Port 8080)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Spring Security + JWT Filter + OTP Validation           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Controller Layer (REST APIs)    │     │
│  ├─────────────────────────────────┤     │
│  │ Service Layer (Business Logic)  │     │
│  ├─────────────────────────────────┤     │
│  │ Repository Layer (JPA Queries)  │     │
│  └─────────────┬───────────────────┘     │
└────────────────┼────────────────────────┘
                 │ JDBC
┌────────────────▼────────────────────────┐
│         PostgreSQL (Port 5432)           │
│           Database: quickerfix_db        │
└─────────────────────────────────────────┘
                 │
         /uploads directory
    (local file storage for photos)
```

### 2.2 Backend Package Structure
```text
com.quickerfix/
├── QuickerFixApplication.java     ← Main class
├── config/
│   ├── SecurityConfig.java        ← Spring Security filter chain
│   ├── CorsConfig.java            ← CORS settings
│   ├── FileStorageConfig.java     ← Upload directory setup
│   └── DataSeeder.java            ← Auto-seeds DB on first run
├── enums/
│   ├── Role.java                  ← CITIZEN, WORKER, ADMIN
│   ├── ReportStatus.java          ← 9 lifecycle stages
│   ├── Severity.java              ← LOW, MEDIUM, HIGH, CRITICAL
│   ├── NotificationType.java      ← Notification categories
│   └── AssignmentStatus.java      ← PENDING, ACCEPTED, REJECTED, COMPLETED
├── entity/
│   ├── User.java                  ← Implements UserDetails
│   ├── Department.java
│   ├── Category.java
│   ├── Report.java                ← Core entity
│   ├── Assignment.java
│   ├── Comment.java
│   ├── Notification.java
│   ├── StatusHistory.java
│   ├── Attachment.java
│   └── Rating.java
├── repository/
│   ├── UserRepository.java
│   ├── ReportRepository.java      ← Custom Haversine JPQL query
│   ├── CategoryRepository.java
│   ├── DepartmentRepository.java
│   ├── AssignmentRepository.java
│   ├── CommentRepository.java
│   ├── NotificationRepository.java
│   ├── StatusHistoryRepository.java
│   ├── AttachmentRepository.java
│   └── RatingRepository.java
├── security/
│   ├── JwtService.java            ← JWT create/validate (JJWT 0.12.3)
│   ├── JwtFilter.java             ← OncePerRequestFilter
│   └── UserDetailsServiceImpl.java
├── dto/
│   ├── request/                   ← 8 inbound DTOs with @Valid
│   └── response/                  ← 6 outbound DTOs
├── exception/
│   ├── ResourceNotFoundException.java  → 404
│   ├── UnauthorizedException.java      → 403
│   ├── InvalidStatusTransitionException.java → 400
│   ├── DuplicateReportException.java   → 409
│   └── GlobalExceptionHandler.java     ← @RestControllerAdvice
├── service/
│   ├── AuthService.java
│   ├── ReportService.java         ← Most complex
│   ├── AssignmentService.java
│   ├── AdminService.java
│   ├── WorkerService.java
│   ├── NotificationService.java
│   ├── PriorityService.java       ← @Scheduled hourly recalculation
│   └── FileStorageService.java
├── controller/
│   ├── AuthController.java
│   ├── ReportController.java
│   ├── AdminController.java
│   ├── WorkerController.java
│   ├── NotificationController.java
│   ├── CategoryController.java
│   └── DepartmentController.java
└── util/
    ├── LocationUtils.java         ← Haversine distance formula
    └── PriorityCalculator.java    ← Scoring algorithm
```

### 2.3 Database Schema — All 11 Tables

**users** — stores all platform users
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password | VARCHAR(255) | NOT NULL (BCrypt hash) |
| phone | VARCHAR(20) | - |
| role | VARCHAR(20) | NOT NULL (CITIZEN/WORKER/ADMIN) |
| department_id | BIGINT | FK → departments (nullable) |
| enabled | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |

**departments** — municipal departments
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(255) | UNIQUE NOT NULL |
| description | TEXT | - |
| contact_email | VARCHAR(255) | - |
| active | BOOLEAN | DEFAULT true |

**categories** — problem categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(255) | UNIQUE NOT NULL |
| description | TEXT | - |
| icon | VARCHAR(10) | Emoji icon |
| department_id | BIGINT | FK → departments |
| active | BOOLEAN | DEFAULT true |

**reports** — civic complaint reports (CORE TABLE)
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | - |
| category_id | BIGINT | FK → categories NOT NULL |
| citizen_id | BIGINT | FK → users NOT NULL |
| latitude | DOUBLE PRECISION | - |
| longitude | DOUBLE PRECISION | - |
| address | VARCHAR(500) | - |
| severity | VARCHAR(20) | LOW/MEDIUM/HIGH/CRITICAL |
| status | VARCHAR(30) | 9 lifecycle values |
| priority_score | INT | DEFAULT 0, range 0-100 |
| upvote_count | INT | DEFAULT 0 |
| duplicate_count | INT | DEFAULT 0 |
| marked_as_duplicate | BOOLEAN | DEFAULT false |
| duplicate_of_report_id | BIGINT | Nullable |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |
| resolved_at | TIMESTAMP | Set when worker resolves |
| closed_at | TIMESTAMP | Set when citizen confirms |

**assignments** — worker task assignments
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| report_id | BIGINT | FK → reports NOT NULL |
| worker_id | BIGINT | FK → users NOT NULL |
| assigned_by_id | BIGINT | FK → users (admin) |
| status | VARCHAR(20) | PENDING/ACCEPTED/REJECTED/COMPLETED |
| rejection_reason | TEXT | Nullable |
| assigned_at | TIMESTAMP | Auto-set |
| accepted_at | TIMESTAMP | Nullable |
| completed_at | TIMESTAMP | Nullable |

**comments** — discussion thread on reports
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| report_id | BIGINT | FK → reports NOT NULL |
| author_id | BIGINT | FK → users NOT NULL |
| content | TEXT | NOT NULL, max 1000 chars |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |

**notifications** — in-app notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| recipient_id | BIGINT | FK → users NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| message | TEXT | NOT NULL |
| type | VARCHAR(30) | NotificationType enum |
| read | BOOLEAN | DEFAULT false |
| related_report_id | BIGINT | Nullable |
| created_at | TIMESTAMP | Auto-set |

**status_history** — audit trail of all status changes
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| report_id | BIGINT | FK → reports NOT NULL |
| changed_by_id | BIGINT | FK → users NOT NULL |
| old_status | VARCHAR(30) | Nullable (null on creation) |
| new_status | VARCHAR(30) | NOT NULL |
| remark | TEXT | Optional admin/worker notes |
| changed_at | TIMESTAMP | Auto-set |

**attachments** — uploaded photos
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| report_id | BIGINT | FK → reports NOT NULL |
| uploaded_by_id | BIGINT | FK → users NOT NULL |
| file_name | VARCHAR(255) | NOT NULL |
| file_url | VARCHAR(500) | NOT NULL (relative URL) |
| file_type | VARCHAR(50) | e.g. image/jpeg |
| file_size | BIGINT | In bytes |
| is_resolution_proof | BOOLEAN | DEFAULT false (true = worker proof) |
| uploaded_at | TIMESTAMP | Auto-set |

**ratings** — citizen satisfaction ratings
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| report_id | BIGINT | FK → reports UNIQUE (one rating per report) |
| citizen_id | BIGINT | FK → users NOT NULL |
| score | INT | NOT NULL, CHECK 1-5 |
| comment | TEXT | Optional |
| created_at | TIMESTAMP | Auto-set |

---

## SECTION 3: Prerequisites & Environment Setup

### 3.1 Required Software
| Software | Version | Where to Download | Purpose |
|----------|---------|-------------------|----------|
| JDK 21 | 21.0.11 LTS | adoptium.net | Java runtime for Spring Boot |
| Apache Maven | 3.9.x | maven.apache.org | Build and dependency management |
| Node.js | 18.x or 20.x | nodejs.org | React development server |
| npm | 9.x+ | Bundled with Node.js | Frontend package manager |
| PostgreSQL | 15 or 16 | postgresql.org | Relational database server |
| pgAdmin 4 | Latest | pgadmin.org | GUI client for PostgreSQL |
| Git | Latest | git-scm.com | Version control |
| IntelliJ IDEA | Community | jetbrains.com | Java/Spring Boot IDE |
| VS Code | Latest | code.visualstudio.com | React/JavaScript IDE |
| Postman | Latest | postman.com | REST API testing |

### 3.2 Step-by-Step Environment Setup

#### Step 1: Verify Java 21
```powershell
java -version
# Expected output:
# openjdk version "21.0.11" 2025-04-15 LTS
```
> ⚠️ **Important:** This project requires Java 21. If your default Java is a higher version (22, 23, 25), you MUST set JAVA_HOME to point to your Java 21 installation before running Maven.

**Windows — set JAVA_HOME for current session:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.11"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
java -version   # should now show 21
```

**Windows — set permanently:**
1. Search → "Environment Variables" → System Properties → Environment Variables
2. Under System Variables: New → Name: `JAVA_HOME` → Value: `C:\Program Files\Java\jdk-21.0.11`
3. Edit `Path` → Add `%JAVA_HOME%\bin`

#### Step 2: Verify Maven
```powershell
mvn -version
# Expected:
# Apache Maven 3.9.16
# Java version: 21.x.x  ← must show 21, not 25
```

#### Step 3: Verify Node.js
```powershell
node --version   # v18.x.x or v20.x.x
npm --version    # 9.x.x or higher
```

#### Step 4: Set Up PostgreSQL Database

**Option A — Using pgAdmin (GUI):**
1. Open pgAdmin → Connect to your local server
2. Right-click **Databases** → **Create** → **Database**
3. Name: `quickerfix_db` → Save

**Option B — Using psql (command line):**
```sql
psql -U postgres
CREATE DATABASE quickerfix_db;
\q
```

**Option C — Using PowerShell with psql:**
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE quickerfix_db;"
```

> 💡 **Note:** Remember your PostgreSQL password — you'll need it in `application.properties`.

#### Step 5: Update application.properties

Open `D:\Desktop\QuickerFix\backend\src\main\resources\application.properties` and update:
```properties
spring.datasource.password=YOUR_ACTUAL_POSTGRES_PASSWORD
```

---

## SECTION 4: Phase 1 — Project Foundation

### Files: `pom.xml`, `application.properties`, `QuickerFixApplication.java`

### 4.1 pom.xml — Maven Configuration
**Location:** `D:\Desktop\QuickerFix\backend\pom.xml`

Explanation of each dependency group:

| Dependency | GroupId:ArtifactId | Why Needed |
|------------|-------------------|------------|
| Web Starter | spring-boot-starter-web | Embeds Tomcat, enables @RestController, @RequestMapping |
| JPA Starter | spring-boot-starter-data-jpa | Hibernate ORM, Spring Data repositories, JPQL |
| Security | spring-boot-starter-security | Authentication filter chain, @PreAuthorize, password encoding |
| Validation | spring-boot-starter-validation | @Valid, @NotBlank, @Email, @Size, @Min, @Max |
| Mail | spring-boot-starter-mail | JavaMailSender for email notifications |
| PostgreSQL | org.postgresql:postgresql | JDBC driver (runtime scope — only needed at runtime) |
| Lombok | org.projectlombok:lombok | @Data, @Builder, @NoArgsConstructor, @RequiredArgsConstructor |
| JJWT API | io.jsonwebtoken:jjwt-api:0.12.3 | JWT creation/parsing interface |
| JJWT Impl | io.jsonwebtoken:jjwt-impl:0.12.3 | JWT implementation (runtime scope) |
| JJWT Jackson | io.jsonwebtoken:jjwt-jackson:0.12.3 | JSON serialization for JWT claims |
| Springdoc | springdoc-openapi-starter-webmvc-ui:2.3.0 | Swagger UI at /swagger-ui.html |

**Why `<java.version>21</java.version>`?**
Lombok annotation processor has compatibility issues with Java 22+ (especially Java 25 which has internal compiler API changes). Java 21 (LTS) is the stable choice.

**Why `annotationProcessorPaths` in maven-compiler-plugin?**
This explicitly tells the Java compiler to use Lombok's annotation processor at compile time, which generates getters/setters/builders. Without this, some Java versions skip Lombok processing.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <source>21</source>
        <target>21</target>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.32</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

### 4.2 application.properties — Configuration Reference

```properties
# ========================
# APPLICATION
# ========================
spring.application.name=quickerfix
server.port=8080

# ========================
# DATABASE (PostgreSQL)
# ========================
spring.datasource.url=jdbc:postgresql://localhost:5432/quickerfix_db
spring.datasource.username=postgres
spring.datasource.password=postgres      # ← CHANGE THIS to your password
spring.datasource.driver-class-name=org.postgresql.Driver

# ========================
# JPA / HIBERNATE
# ========================
spring.jpa.hibernate.ddl-auto=update    # auto-creates/updates tables from entities
spring.jpa.show-sql=true                # logs SQL queries to console
spring.jpa.properties.hibernate.format_sql=true   # pretty-prints SQL
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ========================
# JWT SETTINGS
# ========================
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration=86400000             # 86400000ms = 24 hours

# ========================
# FILE UPLOAD
# ========================
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=uploads                  # relative to where backend runs

# ========================
# EMAIL (configure later)
# ========================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# ========================
# LOGGING
# ========================
logging.level.com.quickerfix=DEBUG

# ========================
# SWAGGER
# ========================
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### 4.3 QuickerFixApplication.java

```java
@SpringBootApplication    // = @Configuration + @EnableAutoConfiguration + @ComponentScan
@EnableScheduling          // enables @Scheduled annotations (used in PriorityService)
public class QuickerFixApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuickerFixApplication.class, args);
    }
}
```

**What `@SpringBootApplication` does:**
- `@Configuration`: This class is a Spring configuration source
- `@EnableAutoConfiguration`: Spring Boot auto-configures beans based on classpath (detects PostgreSQL, JPA, Security)
- `@ComponentScan`: Scans `com.quickerfix` and all sub-packages for @Component, @Service, @Repository, @Controller

---

## SECTION 5: Phase 2 — Enums

### Why Enums?
Type-safe constants stored as VARCHAR in the database. Prevents invalid string values like `role = "SUPERADMIN"`. Enables switch statements and pattern matching.

### Role.java
```java
public enum Role { CITIZEN, WORKER, ADMIN }
```
Used in: User entity, SecurityConfig (`hasRole('ADMIN')`), @PreAuthorize checks.
Note: Spring Security prepends `ROLE_` automatically — so `hasRole('ADMIN')` checks for `ROLE_ADMIN`.

### ReportStatus.java — Most Complex Enum
9 values: `REPORTED, UNDER_REVIEW, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, CITIZEN_VERIFICATION, CLOSED, REOPENED`

Includes `canTransitionTo(ReportStatus next)` method:
```java
public boolean canTransitionTo(ReportStatus next) {
    return switch (this) {
        case REPORTED           -> next == UNDER_REVIEW;
        case UNDER_REVIEW       -> next == VERIFIED || next == REPORTED;
        case VERIFIED           -> next == ASSIGNED;
        case ASSIGNED           -> next == IN_PROGRESS;
        case IN_PROGRESS        -> next == RESOLVED;
        case RESOLVED           -> next == CITIZEN_VERIFICATION;
        case CITIZEN_VERIFICATION -> next == CLOSED || next == REOPENED;
        case REOPENED           -> next == IN_PROGRESS;
        case CLOSED             -> false;  // terminal state
    };
}
```
This prevents invalid transitions like jumping from REPORTED directly to CLOSED.

### Severity.java
```java
public enum Severity {
    LOW(5), MEDIUM(15), HIGH(25), CRITICAL(30);
    
    private final int score;
    Severity(int score) { this.score = score; }
    public int getScore() { return score; }
}
```
The `score` field is used by `PriorityCalculator` for the 30-point severity component.

### NotificationType.java
```java
public enum NotificationType {
    REPORT_SUBMITTED, REPORT_VERIFIED, REPORT_ASSIGNED,
    STATUS_UPDATED, RESOLUTION_UPLOADED, REPORT_CLOSED,
    REPORT_REOPENED, COMMENT_ADDED
}
```

### AssignmentStatus.java
```java
public enum AssignmentStatus { PENDING, ACCEPTED, REJECTED, COMPLETED }
```

---

## SECTION 6: Phase 3 — JPA Entities

### 6.1 Why These Annotations Together?
```java
@Data              // Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: JPA REQUIRES a no-args constructor
@AllArgsConstructor // Lombok: needed for @Builder to work
@Builder           // Lombok: enables builder pattern: User.builder().name("Nayan").build()
@Entity            // JPA: marks as persistent entity
@Table(name="users") // JPA: maps to "users" table (without this, uses class name)
```

> ⚠️ **`@Builder.Default` is required** when using `@Builder` with default field values:
> ```java
> @Builder.Default
> private ReportStatus status = ReportStatus.REPORTED;
> ```
> Without `@Builder.Default`, the builder ignores the default value and sets null.

### 6.2 User.java — Implements UserDetails

`User` implements Spring Security's `UserDetails` interface so it can be used directly in the security filter chain without a separate UserDetails wrapper class.

Key implementations:
```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
}

@Override
public String getUsername() {
    return email;  // email is used as username
}
```

### 6.3 Report.java — Core Entity (Most Important)
Key fields explained:
- `priorityScore`: Recalculated hourly by `PriorityService` based on the algorithm
- `upvoteCount`: Incremented when citizens upvote; affects priority
- `duplicateCount`: Incremented when duplicates are detected; heavily weighted in priority
- `markedAsDuplicate`: True if this report was merged into another
- `duplicateOfReportId`: Points to the original report this is a duplicate of
- `resolvedAt`: Set when worker uploads proof (not when closed)
- `closedAt`: Set only when citizen confirms closure

Relationships:
```java
@OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Attachment> attachments;  // when report deleted, attachments deleted too
```

### 6.4 Relationship Summary
| Relationship | From | To | Column |
|---|---|---|---|
| ManyToOne | User | Department | department_id |
| ManyToOne | Category | Department | department_id |
| ManyToOne | Report | Category | category_id |
| ManyToOne | Report | User (citizen) | citizen_id |
| ManyToOne | Assignment | Report | report_id |
| ManyToOne | Assignment | User (worker) | worker_id |
| ManyToOne | Assignment | User (admin) | assigned_by_id |
| ManyToOne | Comment | Report | report_id |
| ManyToOne | Comment | User | author_id |
| ManyToOne | Notification | User | recipient_id |
| ManyToOne | StatusHistory | Report | report_id |
| ManyToOne | Attachment | Report | report_id |
| OneToOne | Rating | Report | report_id (UNIQUE) |

---

## SECTION 7: Phase 4 — Repositories

### 7.1 What JpaRepository Gives For Free
```java
public interface UserRepository extends JpaRepository<User, Long> { }
```
This one line gives you:
- `save(entity)` — INSERT or UPDATE
- `findById(id)` — SELECT by PK
- `findAll()` — SELECT all
- `findAll(Pageable)` — paginated SELECT
- `deleteById(id)` — DELETE by PK
- `count()` — COUNT(*)
- `existsById(id)` — EXISTS check

### 7.2 Query Method Derivation
Spring Data JPA parses method names to auto-generate queries:
```java
Optional<User> findByEmail(String email);
// Generated: SELECT u FROM User u WHERE u.email = ?1

List<Assignment> findByWorkerId(Long workerId);
// Generated: SELECT a FROM Assignment a WHERE a.worker.id = ?1

List<Assignment> findByWorker(User worker);
// Generated: SELECT a FROM Assignment a WHERE a.worker = ?1

long countByRecipientIdAndRead(Long userId, boolean read);
// Generated: SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = ?1 AND n.read = ?2
```

### 7.3 Custom JPQL Query — Haversine in ReportRepository
```java
@Query("SELECT r FROM Report r WHERE " +
       "r.status NOT IN ('CLOSED') AND " +
       "r.category.id = :categoryId AND " +
       "r.markedAsDuplicate = false AND " +
       "(6371000 * acos(cos(radians(:lat)) * cos(radians(r.latitude)) * " +
       "cos(radians(r.longitude) - radians(:lng)) + " +
       "sin(radians(:lat)) * sin(radians(r.latitude)))) < :radiusMeters")
List<Report> findNearbyOpenReports(
    @Param("lat") Double lat,
    @Param("lng") Double lng,
    @Param("radiusMeters") Double radiusMeters,
    @Param("categoryId") Long categoryId
);
```
This runs the Haversine formula directly in SQL for database-level efficiency — no Java post-filtering.

### 7.4 Pagination Example
```java
// In ReportService:
Page<Report> page = reportRepository.findAll(PageRequest.of(pageNum, pageSize, Sort.by("priorityScore").descending()));

// Returns: content (list), totalElements, totalPages, currentPage
```

---

## SECTION 8: Phase 5 — Security Layer (JWT)

### 8.1 How JWT Authentication Works
```text
1. Client: POST /api/auth/login { email, password }
2. Server: AuthenticationManager validates credentials
3. Server: Generates JWT:
   Header: { alg: HS256, typ: JWT }
   Payload: { sub: email, role: ADMIN, iat: now, exp: now+24h }
   Signature: HMAC-SHA256(header.payload, secretKey)
4. Server returns: { token: "eyJhbGc..." }
5. Client stores token in localStorage
6. Every request: Authorization: Bearer eyJhbGc...
7. JwtFilter extracts token → validates → sets SecurityContext
8. Controller executes with user authenticated
```

### 8.2 JwtService.java — Key Methods

```java
// Generate token
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", ((User)userDetails).getRole().name());
    return Jwts.builder()
            .claims(claims)
            .subject(userDetails.getUsername())  // email
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey())             // HMAC-SHA256
            .compact();
}

// Get signing key from Base64 secret in properties
private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
}

// Validate: username matches AND not expired
public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
}
```

### 8.3 JwtFilter.java — Request Interception
```text
Every HTTP request passes through:
┌─────────────────────────────────────────────────┐
│ JwtFilter (extends OncePerRequestFilter)         │
│                                                  │
│ 1. Check Authorization header                    │
│    → No header? Skip filter, proceed as anonymous│
│ 2. Extract token after "Bearer "                 │
│ 3. Extract username (email) from token           │
│ 4. Load UserDetails from DB by email             │
│ 5. isTokenValid(token, userDetails)?             │
│    → No? Proceed as anonymous (403 later)        │
│ 6. Create UsernamePasswordAuthenticationToken    │
│ 7. Set in SecurityContextHolder                  │
│ 8. Pass to next filter                           │
└─────────────────────────────────────────────────┘
```

### 8.4 SecurityConfig.java — The Filter Chain

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)           // REST API = no CSRF
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS)) // No sessions
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(POST, "/api/auth/**").permitAll()       // Public
            .requestMatchers(GET, "/api/reports/**").permitAll()      // Public
            .requestMatchers(GET, "/api/categories/**").permitAll()   // Public
            .requestMatchers(GET, "/api/departments/**").permitAll()  // Public
            .requestMatchers("/api/admin/**").hasRole("ADMIN")        // Admin only
            .requestMatchers("/api/worker/**").hasRole("WORKER")      // Worker only
            .anyRequest().authenticated()                              // Everything else needs auth
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### 8.5 Password Security
- Passwords stored as BCrypt hash (salted, 10 rounds by default)
- `BCryptPasswordEncoder` bean registered in SecurityConfig
- Even if DB is compromised, original passwords cannot be recovered
- Example: `"admin123"` → `"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`

---

## SECTION 9: Phase 6 — Configuration & Data Seeding

### 9.1 CorsConfig.java
Cross-Origin Resource Sharing — allows the React frontend (port 3000) to call the Spring Boot backend (port 8080).
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

### 9.2 FileStorageConfig.java
Creates `uploads/` directory on startup:
```java
@PostConstruct
public void init() {
    try {
        Files.createDirectories(getUploadPath());
    } catch (IOException e) {
        throw new RuntimeException("Cannot create uploads directory", e);
    }
}
```
Files are served statically by adding resource handler in WebMvcConfigurer (or via Spring's static resource serving).

### 9.3 DataSeeder.java — Auto-Seed on First Startup

Implements `CommandLineRunner` — Spring calls `run()` after context loads.

**Departments seeded:**
| Name | Email |
|------|-------|
| Roads & Infrastructure | roads@quickerfix.gov |
| Electrical & Street Lighting | electrical@quickerfix.gov |
| Sanitation & Waste Management | sanitation@quickerfix.gov |
| Water & Sewage | water@quickerfix.gov |
| Parks & Environment | parks@quickerfix.gov |

**Categories seeded:**
| Name | Icon | Department |
|------|------|------------|
| Potholes | 🕳️ | Roads |
| Damaged Roads | 🛣️ | Roads |
| Broken Streetlights | 💡 | Electrical |
| Electrical Hazards | ⚡ | Electrical |
| Garbage Accumulation | 🗑️ | Sanitation |
| Water Leakage | 🚰 | Water |
| Fallen Trees | 🌳 | Parks |
| Public Infrastructure | 🚧 | Roads |

**Demo users seeded:**
| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@quickerfix.com | admin123 |
| WORKER (Roads) | worker.roads@quickerfix.com | worker123 |
| WORKER (Sanitation) | worker.sanitation@quickerfix.com | worker123 |
| CITIZEN | citizen@quickerfix.com | citizen123 |

---

## SECTION 10: Phase 7 — DTOs (Data Transfer Objects)

### 10.1 Why DTOs?
| Without DTOs | With DTOs |
|---|---|
| Password hash exposed in API response | Only safe fields returned |
| Lazy-loaded collections cause N+1 or serialization errors | Controlled data shaping |
| API contract tied to DB schema | Schema can change without breaking API |
| No input validation layer | @Valid annotations enforce rules |

### 10.2 ApiResponse<T> — Universal Wrapper
All API responses use this generic wrapper:
```java
@Data @Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    // Factory methods
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true).message(message).data(data).build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false).message(message).build();
    }
}
```

Every API response looks like:
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": { "id": 42, "title": "Pothole on MG Road", "category": "Potholes", "status": "REPORTED" },
  "timestamp": "2026-08-29T22:00:00"
}
```

### 10.3 Request DTOs with Validation
```java
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank @Email(message = "Valid email required")
    private String email;
    
    @NotBlank @Size(min = 6, message = "Password min 6 characters")
    private String password;
    
    private String phone;
    private Role role = Role.CITIZEN;  // default
    private Long departmentId;         // required if role=WORKER
}
```

---

## SECTION 11: Phase 8 — Exception Handling

### 11.1 Exception Hierarchy
```text
RuntimeException
├── ResourceNotFoundException     → 404 Not Found
├── UnauthorizedException         → 403 Forbidden
├── InvalidStatusTransitionException → 400 Bad Request
└── DuplicateReportException      → 409 Conflict
    └── (has field: Long originalReportId)
```

### 11.2 GlobalExceptionHandler — Centralized Error Response
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<?> handleNotFound(ResourceNotFoundException ex) {
        return ApiResponse.error(ex.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors()
            .stream()
            .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
        return ApiResponse.error("Validation failed: " + errors);
    }
    
    // ... other handlers
}
```

---

## SECTION 12: Phase 9 — Utility Classes

### 12.1 LocationUtils — Haversine Formula
The Haversine formula calculates the great-circle distance between two GPS coordinates on Earth's sphere.

```java
@Component
public class LocationUtils {
    private static final double EARTH_RADIUS_METERS = 6371000;
    
    public double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double φ1 = Math.toRadians(lat1);
        double φ2 = Math.toRadians(lat2);
        double Δφ = Math.toRadians(lat2 - lat1);
        double Δλ = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                   Math.cos(φ1) * Math.cos(φ2) *
                   Math.sin(Δλ/2) * Math.sin(Δλ/2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return EARTH_RADIUS_METERS * c;  // distance in meters
    }
    
    public boolean isWithinRadius(double lat1, double lng1, double lat2, double lng2, double radiusMeters) {
        return calculateDistance(lat1, lng1, lat2, lng2) <= radiusMeters;
    }
}
```

### 12.2 PriorityCalculator — Scoring Algorithm
```java
@Component
public class PriorityCalculator {
    
    public int calculate(Report report) {
        // Component 1: Severity (max 30)
        int severityScore = report.getSeverity().getScore(); // uses Severity.score field
        
        // Component 2: Upvotes (max 15)
        int upvoteScore = (int) Math.min(report.getUpvoteCount() * 0.5, 15);
        
        // Component 3: Age/starvation prevention (max 20)
        long daysOld = ChronoUnit.DAYS.between(report.getCreatedAt(), LocalDateTime.now());
        int ageScore = (int) Math.min(daysOld * 2, 20);
        
        // Component 4: Duplicate count (max 25)
        int duplicateScore = (int) Math.min(report.getDuplicateCount() * 2.5, 25);
        
        // Component 5: Location importance (max 10)
        int locationScore = 5; // extensible — could factor in road type, area population
        
        return Math.min(
            severityScore + upvoteScore + ageScore + duplicateScore + locationScore,
            100 // hard cap
        );
    }
}
```

---

## SECTION 13: Phase 10 — Services (Business Logic)

### 13.1 AuthService
| Method | Logic |
|--------|-------|
| `register()` | Check email unique → Encode password (BCrypt) → Build User → Save → Generate JWT → Return AuthResponse |
| `login()` | `authManager.authenticate()` → Load UserDetails → Generate JWT → Return AuthResponse |
| `getCurrentUser()` | Find by email → Map to UserResponse (excludes password) |

### 13.2 ReportService — Most Complex

**`createReport()` full flow:**
```text
1. Find citizen User by email
2. Find Category by categoryId
3. If lat/lng provided:
   a. Query findNearbyOpenReports(lat, lng, 100m, categoryId)
   b. If results found → increment duplicateCount on original → recalculate priority → return original
4. Build Report entity (status=REPORTED, initial priorityScore=0)
5. Save Report to DB (gets ID)
6. For each uploaded photo: FileStorageService.storeFile() → save Attachment
7. Calculate initial priority: PriorityCalculator.calculate(report)
8. Save StatusHistory (null → REPORTED, changedBy = citizen)
9. Map to ReportResponse and return
```

**`updateStatus()` flow:**
```text
1. Load Report by ID
2. Load User by email
3. Validate: report.status.canTransitionTo(newStatus) → else throw InvalidStatusTransitionException
4. Save StatusHistory record (oldStatus → newStatus, who changed it, remark)
5. Update report.status
6. If newStatus == RESOLVED: set report.resolvedAt = now
7. If newStatus == CLOSED: set report.closedAt = now
8. Save report
9. NotificationService.notifyStatusChange(report, newStatus) → notify citizen
10. Return updated ReportResponse
```

### 13.3 AssignmentService
| Method | Key Logic |
|--------|----------|
| `assignWorker()` | Validate report is VERIFIED/REOPENED → validate user is WORKER → create Assignment(PENDING) → set report to ASSIGNED → notify worker |
| `acceptAssignment()` | Validate ownership → set ACCEPTED + acceptedAt → set report IN_PROGRESS → notify citizen |
| `rejectAssignment()` | Set REJECTED + rejectionReason → set report back to VERIFIED (admin can reassign) |
| `resolveReport()` | Validate worker assigned → store proof photo (isResolutionProof=true) → set Assignment COMPLETED → set report CITIZEN_VERIFICATION → notify citizen |

### 13.4 NotificationService — Contextual Messages
```java
public void notifyStatusChange(Report report, ReportStatus newStatus) {
    String message = switch (newStatus) {
        case VERIFIED -> "Your report '" + report.getTitle() + "' has been verified and will be assigned to a worker soon.";
        case ASSIGNED -> "A worker has been assigned to your report '" + report.getTitle() + "'.";
        case IN_PROGRESS -> "Work has started on your report '" + report.getTitle() + "'.";
        case RESOLVED -> "Your report '" + report.getTitle() + "' has been resolved. Please verify the fix.";
        case CITIZEN_VERIFICATION -> "Please confirm if your issue '" + report.getTitle() + "' has been resolved.";
        case CLOSED -> "Your report '" + report.getTitle() + "' has been closed. Thank you!";
        case REOPENED -> "Your report '" + report.getTitle() + "' has been reopened and will be worked on again.";
        default -> "Status update for your report '" + report.getTitle() + "'.";
    };
    createNotification(report.getCitizen(), "Status Update", message, STATUS_UPDATED, report.getId());
}
```

### 13.5 PriorityService — Scheduled Recalculation
```java
@Service
public class PriorityService {
    
    // Runs every hour — recalculates priority for ALL open reports
    // This ensures old reports get increasing ageScore over time
    @Scheduled(cron = "0 0 * * * *")  // every hour at :00
    public void recalculateAllOpenReports() {
        List<ReportStatus> openStatuses = List.of(
            REPORTED, UNDER_REVIEW, VERIFIED, ASSIGNED, IN_PROGRESS, REOPENED
        );
        // fetch all open reports, recalculate each
    }
}
```

---

## SECTION 14: Phase 11 — Controllers (REST API)

### 14.1 AuthController (`/api/auth`)
| Method | Endpoint | Auth | Body / Params | Response |
|--------|----------|------|---------------|----------|
| POST | /register | None | RegisterRequest | 201 AuthResponse |
| POST | /login | None | LoginRequest | 200 AuthResponse |
| GET | /me | JWT | - | 200 UserResponse |

### 14.2 ReportController (`/api/reports`)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | / | JWT | CITIZEN | Create report (multipart: request + photos) |
| GET | / | None | - | List all (page, size query params) |
| GET | /{id} | None | - | Get single report |
| GET | /my | JWT | CITIZEN | My reports |
| GET | /nearby | None | - | ?lat=&lng=&radius= |
| POST | /{id}/upvote | JWT | CITIZEN | Upvote |
| PUT | /{id}/status | JWT | ADMIN/WORKER | Change status |
| POST | /{id}/confirm | JWT | CITIZEN | Confirm resolution |
| POST | /{id}/reject | JWT | CITIZEN | Reject with reason |
| POST | /{id}/comments | JWT | Any | Add comment |
| GET | /{id}/comments | None | - | Get comments |
| POST | /{id}/attachments | JWT | Any | Upload photo |
| POST | /{id}/rate | JWT | CITIZEN | Rate 1-5 stars |

### 14.3 AdminController (`/api/admin`) — @PreAuthorize("hasRole('ADMIN')")
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | KPIs, category breakdown, top priority reports |
| GET | /reports | All reports (filterable by ?status=) |
| GET | /reports/priority | Sorted by priority score descending |
| DELETE | /reports/{id} | Delete spam/fake report |
| POST | /reports/{id}/assign | Assign worker: body { workerId, remark } |
| GET | /users | All users |
| GET | /users/{id} | User by ID |
| PATCH | /users/{id}/toggle | Enable/disable user account |
| POST | /categories | Create category |
| POST | /departments | Create department |
| GET | /categories | All categories |
| GET | /departments | All departments |

### 14.4 WorkerController (`/api/worker`) — @PreAuthorize("hasRole('WORKER')")
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /assignments | My assignments |
| GET | /assignments/{id} | Single assignment |
| PUT | /assignments/{id}/accept | Accept task |
| PUT | /assignments/{id}/reject | Reject: body { reason } |
| POST | /reports/{reportId}/resolve | Upload proof photo + resolve |
| GET | /stats | Pending/InProgress/Completed counts |

### 14.5 NotificationController (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | My notifications (most recent first) |
| GET | /unread-count | Count of unread |
| PUT | /{id}/read | Mark single as read |
| PUT | /read-all | Mark all as read |

---

## SECTION 15: Phase 12 — Frontend (React + Bootstrap 5)

### 15.1 Setup & Tech Stack
```text
React 18 (Create React App)
Bootstrap 5.3 (via CDN in public/index.html)
Bootstrap Icons (via CDN)
Axios 1.6.x (HTTP client with interceptors)
React Router DOM v6 (client-side routing)
```

> **Why CRA over Vite?** Create React App is the standard, well-known tooling familiar in enterprise environments. Vite is faster but less common in training contexts.

### 15.2 Authentication Flow — End to End
```text
1. User visits /login
2. Fills email + password, or clicks "Login as Citizen"
3. AuthContext.login() → POST /api/auth/login
4. Server returns { token: "eyJ...", role: "CITIZEN", name: "Nayan" }
5. Token stored: localStorage.setItem('qf_token', token)
6. Axios request interceptor reads token:
   config.headers.Authorization = `Bearer ${token}`
7. User redirected to /citizen

On page refresh:
1. index.js loads
2. AuthContext useEffect → localStorage.getItem('qf_token') found
3. Calls GET /api/auth/me with token
4. Server validates token → returns user info
5. User state restored — stays logged in

On 401 response:
1. Axios response interceptor detects 401
2. localStorage.clear()
3. window.location = '/login'
```

### 15.3 Protected Routes
```javascript
function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && user.role !== requiredRole) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>Access Denied</h4>
                    <p>You need {requiredRole} role to access this page.</p>
                </div>
            </div>
        );
    }
    return children;
}
```

### 15.4 Route Map
| URL | Component | Auth Required | Role |
|-----|-----------|---------------|------|
| / | Home | No | - |
| /login | Login | No | - |
| /register | Register | No | - |
| /citizen | CitizenPortal | Yes | CITIZEN |
| /reports/:id | ReportDetails | Yes | Any |
| /worker | WorkerPortal | Yes | WORKER |
| /admin | AdminDashboard | Yes | ADMIN |
| /admin/priority | PriorityQueue | Yes | ADMIN |

### 15.5 Key Component Descriptions

**CitizenPortal — Tab 1: Report a Problem**
1. Dropdown: Category (fetched from /api/categories, shows icon + name)
2. Text input: Title
3. Textarea: Description
4. Radio cards: Severity (🟢 LOW / 🟡 MEDIUM / 🟠 HIGH / 🔴 CRITICAL)
5. GPS Button: `navigator.geolocation.getCurrentPosition()` → fetches Nominatim API for reverse geocoding → fills address
6. File input (multiple images)
7. Submit: Build FormData object → `createReport(formData)` → show success/error

**ReportDetails — Citizen Action Box**
```text
If logged-in user = report.citizenId AND status = CITIZEN_VERIFICATION:
┌────────────────────────────────────────┐
│  🔍 Please verify the resolution       │
│                                        │
│  [✅ Confirm Fix]  [❌ Reject Fix]    │
│                                        │
│  If Confirm → 5-star rating modal      │
│  If Reject → text input for reason     │
└────────────────────────────────────────┘
```

**LifecycleStepper** — shows current position in 8-stage lifecycle:
```text
[REPORTED] → [UNDER_REVIEW] → [VERIFIED] → [ASSIGNED] → [IN_PROGRESS] → [RESOLVED] → [CITIZEN_VERIFICATION] → [CLOSED]
   ✅done        ✅done         🔵active       ⬜pending       ⬜pending       ⬜pending        ⬜pending             ⬜pending
```

**AdminDashboard — Worker Assignment Modal**
1. Click "Assign Worker" on a VERIFIED report
2. Modal opens: dropdown of all WORKER role users from /api/admin/users
3. Admin selects worker → optional remark
4. Calls POST /api/admin/reports/{id}/assign
5. Report transitions to ASSIGNED, worker gets notification

---

## SECTION 16: Running the Application

### 16.1 Prerequisites Checklist
- [ ] Java 21 JDK installed at `C:\Program Files\Java\jdk-21.0.11`
- [ ] Apache Maven 3.9.x installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL running on port 5432
- [ ] Database `quickerfix_db` created
- [ ] `application.properties` password matches your PostgreSQL

### 16.2 Start Backend
```powershell
# Step 1: Point Maven to Java 21 (required if default Java is 22+)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.11"

# Step 2: Navigate to backend
cd D:\Desktop\QuickerFix\backend

# Step 3: Compile (first time downloads dependencies ~3 min)
mvn clean compile

# Step 4: Run
mvn spring-boot:run
```

**Expected startup output:**
```text
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
...
Started QuickerFixApplication in 8.3 seconds (JVM running for 9.1)
Seeding initial departments and categories...
Departments and categories seeded successfully.
Default users seeded: admin@quickerfix.com, worker.roads@quickerfix.com, citizen@quickerfix.com
```

Backend URL: `http://localhost:8080`

### 16.3 Start Frontend
```powershell
# Navigate to frontend
cd D:\Desktop\QuickerFix\frontend

# Install dependencies (first time only, ~2-3 min)
npm install

# Start development server
npm start
```
Frontend URL: `http://localhost:3000`

The `"proxy": "http://localhost:8080"` in `package.json` automatically forwards all `/api/...` calls to the backend — no CORS issues during development.

### 16.4 Demo Credentials
| Role | Email | Password | Portal |
|------|-------|----------|--------|
| ADMIN | admin@quickerfix.com | admin123 | /admin |
| WORKER (Roads) | worker.roads@quickerfix.com | worker123 | /worker |
| WORKER (Sanitation) | worker.sanitation@quickerfix.com | worker123 | /worker |
| CITIZEN | citizen@quickerfix.com | citizen123 | /citizen |

### 16.5 Complete End-to-End Test Walkthrough
```text
Step 1: Login as Citizen (citizen@quickerfix.com / citizen123)
        → Go to Citizen Portal
        → Report a Problem: Select "Potholes", add title, click GPS button
        → Upload a photo → Submit
        → Report appears in "My Complaints" with status REPORTED

Step 2: Login as Admin (admin@quickerfix.com / admin123)
        → Admin Dashboard shows new complaint
        → Click report → Change status to UNDER_REVIEW → VERIFIED
        → Click "Assign Worker" → Select worker.roads@quickerfix.com → Confirm
        → Report status becomes ASSIGNED

Step 3: Login as Worker (worker.roads@quickerfix.com / worker123)
        → Worker Portal shows new pending task
        → Click "Accept Assignment" → Status: ACCEPTED → report becomes IN_PROGRESS
        → Fix the pothole in real life :)
        → Upload proof photo → Click "Mark as Resolved"
        → Report transitions to CITIZEN_VERIFICATION

Step 4: Login as Citizen again
        → Get notification: "Your report has been resolved. Please verify."
        → View ReportDetails → See worker's proof photo
        → Click "✅ Confirm Fix" → Rate 5 stars → Submit
        → Report status: CLOSED ✅

Alternative Step 4b: Citizen rejects
        → Click "❌ Reject Fix" → Enter reason
        → Report becomes REOPENED → Worker notified
        → Worker accepts again, re-fixes, re-uploads
```

### 16.6 Test APIs with Postman

**Step 1: Login**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@quickerfix.com",
  "password": "admin123"
}
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "role": "ADMIN",
    "name": "Admin User"
  }
}
```

**Step 2: Copy token, add to all subsequent requests:**
```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
```

**Step 3: Key endpoints to test:**
```http
GET  http://localhost:8080/api/categories
GET  http://localhost:8080/api/departments
GET  http://localhost:8080/api/reports?page=0&size=10
GET  http://localhost:8080/api/admin/dashboard
GET  http://localhost:8080/api/admin/reports/priority
GET  http://localhost:8080/api/auth/me
```

---

## SECTION 17: Docker Deployment

### 17.1 Why Docker?
- No "works on my machine" problems
- One command starts everything: PostgreSQL + Backend + Frontend
- Easy deployment to any server
- Consistent environment across dev/staging/production

### 17.2 backend/Dockerfile
```dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run (smaller image, only JRE)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/quickerfix-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 17.3 frontend/Dockerfile
```dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV REACT_APP_API_URL=http://localhost:8080
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

### 17.4 docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: quickerfix-db
    environment:
      POSTGRES_DB: quickerfix_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      retries: 5

  backend:
    build: ./backend
    container_name: quickerfix-backend
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/quickerfix_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    volumes:
      - uploads:/app/uploads

  frontend:
    build: ./frontend
    container_name: quickerfix-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  pgdata:
  uploads:
```

### 17.5 Run with Docker
```bash
# Navigate to project root
cd D:\Desktop\QuickerFix

# Build and start all containers
docker-compose up --build

# First run takes ~5 min (downloads images, builds jars)
# Access:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:8080
#   DB:       localhost:5432 (user: postgres)

# Stop all containers
docker-compose down

# Stop and delete all data
docker-compose down -v
```

---

## SECTION 18: Complete REST API Reference

### Authentication
| Method | URL | Body | Response | Auth |
|--------|-----|------|----------|------|
| POST | /api/auth/register | RegisterRequest | AuthResponse | None |
| POST | /api/auth/login | LoginRequest | AuthResponse | None |
| GET | /api/auth/me | - | UserResponse | JWT |

### Reports
| Method | URL | Body/Params | Auth | Role |
|--------|-----|-------------|------|------|
| POST | /api/reports | multipart: request + photos[] | JWT | CITIZEN |
| GET | /api/reports | ?page=0&size=10 | None | - |
| GET | /api/reports/{id} | - | None | - |
| GET | /api/reports/my | - | JWT | CITIZEN |
| GET | /api/reports/nearby | ?lat=&lng=&radius= | None | - |
| POST | /api/reports/{id}/upvote | - | JWT | CITIZEN |
| PUT | /api/reports/{id}/status | StatusUpdateRequest | JWT | ADMIN/WORKER |
| POST | /api/reports/{id}/confirm | - | JWT | CITIZEN |
| POST | /api/reports/{id}/reject | RejectResolutionRequest | JWT | CITIZEN |
| POST | /api/reports/{id}/comments | CommentRequest | JWT | Any |
| GET | /api/reports/{id}/comments | - | None | - |
| POST | /api/reports/{id}/attachments | multipart file | JWT | Any |
| POST | /api/reports/{id}/rate | RatingRequest | JWT | CITIZEN |

### Admin
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/admin/dashboard | KPI + analytics |
| GET | /api/admin/reports | All reports (?status=) |
| GET | /api/admin/reports/priority | Priority sorted queue |
| DELETE | /api/admin/reports/{id} | Delete report |
| POST | /api/admin/reports/{id}/assign | Assign worker |
| GET | /api/admin/users | All users |
| PATCH | /api/admin/users/{id}/toggle | Enable/disable user |
| POST | /api/admin/categories | Create category |
| POST | /api/admin/departments | Create department |

### Worker
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/worker/assignments | My assignments |
| PUT | /api/worker/assignments/{id}/accept | Accept task |
| PUT | /api/worker/assignments/{id}/reject | Reject with reason |
| POST | /api/worker/reports/{id}/resolve | Upload proof + resolve |
| GET | /api/worker/stats | My statistics |

### Notifications
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/notifications | My notifications |
| GET | /api/notifications/unread-count | Unread count |
| PUT | /api/notifications/{id}/read | Mark read |
| PUT | /api/notifications/read-all | Mark all read |

---

