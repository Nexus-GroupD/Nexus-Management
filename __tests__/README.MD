# 🧪 Nexus Testing Guide

This guide explains how to run unit tests for the Nexus project.  
It is designed for users who **only want to run tests** — no coding or configuration required.

---

## 📦 Prerequisites

Install the following software before starting:

### 1. Git
Used to download the project.

Download: https://git-scm.com/downloads

Verify installation:
git --version

---

### 2. Node.js (LTS recommended)
Used to run the project and install dependencies.

Download: https://nodejs.org/

Verify installation:
node --version
npm --version

---

### 3. (Optional) VS Code
Recommended for viewing the project.

Download: https://code.visualstudio.com/

---

## 📥 Step 1: Clone the Repository

git clone https://github.com/Nexus-GroupD/Nexus-Management.git
cd Nexus-Management

---

## 📦 Step 2: Install Dependencies

npm install

---

## ▶️ Step 3: Run a Specific Test

npx jest \_\_tests\_\_/api/conversations.test.ts

npx jest \_\_tests\_\_/api/shifts.test.ts

npx jest __tests__/api/history.test.tsx

npx jest \_\_tests\_\_/api/chatbot.test.ts

npx jest __tests__/time.test.ts

npx jest __tests__/components/navbar.test.tsx
---

## ✅ Expected Output

PASS __tests__/api/conversations.test.ts

PASS __tests__/api/shifts.test.ts

PASS __tests__/api/history.test.tsx

---

## 🔁 Running Other Tests

npx jest `<path-to-test-file>`

---

## 📌 Notes

- No code changes required
- Run commands from project root
- Tests are safe to run locally

---

## 🚀 Quick Start

- git clone <REPO_URL>
- cd Nexus-Management
- npm install
- npx jest `<path-to-test-file>`
