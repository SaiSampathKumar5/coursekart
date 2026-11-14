from django.conf import settings
from django.db import models

from courses.models import Course

RANK = {"placed": 0, "shipped": 1, "delivered": 2}


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    payment_method = models.CharField(max_length=10, choices=[("COD", "Pay Later"), ("ONLINE", "Pay Now")])
    invoice_type = models.CharField(max_length=10, choices=[("PERSONAL", "Personal"), ("COMPANY", "Company")])
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=250)
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    pincode = models.CharField(max_length=12)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    @property
    def status(self):
        """The order moves at the pace of its slowest row."""
        states = [i.status for i in self.items.all()]
        live = [s for s in states if s != "cancelled"]
        if not live:
            return "cancelled"
        return min(live, key=lambda s: RANK[s])

    @property
    def is_paid(self):
        return self.payment_method == "ONLINE" or self.status == "delivered"

    @property
    def can_cancel(self):
        return all(i.status == "placed" for i in self.items.all())

    @property
    def total_price(self):
        return sum(i.price * i.quantity for i in self.items.all() if i.status != "cancelled")


class OrderItem(models.Model):
    STATUSES = ["placed", "shipped", "delivered", "cancelled"]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    # The course details are COPIED, so old bills keep the price actually paid.
    course = models.ForeignKey(Course, null=True, blank=True, on_delete=models.SET_NULL)
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="sold_items")
    title = models.CharField(max_length=200)
    academy = models.CharField(max_length=120)
    level = models.CharField(max_length=20)
    imageUrl = models.URLField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=10, choices=[(s, s) for s in STATUSES], default="placed")

    class Meta:
        ordering = ["id"]

    @property
    def subtotal(self):
        return self.price * self.quantity
