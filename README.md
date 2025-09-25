# 🗳️ Community Poll App
A real-time full-stack polling application for creating, voting, and managing interactive polls with live results.

## Features

- **Real-time Voting**: Live updates using WebSocket technology
- **User Authentication**: Magic link email-based login system
- **Poll Management**: Create, view, and delete polls
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Live Results**: Visual progress bars and percentage displays

## Tech Stack

- **Frontend**: React, Tailwind CSS, Axios, React Router, Socket.io-client  
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Nodemailer

## Setup & Run
```bash
# Clone repo
git clone https://github.com/samikshapatel27/community-poll-app.git
cd community-poll-app
```

### Backend
```bash
cd backend
npm install

# Create .env with MONGODB_URI, JWT_SECRET, EMAIL_USER, APP_PASSWORD, PORT
npm run dev
```

### Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Access the application at http://localhost:5173

## Usage

- **Create an Account**: Enter your email to receive a magic link
- **Create Polls**: Add questions and multiple options
- **Share Polls**: Send poll links to others to vote
- **View Results**: Watch live updates as people vote
- **Manage Polls**: Delete polls you've created

## 📄 License

This project is licensed under the MIT License.  

## 👨‍💻 Author

Samiksha Patel
