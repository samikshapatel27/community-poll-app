🗳️ Community Poll App

A real-time full-stack polling application for creating, voting, and managing interactive polls with live results.

🚀 Features

Live voting updates (WebSockets)

Email magic link login (JWT)

Create, view, delete polls

Responsive design with instant results

🛠️ Tech Stack

Frontend: React, Tailwind CSS, Axios, React Router, Socket.io-client
Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Nodemailer

📦 Setup & Run
# Clone repo
git clone https://github.com/samikshapatel27/community-poll-app.git
cd community-poll-app


# Backend
cd backend
npm install
# create .env with MONGODB_URI, JWT_SECRET, EMAIL_USER, APP_PASSWORD, PORT
npm run dev


# Frontend
cd ../frontend
npm install
npm run dev

Visit: http://localhost:5173

🎯 Usage

Login via magic link

Create polls with options

Share and vote on polls

View live results

Delete your polls

📄 License

MIT License
👨‍💻 Author: Samiksha Patel
