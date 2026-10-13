# QuickerFix - Final Implementation Plan

## Project outcome

Deliver a polished, secure civic issue platform where residents report and track issues, administrators review and assign work, and field workers resolve issues with evidence. Use a modular Spring Boot + React application with PostgreSQL. AI recommendations must be explainable, optional, and subject to human approval.

This is the **one canonical implementation plan and progress tracker**. Update a step as soon as its code, relevant build, and acceptance checks are complete. `LOCAL_DEVELOPMENT.md` remains run/setup instructions, not a second plan.

## Ordered checklist

Complete the steps in order. A checked box means the written acceptance evidence passed; source code alone is not sufficient.

### 01 - Establish a reproducible baseline - ☑ COMPLETE

- ☑ Record the application stack and launch prerequisites.
- ☑ Start the React application and Spring Boot `dev` profile; expose local URLs.
- ☑ Exercise a citizen -> administrator -> worker -> citizen report lifecycle and record remaining gaps.

**Verified:** Java 21, Node, Maven, frontend at `http://localhost:3000`, backend at `http://localhost:8080`. Admin login/dashboard, category catalog, and public noticeboard read endpoint respond. The `dev` profile uses in-memory H2 and resets after restart.

### 02 - Make account creation and role access real - ☑ COMPLETE

- ☑ Remove seeded/sample user accounts, preview login, and role-switching UI.
- ☑ Seed only the civic service catalog; provision the first administrator from environment settings.
- ☑ Let administrators create staff accounts with a department and strong temporary password.
- ☑ Confirm citizens, workers, and administrators cannot cross into another role's protected routes.

**Verified:** Admin sign-in/dashboard and administrator-created worker account worked in the full lifecycle. Worker-to-admin and citizen-to-worker API access returned HTTP 403. No sample user credentials are seeded.

### 03 - Complete and audit the report lifecycle - ☑ COMPLETE

- ☑ Enforce legal report-state transitions and administrator/worker/citizen permissions in backend services.
- ☑ Require the assigned worker to accept before submitting a resolution; require the report owner to confirm or reopen it.
- ☑ Record actor, timestamp, old/new state, and remarks for lifecycle actions.
- ☑ Return safe report, comment, attachment, and assignment DTOs instead of serializing JPA entities.
- ☑ Preserve the worker resolution note and notify the citizen that evidence is awaiting review.

**Verified:** A local report completed from REPORTED to CLOSED with seven history entries. Anonymous state mutation was denied. Worker assignment serialization was repaired with a summary DTO.

### 04 - Protect report evidence and bound report queues - ☑ COMPLETE

- ☑ Limit image uploads to 10 MB and validate allowed extension, MIME type, and file signature.
- ☑ Normalize and constrain upload/delete paths; enforce owner/administrator/assigned-worker upload permissions.
- ☑ Paginate public and administrator report lists; filter by status, category, and title/address text; cap pages at 50 rows.
- ☑ Order administrator queues by priority and then creation time.

**Verified:** Public/admin page metadata and category filtering returned the expected result. A different citizen's upload was rejected with HTTP 403. The worker proof upload succeeded.

### 05 - Finish the authority noticeboard - ☑ COMPLETE

- ☑ Let administrators publish and withdraw announcements; active-notice reads exclude expired notices.
- ☑ Verify anonymous public reads and matching category/district filters return global plus only the requested audience notices.
- ☑ Verify authenticated read tracking and high-priority notices.
- ☑ Add empty, loading, retry, and publish-success/error states to the noticeboard.

**Verified:** Published two notices as admin. The public list returned the global notice only; matching category scope returned global plus category notice; high-priority list returned the global urgent notice; unread count changed from 1 to 0 after marking read; admin withdrawal removed the targeted notice. Active-notice reads honor expiry.

### 06 - Finish accessible, responsive role workspaces - ☑ COMPLETE

- ☑ Give citizen report submission, own reports, nearby reports, and report details loading, error, retry, empty, and success states.
- ☑ Give administrators actionable review, assignment, worker management, and queue filtering with visible feedback.
- ☑ Give field workers mobile-friendly assignments, accept/decline, work notes, proof-photo upload, and outcome feedback.
- ☑ Use labels, keyboard focus, non-color status cues, touch-sized controls, and responsive tables/cards.
- ☑ Remove fabricated metrics, demo-only content, and placeholder sample scenarios.

