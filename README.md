# 💖 TrueTie: Relationship Commitment Platform

TrueTie is a modern relationship commitment platform designed to encourage loyalty, trust, and long-term connection between couples. It gamifies the relationship journey through dynamic loyalty scores, daily check-ins, and milestone rewards.

## 🚀 Features

- **Secure Authentication**: JWT-based login and signup with extended user profiles.
- **OTP Password Reset**: Secure 6-digit OTP verification for forgotten passwords.
- **Couple Linking**: Send relationship invites via email, accept to link profiles, or manage breakups.
- **Dynamic Loyalty Score**: A real-time trust metric that grows with your consistency.
- **Daily Check-ins**: Build a connection habit and earn loyalty points together.
- **Modern UI**: A beautiful, responsive interface built with React and modern CSS.

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework (DRF), SQLite
- **Frontend**: React (Vite), Axios, React Router
- **Authentication**: JWT (SimpleJWT)
- **Email**: Console Email Backend (for development)

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js & npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔑 Default Test Account
- **Email**: `user1@gmail.com`
- **Password**: `user1`

## 🤝 How it Works
1. **Signup**: Create your profile with your details.
2. **Invite**: Go to the "Partner" section and send an invite to your partner's email.
3. **Link**: Once your partner accepts, your profiles are linked and you start at 0 Loyalty Points.
4. **Grow**: Check in daily to boost your score (+10 points per day).
5. **Protect**: If a breakup occurs, the loyalty score is reset to 0 to encourage a fresh start.

---
Built with ❤️ for couples who value commitment.
