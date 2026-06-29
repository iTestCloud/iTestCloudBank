# iTestCloud Bank 🏦
> A premium, interactive internet banking simulator designed specifically for practicing and developing automated UI tests.

iTestCloud Bank is a sample web application built to train QA engineers, test developers, and security practitioners on automated UI testing using frameworks like **Playwright, Selenium, Cypress, Puppeteer, Robot Framework, and Appium**.

Unlike simple static pages, iTestCloud Bank replicates real-world behaviors—including server-side state persistence, configurable network latency, custom frames, custom shadow boundaries, and interactive lists.

---

## 🛠️ Tech Stack & Features

- **Frontend**: React 18, Vite 5, Vanilla CSS (Glassmorphism layout, Dark & Light Mode, smooth transitions).
- **Backend**: Node.js, Express, Multer (for testing file uploads).
- **Database**: Local JSON File Database (`db.json` in root) - preserves registered user data permanently across different automation browser sessions (even incognito or fresh profiles).
- **Orchestration**: Start both frontend and backend concurrently with a single command.

---

## 🚀 Running the Application

Running the application requires **Node.js** (v16 or higher). For a detailed setup, configurations, and troubleshooting, see the [Deployment & Execution Guide](file:///c:/Users/Developer/Documents/GitHub/iTestCloudBank/DEPLOYMENT_GUIDE.md).

### Quick Start (One Command)

1. Clone or download this project.
2. Open your terminal in the root project folder and execute:
   ```bash
   npm run install:all && npm run dev
   ```
3. Open your browser to **`http://localhost:3000`**.

### Available Scripts

In the root directory, you can run:

- **`npm run install:all`**: Installs dependencies for root, server, and frontend projects in one step.
- **`npm run dev`**: Spawns both Vite frontend server (port 3000) and Express API server (port 3001) concurrently.
- **`npm run build`**: Compiles the frontend assets to the server's build folder.
- **`npm start`**: Runs the Express backend server (which will serve the frontend statically if built).

---

## 🧪 UI Automation Test Cases & Features Checklist

This application incorporates every major HTML element type and interaction pattern so you can write comprehensive test suites:

### 1. Forms and Standard Inputs (`/signup`, `/login`, `/transfer`, `/loans`)
- **Text Inputs**: Name, username, email fields.
- **Password Inputs**: Secret text fields for login/signup validation.
- **Numeric Fields**: Transfer amount, loan amount.
- **Drop-down Menus (`<select>`)**: Account types, loan terms, transaction filters.
- **Radio Buttons**: Gender selection options.
- **Single Checkboxes**: Terms and conditions confirmation.
- **Textareas**: Ticket descriptions (multi-line texts).

### 2. Multi-Select & Sliders (UI Testing Lab)
- **Multi-select Lists**: Practice selecting multiple states simultaneously (`<select multiple>`).
- **Sliders (`input type="range"`)**: Drag sliders to customize urgency levels (1-10).
- **Tooltips & Hover State**: Practice hover triggers (`hover` selectors).

### 3. File Uploads (Apply for Loan / Support Tickets)
- **File Picker (`input type="file"`)**: Automate uploading files (PDF, JPG, PNG). Verifies form upload status on the Node server.

### 4. Dynamic Pages, Waits & Spinners (Dashboard, Transfer, UI Lab)
- **Simulated Delays**: Configurable response delays (0s to 8s) allow tests to practice:
  - Wait for elements to be visible.
  - Wait for elements to disappear (spinners).
  - Explicit / implicit timeouts.

### 5. Native Browser Dialogs (UI Testing Lab)
- **Alert boxes**: Simple alerts triggered by actions.
- **Confirm boxes**: Validate OK/Cancel interactions.
- **Prompt boxes**: Feed text inputs into native alert inputs.

### 6. Shadow DOM & Custom Web Components (UI Testing Lab)
- **Shadow Roots**: Practice targeting elements housed inside a closed/open shadow root boundary where standard `#id` query selectors fail.

### 7. IFrames & Framing Boundaries (UI Testing Lab)
- **Framed Contexts**: Features a full payment gateway simulator running inside an `<iframe>` container. Automates switching frames, interacting, and listening to parent frame callbacks.

---

## 📑 Test Account Creation

- Feel free to sign up with any mock username/password.
- Registration creates a fresh account initialized with:
  - Checking Account: **$1,500.00**
  - Savings Account: **$10,000.00**
  - Credit Card Balance: **-$250.00**
- You can perform internal and simulated external transfers which adjust these balances dynamically.
- To reset or start fresh, navigate to **Profile Settings** and select **Delete Account** (this permanently sweeps your credentials and records from `db.json`).

Enjoy testing! 🚀
