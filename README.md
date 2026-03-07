# vms-ac-ui-next

Frontend for the **Visitor Management System and Access Control (VMS-AC)**.

Built with **Next.js 13**, **React 18**, and **MUI v5**.

---

## Prerequisites

| Tool | Min version | Check |
|------|-------------|-------|
| Node.js | 18 | `node --version` |
| npm | 7 | `npm --version` |

> The backend (`vms-ac-server`) must be running on port **8082** before using the app.

---

## Repository Structure

```
vms-ac-ui-next/
├── src/
│   ├── api/          # API call functions (maps to backend endpoints)
│   ├── components/   # Reusable React components, grouped by feature
│   ├── contexts/     # React contexts (e.g. JWT auth context)
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Next.js file-based routes
│   │   ├── dashboard/    # All main app pages (persons, entrances, logs, etc.)
│   │   └── authentication/
│   ├── store/        # Redux store + slices
│   ├── theme/        # MUI theme customisation
│   └── utils/        # Shared utility functions
├── public/           # Static assets
├── server.js         # Custom Node server (handles NVR proxy forwarding)
├── next.config.js    # Next.js config
└── package.json
```

---

## Install Dependencies

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because `material-ui-phone-number` declares a
> peer dependency on React 17 while this project uses React 18.

---

## Running in Development

```bash
npm run dev
```

App available at: **http://localhost:3000**

Hot-reload is enabled — changes to `src/` are reflected immediately.

---

## Building for Production

**Step 1 — Build:**
```bash
npm run build
```
Compiles and optimises the Next.js app into the `.next/` folder.

**Step 2 — Start:**
```bash
npm start
```

App available at: **http://localhost:3000**

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install --legacy-peer-deps` |
| Run dev server | `npm run dev` |
| Build for prod | `npm run build` |
| Start prod server | `npm start` |
| Lint | `npm run lint` |
