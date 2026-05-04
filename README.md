# 💖 TrueTie: Relationship Commitment Platform

TrueTie is a modern relationship commitment platform designed to encourage loyalty, trust, and long-term connection between couples. It gamifies the relationship journey through dynamic loyalty scores, daily check-ins, and milestone rewards.

## 🚀 Features

- **Dynamic Trust Score System**: A sophisticated trust metric with tiers (Bronze, Silver, Gold, Platinum) and automated point calculations based on consistency.
- **Mutual Rewards System**: Unlock exclusive relationship rewards based on your tier and relationship maturity (30+ days), requiring mutual agreement.
- **Breakup & Archive System**: A thoughtful 30-day "Relationship Archive" period that allows for reactivation before permanent data reset.
- **Magical Dashboard**: A high-end, artistic hub featuring "Glassmorphism" design, animated progress visualizations, and a "Love Story" journey timeline.
- **OTP Password Reset**: Secure 6-digit OTP verification for forgotten passwords.
- **Secure Authentication**: JWT-based login and signup with extended user profiles.
- **Couple Linking**: Send relationship invites via email, accept to link profiles.
- **Daily Check-ins**: Build a connection habit and earn loyalty points (+10 per day) together.

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
1. **Signup & Setup**: Create your profile and set your anniversary date.
2. **Invite & Link**: Send an invite to your partner. Once accepted, your "Relationship Journey" begins.
3. **Daily Connection**: Check in daily. If both partners check in, you earn **+10 Trust Points**. Consistency is key!
4. **Ascend Tiers**: Your Trust Score determines your tier (Bronze → Silver → Gold → Platinum). Higher tiers unlock better rewards.
5. **Unlock Rewards**: Browse available rewards. Both partners must agree to unlock a reward, and you must have been linked for at least 30 days.
6. **Handle Hard Times**: If you need a break, use the "Breakup" feature. Your data is archived for 30 days, allowing for "Reactivation" if you decide to try again. After 30 days, the reset becomes permanent.

---
Built with ❤️ for couples who value commitment.
