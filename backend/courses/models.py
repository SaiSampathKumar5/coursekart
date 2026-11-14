from django.conf import settings
from django.db import models


class Course(models.Model):
    CATEGORIES = ["Programming", "Design", "Data Science", "Business", "Music"]
    LEVELS = ["Beginner", "Intermediate", "Advanced"]

    title = models.CharField(max_length=200)
    academy = models.CharField(max_length=120)
    level = models.CharField(max_length=20, choices=[(x, x) for x in LEVELS], default="Beginner")
    duration_hours = models.PositiveIntegerField(default=1)
    category = models.CharField(max_length=30, choices=[(x, x) for x in CATEGORIES])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    imageUrl = models.URLField(blank=True)
    rating = models.FloatField(default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    availability = models.CharField(max_length=10, choices=[("Open", "Open"), ("Closed", "Closed")], default="Open")
    is_pro = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="courses")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title
