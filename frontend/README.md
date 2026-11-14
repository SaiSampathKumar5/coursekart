# CourseKart

Online course marketplace: Django REST backend (port 8000) + React/Vite frontend (port 3000).
Open two terminals and leave both running.

## Terminal 1 — backend
```
cd backend
python -m venv env
env\Scripts\activate          # Mac/Linux: python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
python manage.py makemigrations users courses cart orders   # first time only
python manage.py migrate
python manage.py seed_courses --with-orders                 # drop --with-orders for no sample orders
python manage.py runserver 8000
```

## Terminal 2 — frontend
```
cd frontend
npm install
npm run dev
```
`frontend/.env` holds the single server address: `VITE_API_BASE_URL=http://localhost:8000` (restart Vite after editing).

## Demo accounts (password `secret123`)
- **Priya** — instructor, owns all 54 courses
- **Arjun** — learner

## The 21 endpoints
| # | Method | Path |
|---|--------|------|
| 1 | POST | /api/users/register/ |
| 2 | POST | /api/users/login/ |
| 3 | POST | /api/users/logout/ |
| 4 | POST | /api/users/token/refresh/ |
| 5 | GET | /api/courses/ |
| 6 | POST | /api/courses/ |
| 7 | GET | /api/courses/:id/ |
| 8 | PATCH | /api/courses/:id/ |
| 9 | DELETE | /api/courses/:id/ |
| 10 | GET | /api/cart/ |
| 11 | POST | /api/cart/add/ |
| 12 | PATCH | /api/cart/items/:rowId/ |
| 13 | DELETE | /api/cart/items/:rowId/ |
| 14 | GET | /api/orders/ |
| 15 | POST | /api/orders/ |
| 16 | GET | /api/orders/:id/ |
| 17 | POST | /api/orders/:id/cancel/ |
| 18 | GET | /api/instructor/courses/ |
| 19 | GET | /api/instructor/orders/ |
| 20 | PATCH | /api/instructor/orders/:itemId/ |
| 21 | GET | /api/instructor/dashboard/ |

## Rules baked in
- The server decides access (`visible_courses`, `get_queryset`); hiding things in React is only politeness.
- Visitors never see Pro Bundles in the list; `?is_pro=true` or a Pro detail without a login answers 401.
- Course owner comes from the token; editing/deleting someone else's course answers 403.
- Checkout sends only payment method, invoice type and address; the server uses its own cart and prices.
- Order rows copy title, academy, level, image and price. An order's status follows its slowest row.
- `placed` → `shipped` (access granted) → `delivered` (certificate issued); cancelled is terminal.
