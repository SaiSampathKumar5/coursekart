from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.access import visible_courses

from .models import Cart, CartItem
from .serializers import CartSerializer


def my_cart(user):
    return Cart.objects.get_or_create(user=user)[0]


def cart_response(user, code=status.HTTP_200_OK):
    return Response(CartSerializer(my_cart(user)).data, status=code)


def read_quantity(data):
    try:
        q = int(data.get("quantity", 1))
    except (TypeError, ValueError):
        raise ValidationError({"quantity": ["Enter a whole number."]})
    if q < 1 or q > 99:
        raise ValidationError({"quantity": ["Seats must be between 1 and 99."]})
    return q


class CartView(APIView):
    def get(self, request):
        return cart_response(request.user)


class CartAdd(APIView):
    def post(self, request):
        course = get_object_or_404(visible_courses(request.user), pk=request.data.get("course"))
        if course.availability != "Open":
            raise ValidationError({"course": ["This course is closed for enrolment."]})
        qty = read_quantity(request.data)
        row, created = CartItem.objects.get_or_create(
            cart=my_cart(request.user), course=course, defaults={"quantity": qty}
        )
        if not created:
            row.quantity = min(99, row.quantity + qty)
            row.save()
        return cart_response(request.user, status.HTTP_201_CREATED)


class CartItemView(APIView):
    def row(self, request, pk):
        return get_object_or_404(CartItem, pk=pk, cart__user=request.user)

    def patch(self, request, pk):  # SETS the quantity, does not add to it
        row = self.row(request, pk)
        row.quantity = read_quantity(request.data)
        row.save()
        return cart_response(request.user)

    def delete(self, request, pk):
        self.row(request, pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
