from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import filters, generics
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from courses.serializers import CourseSerializer
from orders.models import OrderItem
from users.permissions import IsInstructor

NEXT = {"placed": "shipped", "shipped": "delivered"}


class InstructorCourseSerializer(CourseSerializer):
    """The server can rename a field on the way out: imageUrl becomes image_url here."""

    def to_representation(self, obj):
        data = super().to_representation(obj)
        data["image_url"] = data.pop("imageUrl")
        return data


class InstructorCourses(generics.ListAPIView):  # 18
    permission_classes = [IsInstructor]
    serializer_class = InstructorCourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "academy"]

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)


def item_row(i):
    return {
        "id": i.id, "order_id": i.order_id, "course_title": i.title, "quantity": i.quantity,
        "amount": f"{i.subtotal:.2f}", "status": i.status, "learner": i.order.user.username,
        "created_at": i.order.created_at,
    }


class InstructorOrders(generics.ListAPIView):  # 19
    permission_classes = [IsInstructor]

    def get_queryset(self):
        qs = OrderItem.objects.filter(instructor=self.request.user).select_related("order__user")
        s = self.request.query_params.get("status")
        qs = qs.order_by("-order__created_at", "-id")
        return qs.filter(status=s) if s else qs

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        return self.get_paginated_response([item_row(i) for i in page])


class InstructorOrderItem(APIView):  # 20 - move one row forward
    permission_classes = [IsInstructor]

    def patch(self, request, pk):
        item = get_object_or_404(OrderItem.objects.select_related("order__user"), pk=pk, instructor=request.user)
        if NEXT.get(item.status) != request.data.get("status"):
            raise ValidationError({"detail": f"A {item.status} item cannot move to '{request.data.get('status')}'."})
        item.status = NEXT[item.status]
        item.save()
        return Response(item_row(item))


class Dashboard(APIView):  # 21
    permission_classes = [IsInstructor]

    def get(self, request):
        sold = OrderItem.objects.filter(instructor=request.user).exclude(status="cancelled")
        today = timezone.localdate()
        days = []
        for n in range(6, -1, -1):  # always seven bars, empty days included
            d = today - timedelta(days=n)
            rows = [i for i in sold.select_related("order") if timezone.localtime(i.order.created_at).date() == d]
            days.append({"date": d.isoformat(), "label": d.strftime("%a"), "seats": sum(i.quantity for i in rows),
                         "revenue": f"{sum(i.subtotal for i in rows):.2f}"})
        top = {}
        for i in sold:
            t = top.setdefault(i.title, {"title": i.title, "seats": 0, "revenue": 0})
            t["seats"] += i.quantity
            t["revenue"] += float(i.subtotal)
        by_status = {s: OrderItem.objects.filter(instructor=request.user, status=s).count()
                     for s in OrderItem.STATUSES}
        return Response({
            "total_courses": Course.objects.filter(instructor=request.user).count(),
            "total_orders": sold.values("order").distinct().count(),
            "total_seats": sold.aggregate(n=Sum("quantity"))["n"] or 0,
            "total_revenue": f"{sum(i.subtotal for i in sold):.2f}",
            "to_grant": by_status["placed"],
            "last_7_days": days,
            "top_courses": sorted(top.values(), key=lambda t: -t["revenue"])[:5],
            "by_status": by_status,
        })
