# QuickerFix â€” Final Implementation Plan

## Project outcome

Deliver a polished, secure civic issue platform that a citizen can use to report and track a local issue, an administrator can review and assign, and a field worker can resolve with evidence. Keep it as a modular Spring Boot + React application with PostgreSQL. AI recommendations must be explainable, optional, and subject to human approval.

This is the **one canonical implementation plan and progress tracker**. Update a step immediately after its code, relevant build, and stated verification are complete. `LOCAL_DEVELOPMENT.md` remains the run/setup reference; it is not a second plan.

## Ordered checklist

Complete these steps in order. A checked box means the written acceptance evidence passed; a feature existing in source alone is not enough.

### 01 â€” Establish a reproducible baseline â€” â˜‘ COMPLETE

- ☑ Record the application stack and launch prerequisites.
- ☑ Start the React application and Spring Boot `dev` profile; expose the local URLs.
- ☑ Exercise a complete citizen â†’ administrator â†’ worker â†’ citizen report lifecycle and record remaining gaps.

**Verified:** Java 21, Node, Maven, frontend at `http://localhost:3000`, backend at `http://localhost:8080`. Admin login/dashboard, category catalog, and public noticeboard read endpoint respond. The `dev` profile uses in-memory H2 and resets after restart.

### 02 â€” Make account creation and role access real â€” â˜‘ COMPLETE

- ☑ Remove seeded/sample user accounts, preview login, and role-switching UI.
- ☑ Seed only the civic service catalog; provision the first administrator from environment settings.
- ☑ Let administrators create staff accounts with a department and strong temporary password.
- ☑ Confirm citizens, workers, and administrators cannot cross into another roleâ€™s protected routes.

**Verified:** Admin sign-in/dashboard and administrator-created worker account worked in the full lifecycle. Worker-to-admin and citizen-to-worker API access returned HTTP 403. No sample user credentials are seeded.

### 03 â€” Complete and audit the report lifecycle â€” â˜‘ COMPLETE

- ☑ Enforce the legal report-state transitions and administrator/worker/citizen permissions in backend services.
- ☑ Require the assigned worker to accept before submitting a resolution; require the report owner to confirm or reopen it.
- ☑ Record actor, timestamp, old/new state, and remarks for report lifecycle actions.
- ☑ Return safe report, comment, attachment, and assignment DTOs instead of serializing JPA entities.
- ☑ Preserve the resolution note and notify the citizen that evidence is awaiting review.

**Verified:** A real local report completed from REPORTED to CLOSED with seven history entries. Anonymous state mutation was denied. Worker assignment serialization was repaired with a summary DTO.

### 04 â€” Protect report evidence and bound report queues â€” â˜‘ COMPLETE

- ☑ Limit image uploads to 10 MB and validate allowed extension, MIME type, and file signature.
- ☑ Normalize and constrain upload/delete paths; only report owners, administrators, or the assigned worker can upload in the relevant context.
- ☑ Paginate public and administrator report lists; filter by status, category, and title/address text; cap a page at 50 rows.
- ☑ Order administrator queues by priority and then creation time.

**Verified:** Public/admin page metadata and category filtering returned the expected result. A different citizenâ€™s upload was rejected with HTTP 403. The end-to-end worker proof upload succeeded.

### 05 â€” Finish the authority noticeboard â€” â˜ IN PROGRESS

- ☐ Verify an administrator can publish, edit/manage, and expire an announcement through the actual UI/API flow.
- ☐ Verify anonymous citizens can read public notices and category/district scopes do not leak targeted notices.
- ☐ Verify authenticated read tracking and high-priority notice behavior.
- ☐ Add empty, loading, retry, and publish-success/error states to the noticeboard.

**Implemented so far:** Public announcements endpoint, global/category/district scope filtering, priority, expiry, administrator publishing, and per-user read tracking. A public empty-board request returned successfully; publishing and scoped reads still need a full smoke pass.

### 06 â€” Finish accessible, responsive role workspaces â€” â˜ IN PROGRESS

- ☐ Give citizen report submission, own reports, nearby reports, and report details clear loading, error, retry, empty, and success states.
- ☐ Give administrators actionable report review, assignment, worker management, and queue filtering with visible feedback.
- ☐ Give field workers mobile-friendly assignments, accept/decline, work notes, proof-photo upload, and outcome feedback.
- ☐ Use labels, keyboard focus, non-color status cues, touch-sized controls, and responsive tables/cards.
- ☐ Remove fabricated metrics, demo-only content, and placeholder sample scenarios.

**Implemented so far:** Landing page loads real categories; citizen pages use live API data; admin and priority queues are paginated and filterable; worker and report-detail pages now provide clearer action, error, timeline, and empty states. Backend resolution now saves worker remarks. Production frontend build passed; review every route visually and re-check the latest worker/comment changes before marking complete.

### 07 â€” Add AI-assisted report triage with human review â€” â˜ NOT STARTED

- ☐ Define an interface and structured result for suggested category, department, severity, confidence, and concise rationale.
- ☐ Add a local/offline deterministic fallback so triage works without an external AI credential or network.
- ☐ Add an optional AI provider adapter with timeout, input minimization, secret configuration, and graceful fallback.
- ☐ Show suggestions to administrators; let them edit/accept or reject. Never change a citizen report automatically.
- ☐ Persist suggestion source, output, human decision, reviewer, and time without storing secrets or unnecessary personal data.
- ☐ Add rate limiting and safe error handling to suggestion requests.

**Acceptance:** Admin sees confidence/rationale and can override every field; provider failure still returns a safe review-needed result; stored user report text remains the source of truth.

### 08 â€” Add duplicate candidates without auto-merging â€” â˜ NOT STARTED

