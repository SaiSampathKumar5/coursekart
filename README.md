# CourseKart

Live demo: https://coursekart.vercel.app/

CourseKart is an online course marketplace built with a Django REST API backend and a React + Vite frontend. It supports browsing courses, adding items to a cart, placing orders, and managing instructor functionality.

## Features

- Browse and search course catalog
- View course details and pricing
- Add courses to cart and manage cart items
- Checkout with order creation flow
- Instructor dashboard for course and order management
- Role-based access control for learners and instructors
- Demo accounts for quick testing

## Tech Stack

- Backend: Django, Django REST Framework
- Frontend: React, Vite
- Styling: CSS
- Database: SQLite (development)

## Project Structure

- `backend/` — Django REST API server
- `frontend/` — React application
- `README.md` — project overview

## Quick Start

### Backend

```bash
cd backend
python -m venv env
# Windows
env\Scripts\activate
# macOS/Linux
# python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
python manage.py makemigrations users courses cart orders
python manage.py migrate
python manage.py seed_courses --with-orders
python manage.py runserver 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

In `frontend/.env`, set:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite dev server after changing the environment file.

## Demo Accounts

Password for all demo accounts: `secret123`

- **Priya** — instructor, owns all 54 courses
- **Arjun** — learner

## API Overview

The backend exposes a set of REST endpoints for users, courses, cart, orders, and instructor actions. For a detailed list of endpoints and rules, see the frontend documentation in `frontend/README.md`.

## Notes

- The API is responsible for enforcing permissions and visibility rules.
- The frontend is intentionally thin, primarily handling user experience and rendering.

## License

This project is for learning and demonstration purposes.
