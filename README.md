# VYRON: Gamified Productivity System 🚀
> *"Level up your life"*

**Prepared by:** Fahima.F | Roll No.: 25BCA020 | Programme: BCA | Institution: Sri Krishna Arts and Science College (SKASC)  
**Document Version:** 1.0

VYRON is a gamified productivity web application that transforms daily tasks into missions, rewards completed work with XP and coins, and uses those rewards to grow a virtual 3D sci-fi metropolis.

---

## 🌟 Key Features

1. **Dedicated Authentication Portal**
   - Full-screen login & citizen registration with inline validation.
   - 15-minute lockout after 5 consecutive failed login attempts (SRS FR-AUTH-05).
   - 1-Click evaluation login for instant review.

2. **Command Dashboard**
   - 4 summary cards: Level (with live XP progress bar out of 1,000 XP), Total XP, Coins Treasury, and Achievements.
   - *Build Your Dream City* hero banner with futuristic cityscape artwork.
   - *Current Mission* card with Python emblem, reward tags (+Coins, +XP), and *Mark as Complete* action with sound effects and confetti celebrations.
   - *Your City* preview card showing city level, next unlock milestones, and fast upgrades.
   - *Your Progress* panel with circular productivity ring, telemetry (completed vs planned missions, focus hours, streak), and weekly glowing XP trend line chart.
   - Achievements badge shelf & live leaderboard preview.

3. **Mission Operations (CRUD)**
   - Add, edit, and delete missions with difficulty (Easy, Medium, Hard), categories (Coding, Study, Work, Health, Personal), focus minutes, and due dates.
   - Server-side reward engine:
     - Easy: 50 XP, 25 Coins
     - Medium: 100 XP, 50 Coins
     - Hard: 200 XP, 100 Coins
     - Coins = $\text{Base XP} / 2$
     - On-time bonus: $+10\%$ XP
     - Streak bonus: $+5\%$ per prior consecutive active day (up to $+25\%$)

4. **Metropolis City Builder (My City)**
   - Interactive district grid showcasing operational buildings.
   - Architectural catalogue: *Residential House (Lv 1)*, *Park (Lv 2)*, *Library (Lv 3)*, *Business Tower (Lv 4)*, *Research Center (Lv 5)*, and *Central Tower landmark (Lv 8)*.
   - Level requirement unlock checks and coin treasury deductions.
   - City level expansion (1 level per 5 constructed buildings).

5. **Productivity Telemetry & Analytics**
   - Weekly & monthly reporting filters.
   - Productivity percentage formula: $\text{Productivity \%} = \frac{\text{Completed}}{\text{Planned}} \times 100$.
   - Daily XP velocity chart, category distribution, and complete XP history audit log.

6. **Achievements & Global Leaderboard**
   - 5 milestones: *First Mission Unlocked*, *City Builder*, *Productivity Pro*, *XP Collector*, and *Dream Achiever*.
   - Global leaderboard ranking architects by Total XP with current user highlighted.

7. **AI Copilot & Synthesized Sound Effects**
   - Mission breakdown engine and personalized coaching tips.
   - Procedural Web Audio API sound effects for quest completions, level ups, and clicks.

---

## 🛠️ Technology Stack

- **Frontend:** React with Vite, JavaScript (ES6+), CSS3 with dark theme and purple-blue neon palette, Lucide React, Canvas Confetti.
- **Backend:** Python 3.10+, Django 6.1+, Django REST Framework, SimpleJWT authentication, SQLite (relational ORM).

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Setup Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt # or install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv requests
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. One-Click Launch (Windows)
Double-click `start_vyron.bat` or run `.\start_vyron.ps1` in PowerShell.

---

## 🔒 Security
- All sensitive keys are loaded via `.env` and excluded via `.gitignore`.
- Password hashing using PBKDF2.
- Server-side calculation of all game economies (XP, coins, streaks, unlocks).
