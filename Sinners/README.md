# Minimal Bug Recreator

This project is designed to **easily recreate, debug, and isolate bugs** in both **Frontend** and **Backend** environments.  
It provides a clean, minimal setup where developers can copy small broken code snippets into isolated environments to observe issues clearly without large project complexity.

---

## 🚀 Your Idea

Modern projects become too large and messy, making debugging slow and frustrating.  
Your idea:  
**Create a minimal environment where any bug can be reproduced quickly** with:

- Very small codebase  
- Separate React frontend + Node backend  
- Fast testing and debugging  
- No unnecessary dependencies  
- Clear separation between UI, API, and logic

This helps teams fix bugs **faster**, because the exact bug scenario can be re-created within minutes.

---

## ✨ Features

### 🔹 1. Minimal React Frontend
- Clean UI to test API calls  
- Components isolated for testing  
- Easy to insert code snippets  
- Reproducible UI bugs  

### 🔹 2. Node + Express Backend
- Minimal REST API  
- Easy to recreate server issues  
- Fast debugging without full-stack load  

### 🔹 3. Recreate Bugs Quickly
- Drop any component / file  
- Run and see bug instantly  
- Compare behavior with main project  

### 🔹 4. Branch-based Workflows
- `frontend` → frontend-specific testing  
- `backend` → backend-only bug debugging  
- `final` → combined working environment  

### 🔹 5. Lightweight Project
- No heavy dependencies  
- Loads instantly  
- Perfect for teaching debugging concepts  

---

## 🧰 Tech Stack

### **Frontend**
- React  
- Vite  
- JavaScript  
- CSS (custom styles)  

### **Backend**
- Node.js  
- Express.js  

### **Development Tools**
- Git & GitHub  
- PowerShell / Bash  
- VS Code  

---

## 📦 Folder Structure

Minimal-Bug-Recreator/
│
├── Backend/
│ ├── server.js
│ ├── routes/
│ └── utils/
│
├── Frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── styles/
│ │ └── main.jsx
│ └── index.html
│
└── README.md


---

# 🛠 Setup Instructions

## ✔ 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/Minimal-Bug-Recreator.git

cd Minimal-Bug-Recreator

cd Frontend
npm install
npm run dev
http://localhost:5173/

cd Backend
npm install
npm start

http://localhost:<PORT>/

const API_BASE_URL = "http://localhost:5000";
