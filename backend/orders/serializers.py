from rest_framework import serializers

from .models import Order, OrderItem

ADDRESS_FIELDS = ["full_name", "phone", "address", "city", "state", "pincode"]


class AddressSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100)
    phone = serializers.RegexField(r"^\d{10}$", error_messages={"invalid": "Phone must be 10 digits."})
    address = serializers.CharField(max_length=250)
    city = serializers.CharField(max_length=80)
    state = serializers.CharField(max_length=80)
    pincode = serializers.RegexField(r"^\d{6}$", error_messages={"invalid": "Pincode must be 6 digits."})


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=["COD", "ONLINE"])
    invoice_type = serializers.ChoiceField(choices=["PERSONAL", "COMPANY"])
    address = AddressSerializer()


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "course", "title", "academy", "level", "imageUrl", "price", "quantity", "subtotal", "status"]


class OrderSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_items = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "created_at", "status", "payment_method", "invoice_type", "is_paid", "can_cancel",
                  "total_price", "total_items", "address", "items"]

    def get_total_items(self, o):
        return sum(i.quantity for i in o.items.all() if i.status != "cancelled")

    def get_address(self, o):
        return {f: getattr(o, f) for f in ADDRESS_FIELDS}