- ☐ Search open reports by configurable time window and location radius.
- ☐ Rank candidates by distance and normalized title/description similarity; show the reasons and distances.
- ☐ Let an administrator link/mark duplicates explicitly; never silently merge or discard a citizenâ€™s report.
- ☐ Add examples and a labeled evaluation set; report precision/recall and known failure cases.

### 09 â€” Make operations analytics useful and honest â€” â˜ NOT STARTED

- ☐ Report backlog by state, category, and service area; median/percentile resolution time; and aging buckets.
- ☐ Use database aggregation queries and visibly label low-sample results.
- ☐ Add date/category filters and empty/error states; do not fabricate trend data.
- ☐ Document the query and the dataset window behind every metric.

### 10 â€” Add schema migrations and query/index improvements â€” â˜ NOT STARTED

- ☐ Introduce Flyway or Liquibase baseline migrations; make production schema evolution independent of Hibernate `ddl-auto=update`.
- ☐ Add indexes for report status/priority/date, category, assignments, unread notices, and ownership lookup after reviewing query patterns.
- ☐ Keep local H2 and PostgreSQL behavior compatible; test migrations on a clean database and an existing database.
- ☐ Remove N+1 dashboard/list patterns and inspect query plans before adding caching.

### 11 â€” Complete security, privacy, and API consistency review â€” â˜ NOT STARTED

- ☐ Review every report, comment, assignment, notification, chat, notice, and media endpoint for role and ownership authorization.
- ☐ Validate request sizes, date ranges, pagination, sorting, enums, and text lengths; return consistent client errors.
- ☐ Keep all secrets out of source control; restrict CORS and API documentation appropriately for deployment.
- ☐ Document public report fields/media policy, retention/deletion, and consent. Do not claim government identity verification without a real lawful integration.
- ☐ Review token storage/expiry, password rules, disabled-user behavior, and audit logging.

### 12 â€” Improve operations and application efficiency â€” â˜ NOT STARTED

- ☐ Add health/readiness endpoints, structured request-correlated logs, and a short troubleshooting guide.
- ☐ Lazy-load frontend routes, debounce search, and reduce unnecessary repeat API requests.
- ☐ Add upload progress and client-side image resizing only if it improves measured network use.
- ☐ Measure API latency and production bundle size; record before/after values for any optimization.
- ☐ Keep optional maps, mail, OAuth, and AI integrations usable when their credentials/services are absent.

### 13 â€” Make local and deployment setup reproducible â€” â˜ IN PROGRESS

- ☑ Keep an `.env.example` with placeholders and first-admin settings; document separate frontend/backend development.
- ☑ Keep Docker Compose configuration for the React app, Spring Boot API, and PostgreSQL.
- ☐ Verify a clean Compose build and end-to-end run on a machine with Docker; provide a production profile, persistent storage, health checks, and HTTPS deployment instructions.
- ☐ Publish current OpenAPI documentation and a concise architecture/data-flow diagram.

**Verified so far:** Separate frontend/backend H2 local preview and production React build work. Docker CLI is unavailable in this workspace, so Compose runtime is not verified here.

### 14 â€” Evaluate, document, and prepare final presentation â€” â˜ NOT STARTED

- ☐ Re-run the full citizen â†’ admin â†’ worker â†’ citizen flow from a clean database.
- ☐ Check negative authorization cases, upload rejection cases, and notice audience/read cases.
- ☐ Evaluate AI triage on a manually labeled, privacy-safe set; publish accuracy, low-confidence coverage, latency, and failure examples.
- ☐ Record report queue performance and the database/sample-size used; do not claim unmeasured scale.
- ☐ Write a 5-minute demo sequence, architecture/role matrix, privacy/security decisions, limitations, and future work.
- ☐ Confirm README and this plan match shipped behavior; list external credentials or integrations that remain optional.

## Progress log

Update this log as each numbered item changes state. A failed check stays unchecked with the failure and next action recorded.

- **2026-10-14 â€” Steps 01â€“04 completed:** Started local frontend/backend; fixed category DTO serialization; exercised registration, report creation, review, worker provisioning/assignment, proof resolution, and citizen closure. Confirmed status-history entries, role denials, safe assignment DTO, bounded/filterable queues, and wrong-owner upload denial.
- **2026-10-14 â€” Step 06 in progress:** Reworked priority queue, admin queue, worker portal, and report details for API-backed states and accessible controls. Worker resolution remarks are now persisted. `npm run build` passed; Maven compilation passed. Needs final live interaction/visual check before the box is checked.
- **2026-10-14 â€” Plan cleanup:** Removed the stale, contradictory `QuickerFix_Implementation_Guide.md`. This file is the sole plan; `LOCAL_DEVELOPMENT.md` remains setup instructions.

## Architecture and delivery decisions

- Use a modular monolith: React SPA â†’ Spring Boot REST API â†’ PostgreSQL. Keep the H2 `dev` profile for temporary development only.
- Use DTOs at API boundaries and enforce permissions in services as well as controller route guards.
- Keep AI behind an interface, send only minimized/sanitized inputs, display confidence and rationale, and require a person to decide.
- Do not seed sample users or public reports in normal startup. Provision the initial administrator explicitly through environment configuration.
- Prefer indexes, SQL aggregation, and pagination before introducing Redis, microservices, or model infrastructure.
- Keep `IMPLEMENTATION_MAP.md` as the single progress source. `LOCAL_DEVELOPMENT.md` describes how to run the code and does not track feature completion.

## Run references

- Local setup: [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)
- Main project overview: [README.md](README.md)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`; OpenAPI UI: `http://localhost:8080/swagger-ui.html`

