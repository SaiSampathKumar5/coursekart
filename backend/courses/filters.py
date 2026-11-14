import django_filters as df

from .models import Course


class CourseFilter(df.FilterSet):
    rating = df.NumberFilter(field_name="rating", lookup_expr="gte")  # rating=4 means 4 and up

    class Meta:
        model = Course
        fields = ["category", "academy", "is_pro", "rating"]