**Verified:** Landing page loads real categories; citizen pages use API data; admin and priority queues are paginated and filterable; worker and report-detail pages provide clear action, error, timeline, and empty states. Worker resolution saves remarks. Admin tabs use React state, so worker management does not depend on missing Bootstrap JavaScript. Optimized React build passed; `/`, `/notices`, `/admin`, `/admin/priority`, `/worker`, `/citizen`, and `/reports/1` return the SPA shell (HTTP 200) from the live server. Browser screenshot automation was unavailable because local headless Chrome could not initialize its GPU process; UI is available at `http://localhost:3001` for visual review.

### 07 - Add AI-assisted report triage with human review - ☑ COMPLETE

- ☑ Define a provider interface and structured result for suggested category, department, severity, confidence, rationale, and alternatives.
- ☑ Add a local/offline Naive Bayes model trained on curated civic-language examples; redact email, phone, and identity-number patterns before scoring.
- ☑ Keep remote AI providers optional behind the provider interface; triage remains functional without external credentials or network.
- ☑ Show suggestions to administrators; let them edit and apply category/severity or cancel. Never change a citizen report automatically.
- ☑ Persist model output and the human decision/reviewer/time without storing source text or secrets.
- ☑ Limit suggestion requests to 30 per administrator per minute and return a safe manual-review fallback if classification fails.

**Verified:** Created a report through the citizen API, generated a local suggestion (confidence 0.322 correctly flagged for careful review), applied a human HIGH severity choice, and read back the updated report. The report did not change when the suggestion was generated. External AI remains optional and disabled; there is no configured provider or credential.

### 08 - Add duplicate candidates without auto-merging - ☑ COMPLETE

- ☑ Search open reports in the same category within a configurable 30-day window and 500 m radius; cap database candidates at 200 and return the best 10.
- ☑ Rank candidates by haversine distance and normalized title/description token overlap; show distance, similarity, and reason.
- ☑ Let administrators explicitly link reports; record who linked them, preserve the citizen report, and increment the canonical report's duplicate count. New submissions are never auto-merged.
- ☐ Add a labeled evaluation set; report precision/recall and known failure cases.

**Verified:** Created two separate reports at matching coordinates. The candidate endpoint returned the first report at 0 m; an administrator explicitly linked the second to it. The second report remained accessible and was marked with its canonical report ID. Candidate quality metrics are deferred to Step 14's labeled evaluation.

### 09 - Publish a verified authority and emergency contact directory - ☑ COMPLETE

- ☑ Provide public search by state, district, and service type; show national and matching state/district contacts.
- ☑ Show tap-to-call and email actions, emergency labels, official source URLs, and the verification date.
- ☑ Seed verified India/Jharkhand emergency services: 112, police 100, fire 102, ambulance 108, women 181, child 1098, and blood bank 1910; include Jharkhand Police control room and Disaster Management Department office contacts with their proper scope.
- ☑ Let administrators add, edit, and withdraw contact records; require an official source URL and verification date.
- ☑ Verify anonymous directory reads, admin-only maintenance, state/district/service filters, and clickable phone links.

**Verified:** Live API returns nine contacts for Jharkhand, supports police-only filtering and district filtering, and correctly includes state and national contacts. Public contact creation is denied with HTTP 403; the admin management endpoint returns the records. Contact numbers open `tel:` links in the UI and each card shows an official source and verification date.

