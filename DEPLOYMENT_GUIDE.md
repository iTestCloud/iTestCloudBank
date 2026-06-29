# iTestCloud Bank - Deployment & Execution Guide 🚀

This guide explains how to install, configure, build, and run the **iTestCloud Bank** web application in different environments. 

For general application features and testing scenarios, refer back to the main [README.md](file:///c:/Users/Developer/Documents/GitHub/iTestCloudBank/README.md).

---

## 📋 Prerequisites

To run this application locally or in a CI/CD environment, you need:
- **Node.js**: Version `16.x` or higher (Recommended: `18.x` or `20.x` LTS).
- **NPM**: Version `8.x` or higher (packaged with Node.js).
- **OS Support**: Windows, macOS, or Linux.

---

## 🛠️ Step 1: Install Dependencies

To install all required packages for the root project, backend server, and frontend React client in a single command, open a terminal in the root directory and execute:

### On Windows (Command Prompt / CMD)
```cmd
npm run install:all
```

### On Windows (PowerShell)
If PowerShell restricts script executions (returning a `PSSecurityException`), run:
```powershell
cmd.exe /c "npm run install:all"
```

### On macOS / Linux
```bash
npm run install:all
```

---

## 💻 Step 2: Running the Application

There are two primary modes to run the application: **Development Mode** (recommended for testing) and **Production Mode**.

### Option A: Development Mode (Concurrent Hot-Reload)
This mode starts both the Express API server and the Vite dev server concurrently. Changes to the frontend source files will hot-reload instantly.

- **Startup Command**:
  ```bash
  npm run dev
  ```
  *(On Windows PowerShell, use `cmd.exe /c "npm run dev"` if script execution is blocked).*
- **Local URL**: Access the user interface at **`http://localhost:3000`**.
- **Backend API**: The backend server runs on **`http://localhost:3001`**. Vite is pre-configured to proxy `/api`, `/iframe-content`, and `/uploads` requests automatically.

---

### Option B: Production Mode (Compiled Static Files)
This mode compiles the React frontend into static assets and serves them directly from the Express server. It runs as a single process, making it ideal for CI pipeline test executions.

1. **Compile the Frontend**:
   ```bash
   npm run build
   ```
2. **Start the Production Server**:
   ```bash
   npm start
   ```
3. **Local URL**: Access the compiled production application directly on **`http://localhost:3001`**.

---

## ⚙️ Configuration & Environment Variables

You can configure the ports and behaviors by setting standard environment variables prior to running the startup scripts.

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | The port the Express API and static file server will listen on. |
| `NODE_ENV` | `development` | Setting to `production` optimizes Express routing behaviors. |

### Example Port Override (macOS/Linux)
```bash
PORT=8080 npm start
```

### Example Port Override (Windows CMD)
```cmd
set PORT=8080 && npm start
```

---

## 🔍 Troubleshooting

### 1. Address already in use (`EADDRINUSE`)
If you see an error indicating port `3000` or `3001` is already in use, run the following commands to free the port or change the ports:
- **Windows**: Find the PID using `netstat -ano | findstr 3001` and stop the task via `taskkill /F /PID <PID>`.
- **macOS/Linux**: Kill the process using `lsof -i :3001 -t | xargs kill -9`.

### 2. File Upload Permission Issues
Ensure the application directory has write permissions. The backend server automatically attempts to create a local `/server/uploads` directory to store loan documents and support tickets.

### 3. Clear Local Persistent Database
If you need to completely purge all user accounts, transactions, and ticket history to return to a clean state:
1. Stop the running server.
2. Delete the automatically generated `db.json` file in the root directory.
3. Restart the application.

---

## 🔗 Related Documentation
- [Main README.md](file:///c:/Users/Developer/Documents/GitHub/iTestCloudBank/README.md)
- [Server Code (server.js)](file:///c:/Users/Developer/Documents/GitHub/iTestCloudBank/server/server.js)
- [Frontend App Entry (App.jsx)](file:///c:/Users/Developer/Documents/GitHub/iTestCloudBank/frontend/src/App.jsx)
