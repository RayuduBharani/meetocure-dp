# MeetoCure

Medical assistant web application (Node.js backend, Python ChatBot, React + Vite frontend).

MeetoCure/
│
├── meetocure/
│ ├── backend/ # FastAPI backend
│ │ ├── main.py
│ │ ├── requirements.txt
│ │ └── ...
│ │
│ ├── frontend-ankit/ # React + Vite frontend
│ │ ├── src/
│ │ ├── package.json
│ │ └── ...
│
└── README.md

---

## Project layout

meetocure/
- server/                 ← Node/Express backend (API, MongoDB)
- ChatBot/                ← Python FastAPI chatbot service
- frontend-ankit/         ← React + Vite frontend
- deploy.sh               ← (optional) deployment helper
- README.md               ← this file

---

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ and pip
- MongoDB (local or remote)
- Git

---

## Quick start (recommended)

Open three terminals.

1) Node backend
```bash
cd meetocure/server
npm install
# create .env (see Environment section)
npm start
```
Default API port: 5000 (check `server/server.js` or .env)

2) ChatBot (FastAPI)
```bash
cd meetocure/ChatBot
python -m venv .venv
# Windows CMD
.venv\Scripts\activate
# PowerShell
.venv\Scripts\Activate.ps1
# Linux / Mac
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

3) Frontend (Vite + React)
```bash
cd meetocure/frontend-ankit
npm install
npm run dev
```
Default Vite port: 5173 (or check terminal)

---

## Environment variables

Create `.env` files for the backends. Minimal examples:

server/.env
```
MONGO_URI=mongodb://localhost:27017/meetocure
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=AduRxMtATeIpPPENcz-pEBY_-5zKKcnPnycQTWmuMGpcqq //Testing
```

ChatBot/.env (if required by your Python service)
```
# example - depends on ChatBot code
API_KEY=tgp_v1_Unwor2_awf0QTucEfzJK_nyvXDMPppHA4mQ3hR_GeEs
DB_PATH=./chroma_db2
```

frontend: if needed create `.env` with:
```
VITE_GEMINI_API_KEY=AIzaSyAps9OlJIEG5eaKIh9DlG6OPFafdJ_KB_I // Do Not Share 
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAps9OlJIEG5eaKIh9DlG6OPFafdJ_KB_I // Do Not Share

```

---

## Data persistence

- Node backend uses MongoDB. Ensure MongoDB is running and `MONGO_URI` points to it.
- ChatBot may include a local vector DB (chroma). Large DB files should not be committed to git; store externally or regenerate.

---

---

## Useful maintenance tips

- Remove large binary data from repo (e.g. ChatBot/chroma_db2). Add to `.gitignore`.
- Analyze frontend bundle:
  ```bash
  cd frontend-ankit
  npm run build
  ls -lh dist/assets | sort -h
  ```
- Detect unused dependencies:
  ```bash
  npx depcheck
  ```
- Purge large commits with `bfg` or `git filter-repo` if needed (use with caution).

---

## Cleaning git (recommended before deploy)

Add to `.gitignore`:
```
ChatBot/chroma_db2/
ChatBot/.venv/
__pycache__/
*.sqlite3
*.pyc
```

To remove large tracked files (example using BFG):
```bash
bfg --delete-folders chroma_db2
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```



---

## License

Hack-N-Crafts

