from django.urls import path

from .views import Dashboard, InstructorCourses, InstructorOrderItem, InstructorOrders

urlpatterns = [
    path("courses/", InstructorCourses.as_view()),
    path("orders/", InstructorOrders.as_view()),
    path("orders/<int:pk>/", InstructorOrderItem.as_view()),
    path("dashboard/", Dashboard.as_view()),
]
