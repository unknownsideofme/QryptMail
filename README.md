# QryptMail

QryptMail is a secure, modern webmail client built with a progressive loading architecture matching standard enterprise mail applications (like Gmail and Outlook).

---

## Workspace Structure

The project is structured as a monorepo containing two decoupled packages:

- [qrypt.mail.server](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qrypt.mail.server): A Node.js and Express backend API service managing OAuth credentials, database connections, and Google/Microsoft mail provider integrations.
- [qrypt.mail.frontend](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qrypt.mail.frontend): A React and Vite single-page application (SPA) rendering a neumorphic desktop dashboard interface.

---

## Key Features & Architecture

### 1. 3-Level Progressive Loading Architecture
To maintain a fast and light payload footprint, data is retrieved lazily on demand:
- **Level 1 — Inbox listing**: Fetches lightweight email metadata ONLY (Subject, Sender, Date, Unread status, Starred status, and Attachment presence).
- **Level 2 — Email Details**: Fetches complete email body details (HTML/Text) and attachment structures dynamically when the conversation is clicked.
- **Level 3 — Streaming Downloads**: Streams attachment binaries directly from external mail providers to client HTTP/2 responses. Avoids loading large files in-memory on the backend.

### 2. Low-Level Design (LLD) Patterns
- **Provider Pattern**: Abstract interfaces for email synchronization (`MailProvider`). Allows hot-swapping providers (Gmail, Outlook) transparently.
- **Factory Pattern**:
  - `AuthFactory` resolves authentication providers based on account scopes.
  - `ProviderFactory` resolves active mail providers at runtime.
  - `DatabaseFactory` handles connection routing between MongoDB Atlas and PostgreSQL relational client pools.
- **Sandboxed HTML Rendering**: Detects and displays HTML email bodies inside isolated, sandboxed `<iframe>` panels with dynamic height resizers to isolate email CSS styles and secure auth tokens from CSRF.

---

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)

### Setup & Run

1. **Start the Backend Server**:
   ```bash
   cd qrypt.mail.server
   npm install
   npm run dev
   ```

2. **Start the Frontend Dev Server**:
   ```bash
   cd qrypt.mail.frontend
   npm install
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5175`.
