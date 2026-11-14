import os
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from courses.models import Course
from orders.models import Order, OrderItem
from users.models import User

CATALOGUE = {
    "Programming": (["CodeCraft Academy", "ByteBridge Institute", "DevForge School"], [
        "JavaScript Essentials", "HTML & CSS from Scratch", "Git and GitHub Workflow", "Data Structures in Python",
        "SQL for Beginners", "React Fundamentals", "Advanced React Patterns",
        "Python for Absolute Beginners", "Full-Stack Web Development Bootcamp", "Django REST APIs", "Node.js Backend Mastery",
        "Algorithms and Interview Prep", "TypeScript in Practice", "System Design Basics", "Clean Code Habits"]),
    "Design": (["PixelForge Studio", "Canvas & Co Academy", "Hue Labs"], [
        "UI Design Foundations", "Figma for Beginners", "Colour Theory Made Simple", "Typography Essentials",
        "UX Research Methods", "Design Systems at Scale", "Logo and Brand Identity", "Motion Design Basics",
        "Mobile App Design", "Illustration with Vectors", "Portfolio That Gets Calls", "Accessibility in Design",
        "Prototyping Interactions", "Poster and Print Design"]),
    "Data Science": (["DataNest Institute", "InsightWorks Academy", "Vector Labs"], [
        "Statistics for Data Science", "Pandas in Practice", "Data Visualisation with Python", "Machine Learning 101",
        "Deep Learning Foundations", "SQL for Analytics", "Power BI Dashboards", "Feature Engineering",
        "Natural Language Processing", "Time Series Forecasting", "A/B Testing Handbook", "MLOps Essentials",
        "Applied Data Science Capstone"]),
    "Business": (["BizSpring Academy", "Ledger & Lane School", "Summit Business Institute"], [
        "Startup Fundamentals", "Digital Marketing Basics", "Excel for Business", "Financial Accounting Basics",
        "Product Management 101", "Negotiation Skills", "Public Speaking with Confidence", "Sales Playbook",
        "Business Analytics", "Leadership for New Managers", "Project Management Essentials",
        "Growth Strategy Masterclass"]),
}
PRO_IDS = {9, 11, 18, 20, 42, 50}
LEVELS = ["Beginner", "Intermediate", "Advanced"]


class Command(BaseCommand):
    help = "Seed two users and 54 courses (safe to run twice). --with-orders adds six finished orders."

    def add_arguments(self, parser):
        parser.add_argument("--with-orders", action="store_true")

    def handle(self, *args, **opts):
        priya, _ = User.objects.get_or_create(username="Priya", defaults={"user_type": "instructor"})
        arjun, _ = User.objects.get_or_create(username="Arjun", defaults={"user_type": "learner"})
        for u, t in ((priya, "instructor"), (arjun, "learner")):
            u.user_type = t
            u.set_password("secret123")
            u.save()

        base_url = (os.environ.get("BACKEND_URL") or os.environ.get("RENDER_EXTERNAL_URL") or "http://localhost:8000").rstrip("/")
        rnd = random.Random(7)
        pk = 0
        for category, (academies, titles) in CATALOGUE.items():
            for n, title in enumerate(titles):
                pk += 1
                pro = pk in PRO_IDS
                level = "Advanced" if pro else LEVELS[n % 3]
                price = Decimal(rnd.choice([499, 599, 799, 999, 1299, 1499, 1999]))
                hours = rnd.randint(4, 30)
                academy = academies[n % 3]
                if pro:
                    price, hours = Decimal(rnd.choice([2999, 3999, 4999])), rnd.randint(40, 80)
                if pk == 8:
                    level, price, hours = "Beginner", Decimal(799), 12
                if pk == 9:
                    level, price, hours, academy = "Intermediate", Decimal(4999), 64, "CodeCraft Academy"
                Course.objects.update_or_create(id=pk, defaults=dict(
                    title=title, academy=academy, level=level, duration_hours=hours, category=category,
                    price=price, imageUrl=f"{base_url}/api/courses/{pk}/cover/",
                    rating=round(rnd.uniform(3.6, 4.9), 1) if pk != 9 else 4.7,
                    total_reviews=rnd.randint(20, 900), availability="Closed" if pk in (14, 33) else "Open",
                    is_pro=pro, instructor=priya,
                    description=f"{title} by {academy}: {hours} hours of video taught step by step, "
                                f"pitched at {level.lower()} learners.",
                ))
        self.stdout.write(self.style.SUCCESS(f"{Course.objects.count()} courses ready."))

        if opts["with_orders"] and not Order.objects.filter(user=arjun).exists():
            open_courses = list(Course.objects.filter(availability="Open", is_pro=False))
            now = timezone.now()
            for day in (6, 5, 4, 3, 1, 0):
                o = Order.objects.create(
                    user=arjun, payment_method="COD", invoice_type=rnd.choice(["PERSONAL", "COMPANY"]),
                    full_name="Arjun K", phone="9876543210", address="12 Park Street", city="Hyderabad",
                    state="Telangana", pincode="500001")
                for c in rnd.sample(open_courses, 2):
                    OrderItem.objects.create(order=o, course=c, instructor=c.instructor, title=c.title,
                                             academy=c.academy, level=c.level, imageUrl=c.imageUrl,
                                             price=c.price, quantity=rnd.randint(1, 3), status="delivered")
                Order.objects.filter(pk=o.pk).update(created_at=now - timedelta(days=day, hours=1))
            self.stdout.write(self.style.SUCCESS("6 finished orders added."))
