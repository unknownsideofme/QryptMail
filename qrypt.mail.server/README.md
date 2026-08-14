# QryptMail Backend API Service

A structured Node.js and Express backend API driving QryptMail. This service interfaces with MongoDB Atlas and PostgreSQL to manage OAuth tokens, and connects dynamically to Google APIs for mail routing.

---

## Technical Features

- **MIME Multipart Compiler**: Dynamic RFC 2822 multipart/mixed boundary assembler in the Gmail Provider. Correctly packages rich HTML bodies alongside Base64 attachments.
- **Buffer Streaming**: Streams binary attachments from Google cloud servers directly to the client browser in chunks, minimizing RAM overhead.
- **Robust Zod Validator**: Custom input checking middleware with safe getter overrides (`Object.defineProperty`) protecting against read-only getter conflicts in Express routers.
- **Token Manager**: Automatic detection and refreshing of expired OAuth access tokens prior to API calls using cached refresh tokens.

---

## API Documentation

### 1. Authentication
- `POST /api/auth/login` - Authenticates user.
- `GET /api/auth/me` - Retrieves profile state.
- `POST /api/auth/logout` - Disposes session tokens.

### 2. Mail Operations
- `GET /api/mail/inbox` - Fetches paginated, lightweight metadata listing.
  - **Query Parameters**: `email`, `folder`, `limit` (default: 20), `pageToken` (optional).
- `GET /api/mail/messages/:id` - Fetches complete message HTML/Text body and attachment details.
  - **Query Parameters**: `email`.
- `GET /api/mail/messages/:messageId/attachments/:attachmentId` - Downloads a dynamic binary attachment stream.
- `POST /api/mail/send` - Transmits a simple or multipart email with CC, BCC, and Base64 attachments.

---

## Running Tests

Automated testing is configured using Jest.

- **Run unit tests**:
  ```bash
  npm run test tests/unit
  ```
- **Run integration tests**:
  ```bash
  npm run test tests/integration
  ```
