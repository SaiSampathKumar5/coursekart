from django.urls import path

from .views import CartAdd, CartItemView, CartView

urlpatterns = [
    path("", CartView.as_view()),
    path("add/", CartAdd.as_view()),
    path("items/<int:pk>/", CartItemView.as_view()),
]
