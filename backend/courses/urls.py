from django.urls import path

from .views import CourseDetail, CourseList, cover

urlpatterns = [
    path("", CourseList.as_view()),
    path("<int:pk>/", CourseDetail.as_view()),
    path("<int:pk>/cover/", cover),
]
