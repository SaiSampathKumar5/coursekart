from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    LEARNER, INSTRUCTOR = "learner", "instructor"
    user_type = models.CharField(
        max_length=10, choices=[(LEARNER, "Learner"), (INSTRUCTOR, "Instructor")], default=LEARNER
    )
