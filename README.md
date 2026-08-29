# QuickerFix — Secure Civic Complaint Management Platform

A full-stack civic complaint management platform featuring:
- **8-stage lifecycle tracking** with real-time status updates
- **Custom priority scoring algorithm** (Severity + Age + Duplicates + Upvotes + Location)
- **Haversine-based duplicate detection** (100m radius geo-proximity)
- **Aadhar-based citizen identity verification** with OTP authentication
- **Verified Admin registration system** with designation/post transparency
- **Google Maps API integration** for precise location tracking (State/District/Coordinates)
- **Real-time chat-based interaction** between citizens and administrators
- **Announcements system** for essential government notifications
- **Photo-based accountability** with worker proof verification
- **Multi-tier identity verification** by administrators

Built with **Java 21 · Spring Boot 3.2.5 · Spring Security 6 · JWT · PostgreSQL · React 18 · Bootstrap 5**

---

## 🎯 Key Features

### 1. **Citizen-Side Features**
- ✅ Secure registration using verified Aadhar number
- ✅ OTP-based identity verification (SMS/Email)
- ✅ GPS-enabled complaint submission with Google Maps integration
- ✅ Real-time status tracking through 8-stage lifecycle
- ✅ Photo upload for complaint evidence
- ✅ Upvote/comment on existing complaints
- ✅ Verify worker resolution proof before closure
- ✅ Rate and review resolved complaints
- ✅ Real-time chat with assigned admin/worker
- ✅ Receive official announcements and notifications

### 2. **Administrator Features**
- ✅ Register with verified credentials (name, designation, post, department)
- ✅ Review and verify citizen identity (Aadhar match)
- ✅ Verify complaint authenticity and categorize
- ✅ Intelligently assign workers based on location and department
- ✅ Real-time chat with citizens for updates/clarifications
- ✅ Broadcast announcements to specific or all citizens
- ✅ Override complaint status if needed
- ✅ View analytics and performance metrics
- ✅ Manage users, categories, and departments

### 3. **Worker Features**
- ✅ View assigned tasks sorted by priority
- ✅ Accept/reject assignments with reasons
- ✅ Upload photographic proof upon completion
- ✅ Communicate with citizens via chat
- ✅ View work history and performance ratings
- ✅ Accept mobile/field-based access

### 4. **Aadhar & Identity Verification**
- ✅ Aadhar number as primary identifier for citizens
- ✅ OTP verification to registered mobile number
- ✅ Admin verification against Aadhar database
- ✅ Prevents duplicate and fraudulent complaints
- ✅ Ensures accountability and transparency

### 5. **Location Intelligence**
- ✅ Google Maps API integration for real-time location
- ✅ State and District hierarchical database
- ✅ Geo-fencing for area-specific complaints
- ✅ Haversine distance calculation for duplicate detection
- ✅ Map visualization of all reports

### 6. **Communication Features**
- ✅ Real-time chat between citizen ↔ admin ↔ worker
- ✅ Government announcements and notifications
- ✅ Email and SMS alerts at each lifecycle stage
- ✅ Admin broadcast messages to communities
- ✅ Escalation mechanism for urgent issues

---

## 📊 Complete 8-Stage Complaint Lifecycle

```
REPORTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CITIZEN_VERIFICATION → CLOSED
                                                                                ↓ (citizen rejects)
                                                                          REOPENED → IN_PROGRESS
```

| Stage | Who Acts | What Happens |
|-------|----------|--------------|
| **REPORTED** | Citizen | Submits complaint with Aadhar verification, photo, GPS location |
| **UNDER_REVIEW** | Admin | Reviews complaint authenticity using Aadhar database |
| **VERIFIED** | Admin | Confirms identity and validates civic issue |
| **ASSIGNED** | Admin | Assigns worker from matching department via chat notification |
| **IN_PROGRESS** | Worker | Accepts task, starts work, updates progress |
| **RESOLVED** | Worker | Uploads proof photo and marks complete |
| **CITIZEN_VERIFICATION** | Citizen | Receives alert, verifies worker's proof via app |
| **CLOSED** | Citizen | Confirms resolution, rates worker (1-5 stars) |
| **REOPENED** | Citizen | Rejects proof with reason → back to IN_PROGRESS |

---

## 🎓 Priority Scoring Algorithm

