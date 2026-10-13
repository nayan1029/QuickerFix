# Local development setup

## Docker Compose

1. Install Docker Desktop with Compose support.
2. Copy `.env.example` to `.env` and replace its example passwords/secrets for any shared environment.
3. To create the first administrator, set `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` in `.env`. The server provisions that account only when the database has no administrators; remove the password from `.env` after bootstrap.
4. Run `docker compose up --build` from the repository root.
5. Open `http://localhost` for the frontend and `http://localhost:8080/swagger-ui.html` for the API docs.
6. Register a citizen account through the website. Administrators can issue staff accounts from the user-management area.
7. Stop with `docker compose down`. Use `docker compose down -v` only when you intend to erase the local database and uploaded files.

The startup seeder creates only the department and category catalog; it never creates sample user accounts. Existing catalog entries are preserved.

## Run backend and frontend separately

The backend requires Java 21. For the normal local setup, use PostgreSQL and set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and a strong Base64-encoded `JWT_SECRET` before running `mvn spring-boot:run` in `backend/`. Set the three `INITIAL_ADMIN_*` variables to provision the first administrator when needed. For a temporary local preview, run with the `dev` profile; it uses an in-memory H2 database that resets when the backend stops.

The frontend requires Node.js 18 or newer. Run `npm install` and `npm start` in `frontend/`; its development proxy targets `http://localhost:8080`.

## Local preview credentials

When launching the `dev` profile, set `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` to create a local administrator on the empty H2 database. The preview database and its accounts are temporary and are not suitable for deployment.
