from rest_framework import serializers

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "academy", "level", "duration_hours", "category", "price", "imageUrl",
            "rating", "total_reviews", "availability", "is_pro", "description", "instructor_name",
        ]
        read_only_fields = ["rating", "total_reviews"]
