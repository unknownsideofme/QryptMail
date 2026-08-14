# QryptMail Frontend Client

A React 19 and Vite single-page application (SPA) rendering the QryptMail neumorphic user interface. The frontend is built to run in two modes: **Demo Mode** (offline mock data) and **Authenticated Mode** (real-time sync with the QryptMail backend server).

---

## Technical Features

- **Progressive State Preservation**: The React state context (`EmailContext`) manages loading states, paginated loads, and background folder changes. It preserves loaded email detail bodies and attachments between folder syncs to avoid redundant API hits.
- **Base64 Attachment Uploader**: The compose panel converts local file uploads to base64 using a standard Web API `FileReader` and packages them into the outgoing JSON payload.
- **Sandboxed HTML Iframe**: Renders rich text and HTML layouts inside a sandboxed `<iframe>` to prevent style leaks (e.g., email styles overriding main dashboard styles) and runs a dynamic height resizer to prevent nested scrollbars.
- **Neumorphic UI tokens**: Leverages Material-UI (MUI v9) and custom CSS variables to render a premium neumorphic design.

---

## Folder Structure

- `src/context/`: Contains the global `EmailContext` managing routing endpoints, local state preservation, and progressive pagination hooks.
- `src/components/`:
  - `Login`: Standard login panel interface.
  - `Sidebar`: Neumorphic folder navigation sidebar.
  - `FolderPanel`: The scrollable paginated list of email items.
  - `DetailPanel`: The sandboxed email reader.
  - `ComposeModal`: The composition panel supporting CC/BCC toggles and file attachment selections.
  - `AttachmentCard`: The lazy attachment streaming downloader card.

---

## Running Tests

Automated testing is configured using Vitest and jsdom.

- **Run unit tests**:
  ```bash
  npx vitest run
  ```
