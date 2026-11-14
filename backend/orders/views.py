from django.db import transaction
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart

from .models import Order, OrderItem
from .serializers import CheckoutSerializer, OrderSerializer


class OrderListCreate(generics.ListAPIView):
    """GET = my orders (14). POST = checkout (15)."""
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    @transaction.atomic
    def post(self, request):
        data = CheckoutSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        cart = Cart.objects.filter(user=request.user).first()
        rows = list(cart.items.select_related("course")) if cart else []
        if not rows:
            raise ValidationError({"detail": "Your cart is empty."})
        closed = [r.course.title for r in rows if r.course.availability != "Open"]
        if closed:
            raise ValidationError({"detail": f"No longer open: {', '.join(closed)}"})
        v = data.validated_data
        order = Order.objects.create(
            user=request.user, payment_method=v["payment_method"], invoice_type=v["invoice_type"], **v["address"]
        )
        for r in rows:  # the server's own cart and prices, never the browser's total
            c = r.course
            OrderItem.objects.create(
                order=order, course=c, instructor=c.instructor, title=c.title, academy=c.academy,
                level=c.level, imageUrl=c.imageUrl, price=c.price, quantity=r.quantity,
            )
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetail(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):  # somebody else's order id is a 404
        return Order.objects.filter(user=self.request.user)


class OrderCancel(APIView):
    @transaction.atomic
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if not order.can_cancel or order.status == "cancelled":
            raise ValidationError({"detail": "This order can no longer be cancelled."})
        order.items.update(status="cancelled")
        return Response(OrderSerializer(Order.objects.get(pk=pk)).data)