**Scope:** Directory starts state-wide for Jharkhand plus India-wide helplines. District is available as a filter and coverage field, and administrators can add source-attributed district contacts when a district is selected. Seeded emergency numbers were checked against [Jharkhand's state portal](https://www.jharkhand.gov.in/), the [Jharkhand Police contact page](https://jhpolice.gov.in/contact-us), [India's ERSS 112 portal](https://112.gov.in/), and the [Ministry of Women and Child Development](https://wcd.gov.in/women/help).

### 10 - Make operations analytics useful and honest - ☑ COMPLETE

- ☑ Report backlog by status and category; median/p90 resolution time; and active-report aging buckets.
- ☑ Use database aggregation queries and label low-sample results.
- ☑ Add date/category filters and loading/error/empty states; reject invalid or overlong date ranges.
- ☑ Document the submitted-date window, capped 1,000 recent-closure percentile sample, and query meaning beside the metrics.

**Verified:** Live analytics API returned status/category/backlog aggregates for a newly created report (total=1, REPORTED=1, Potholes=1, age 0-1 days=1), correctly labeled the one-report sample as small, returned null resolution percentiles for no closures, and returned HTTP 400 for a reversed date range.

### 11 - Add schema migrations and query/index improvements - ☐ IN PROGRESS

- ☑ Introduce Flyway baseline and follow-up migrations; use Hibernate validation rather than schema mutation in production.
- ☐ Add indexes for report status/priority/date, category, assignments, unread notices, and ownership lookup after reviewing query patterns.
- ☑ Keep local H2 and PostgreSQL migration paths configured; validate clean H2 startup. Existing PostgreSQL upgrade still needs a Docker-backed check.
- ☐ Remove N+1 dashboard/list patterns and inspect query plans before adding caching.

### 12 - Complete security, privacy, and API consistency review - ☐ IN PROGRESS

- ☐ Review every report, comment, assignment, notification, chat, notice, and media endpoint for role and ownership authorization.
- ☑ Validate report/auth/rating/worker request sizes, dates, page sizes, file counts and text lengths; map common authorization/validation/conflict errors to safe status codes.
- ☑ Keep secrets in environment configuration; use an explicit CORS origin allowlist and disable API docs outside development by default.
- ☐ Document public report fields/media policy, retention/deletion, and consent. Do not claim government identity verification without a real lawful integration.
- ☑ Remove the unused Aadhaar/OTP identity flow and storage; retain email/password login and optional Google sign-in. Do not claim government identity verification.
- ☑ Add method-level authorization, JWT disabled-user rejection, Google verified-email check, 12-character minimum passwords, 24-hour token expiry, 401/403 handlers, and request-correlated access logs. Broader endpoint-by-endpoint audit remains.
- ☐ Cross-check remaining README claims about verified-admin registration, encryption, and credential requirements against implemented behavior.

### 13 - Improve operations and application efficiency - ☐ IN PROGRESS

- ☑ Add database-backed health/readiness endpoints and request-correlated access logs; local run/setup notes exist.
- ☑ Lazy-load frontend routes; debounce/repeat-request audit remains.
- ☐ Add upload progress and client-side image resizing only if they improve measured network use.
- ☐ Measure API latency and production bundle size; record before/after values for optimizations.
- ☐ Keep optional maps, mail, OAuth, and AI integrations usable without credentials/services.
- ☐ Reconcile promised GPS/Google Maps, State/District coverage, geo-fencing, worker location matching, and report map visualization with shipped behavior; implement the usable parts and clearly label credentialed integrations.
- ☐ Reconcile README promises for real-time chat, WebSocket, email/SMS lifecycle notices, urgent-issue escalation, ratings, and admin transparency with shipped behavior; complete real flows or state the exact setup/limitation.

### 14 - Make local and deployment setup reproducible - ☐ IN PROGRESS

- ☑ Keep `.env.example` placeholders and first-admin settings; document separate frontend/backend development.
- ☑ Keep Docker Compose configuration for the React app, Spring Boot API, and PostgreSQL.
- ☑ Add a production Compose stack with persistent database/uploads, health checks, internal service networking, and Caddy-managed HTTPS; Compose runtime verification remains because Docker is unavailable here.
- ☐ Publish current OpenAPI documentation and a concise architecture/data-flow diagram.

**Verified so far:** Separate frontend/backend H2 local preview and production React build work. Docker CLI is unavailable in this workspace, so Compose runtime is not verified here.

### 15 - Evaluate, document, and prepare final presentation - ☐ IN PROGRESS

- ☐ Re-run the complete citizen -> admin -> worker -> citizen flow from a clean database.
- ☐ Check negative authorization cases, upload rejection cases, and notice audience/read cases.
- ☐ Evaluate AI triage on a manually labeled, privacy-safe set; publish accuracy, low-confidence coverage, latency, and failure examples.
- ☐ Record report queue performance and the database/sample size used; do not claim unmeasured scale.
- ☐ Write a 5-minute demo sequence, architecture/role matrix, privacy/security decisions, limitations, and future work.
- ☐ Confirm README and this plan match shipped behavior; list integrations/credentials that remain optional.
- ☐ Build a README-to-code claim matrix for every feature, stack version, table, environment variable, and quick-start command. Complete supported gaps before removing unsupported demo-era claims.
- ☑ Rewrite README with product goals, role capabilities and entry paths, lifecycle, functional scope, security requirements, setup, architecture, and roadmap. Full source-claim audit and remaining evaluation items are pending.
- ☐ Include outcomes for the README's promised admin/worker work history, resolution ratings, location mapping, communication channels, escalation, and account verification, explicitly marking provider-dependent features.

## Progress log

Update this log as each numbered item changes state. Keep a failed step unchecked and record the failure and next action.

- **2026-10-14 - Steps 01-04 completed:** Started local frontend/backend; fixed category DTO serialization; exercised registration, report creation, review, worker provisioning/assignment, proof resolution, and citizen closure. Confirmed status-history entries, role denials, safe assignment DTO, bounded/filterable queues, and wrong-owner upload denial.
- **2026-10-14 - Step 05 completed:** Verified announcement creation, public/global/category filtering, priority, unread tracking, and admin withdrawal. The unread counter now counts active global notices only.
- **2026-10-14 - Step 06 completed:** Optimized React build passed after admin tab and user-list state fixes. Main SPA routes return HTTP 200 on the live React server; backend lifecycle/API checks were completed in Steps 01-05.
- **2026-10-14 - Step 07 completed:** Added offline Naive Bayes triage, admin-only suggestion/review APIs, privacy filtering, throttling, human decision audit storage, and editable dashboard controls. Backend compile, optimized frontend build, and live report -> suggestion -> human override API flow passed. Remote model configuration remains optional.
- **2026-10-14 - Step 08 implementation complete:** Removed implicit duplicate folding from report creation; added bounded candidate search, explainable similarity/distance results, duplicate-link audit persistence, detail-page suggestions, and administrator confirmation. Backend compile, frontend build, and two-report live API flow passed. Labeled precision/recall evaluation remains for Step 15.
- **2026-10-14 - Step 09 completed:** Added public state/district/service filters, official-source-attributed Jharkhand and national contact seeds, click-to-call cards, and administrator CRUD/withdraw controls. Backend compile, optimized frontend build, and live anonymous filtering/admin authorization checks passed. Directory starts state-wide for Jharkhand; local authority entries can be added by administrators with source and verification metadata.
- **2026-10-14 - Step 10 completed:** Added date/category-filtered database analytics for status/category counts, backlog age, and median/p90 close durations (capped at 1,000 recent closures); added sample-size labels and admin dashboard controls. Backend compile, frontend production build, populated API query, empty percentile behavior, and reversed-date validation passed.
- **2026-10-14 - Steps 11-15 advanced:** Added Flyway migrations, indexes, sensitive-field encryption/migration, security guards and validation, health/readiness, request IDs, lazy route loading, and production Caddy/Compose configuration. Clean Maven compile passed; H2 migrations and health endpoints were exercised. Docker verification and full privacy/feature evaluation remain pending. Rewrote README as the complete product scope and implementation status document.
- **2026-10-14 - Role entry implementation:** Added three homepage portal cards with role query links, synchronized login tabs with ?role=, tied labels to controls, and documented that JWT account role determines access and redirect. Optimized frontend production build passed.
- **2026-10-14 - Brand icon:** Created a custom QuickerFix SVG mark and applied it to the navbar, browser favicon, and app touch icon. Replaced the homepage role card badges with simple civic-service symbols.
- **2026-10-14 - Step 12 in progress:** Removed the unused Aadhaar/OTP UI, API, service, and entity code; removed the legacy OTP table from fresh schema and added V3 to drop it from upgraded databases. Updated README authentication claims. React production build passed; backend compile could not resolve Maven Central because network access is restricted, so rerun when repository access is available. Remaining security/privacy/API review is unchecked.
- **2026-10-14 - Plan cleanup:** Removed the stale, contradictory `QuickerFix_Implementation_Guide.md`. This file is the sole plan; `LOCAL_DEVELOPMENT.md` remains run/setup instructions.

## Architecture and delivery decisions

- Use a modular monolith: React SPA -> Spring Boot REST API -> PostgreSQL. Keep H2 `dev` for temporary development only.
- Use DTOs at API boundaries and enforce permissions in services as well as controller route guards.
- Keep AI behind an interface, send minimized/sanitized inputs, display confidence and rationale, and require a person to decide.
- Do not seed sample users or public reports at startup. Provision the initial administrator explicitly through environment configuration.
- Prefer indexes, SQL aggregation, and pagination before introducing Redis, microservices, or model infrastructure.
- Keep `IMPLEMENTATION_MAP.md` as the single progress source. `LOCAL_DEVELOPMENT.md` describes how to run the code and does not track feature completion.

## Run references

- Local setup: [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)
- Main project overview: [README.md](README.md)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`; OpenAPI UI: `http://localhost:8080/swagger-ui.html`