```
Priority Score (0–100) =
  Severity Score      (max 30) — CRITICAL=30, HIGH=25, MEDIUM=15, LOW=5
+ Duplicate Reports   (max 25) — duplicateCount × 2.5, capped at 25
+ Age Score           (max 20) — daysOld × 2, capped at 20
+ Upvote Score        (max 15) — upvotes × 0.5, capped at 15
+ Location Score      (max 10) — area importance weighted factor
```

**Example Priority Calculation:**
| Complaint | Severity | Duplicates | Age | Upvotes | Location | Total Score |
|-----------|----------|------------|-----|---------|----------|-------------|
| Water leakage (7 days, 5 dupes, 8 upvotes) | 30 | 12.5 | 14 | 4 | 5 | **65.5** |
| Broken bench (new, 0 dupes, 0 upvotes) | 5 | 0 | 0 | 0 | 5 | **10** |

**Result:** Water leakage is 6.5× higher priority. Critical infrastructure gets priority.

---

## 👥 Roles & Permissions Matrix

| Feature | Citizen | Worker | Admin |
|---------|---------|--------|-------|
| Submit Report (Aadhar-verified) | ✅ | ❌ | ❌ |
| Upvote/Comment | ✅ | ✅ | ✅ |
| Verify Proof | ✅ | ❌ | ❌ |
| Rate Resolution | ✅ | ❌ | ❌ |
| Accept Assignment | ❌ | ✅ | ❌ |
| Upload Proof | ❌ | ✅ | ❌ |
| Verify Identity (Aadhar) | ❌ | ❌ | ✅ |
| Assign Worker | ❌ | ❌ | ✅ |
| Manage Categories | ❌ | ❌ | ✅ |
| Chat with Reporter | ❌ | ✅ | ✅ |
| Broadcast Announcements | ❌ | ❌ | ✅ |
| View Analytics | ❌ | 📊 Limited | ✅ Full |

---

## 🏗️ Technical Architecture

**Backend:** Spring Boot 3.2.5 with Spring Security 6, JWT authentication  
**Database:** PostgreSQL with 15+ tables including Aadhar records, State/District hierarchy, chat messages, announcements  
**Frontend:** React 18 with React Router v6, real-time chat UI, Google Maps integration  
**APIs:** RESTful with Swagger documentation  
**Authentication:** JWT Bearer tokens + Aadhar OTP verification  
**Real-time Communication:** Chat via WebSocket (optional), SMS/Email notifications

---

## 🚀 Quick Start

### Prerequisites
- Java 21 LTS
- Node.js 18+
- PostgreSQL 15+
- Google Maps API Key

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

### Database
```sql
psql -U postgres
CREATE DATABASE quickerfix_db;
```

---

## 📱 New Components for Enhanced Features

### Identity Verification System
- **Aadhar Service**: Validates Aadhar numbers against government database
- **OTP Service**: Generates and verifies one-time passwords
- **Identity Verification Controller**: Manages citizen registration flow

### Location & Geography
- **State/District Database**: Hierarchical geographical data
- **Google Maps Integration**: Real-time map rendering, geocoding, route optimization
- **Location Service**: Manages GPS coordinates and address resolution

### Communication & Notifications
- **Chat Service**: Real-time messaging between citizens and admins
- **Notification Service**: Multi-channel alerts (email, SMS, in-app)
- **Announcement Service**: Admin broadcasts to citizens
- **WebSocket Configuration**: Real-time push notifications

### Admin Management
- **Admin Registration Service**: Verify admin credentials and designation
- **Admin Verification Controller**: Manage admin applications
- **Transparency Dashboard**: Display all admins with their designations

---

## 📊 Database Tables (Enhanced)

Now includes:
- `aadhar_records` — Aadhar number mappings
- `otp_records` — OTP generation and verification
- `states_and_districts` — Geographic hierarchy
- `chat_messages` — Citizen-Admin-Worker conversations
- `announcements` — Government notifications
- `admin_details` — Admin designation and verification status

---

## 🔐 Security Features

- ✅ Aadhar-based identity verification
- ✅ OTP validation for registration
- ✅ JWT token-based authentication (24-hour expiration)
- ✅ Role-based access control (RBAC)
- ✅ Admin verification before platform access
- ✅ Encrypted sensitive data
- ✅ HTTPS support for production
- ✅ CORS protection
- ✅ Input validation and sanitization

---

## 📄 License

[Specify your license]

---

## 📞 Contact & Support

**Author:** Nayan Kumar Shukla | VIT Bhopal University | B.Tech CSE

For issues, feature requests, or contributions, please open a GitHub issue or contact the development team.
