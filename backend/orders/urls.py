from django.urls import path

from .views import OrderCancel, OrderDetail, OrderListCreate

urlpatterns = [
    path("", OrderListCreate.as_view()),
    path("<int:pk>/", OrderDetail.as_view()),
    path("<int:pk>/cancel/", OrderCancel.as_view()),
]
