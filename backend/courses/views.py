import textwrap

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.html import escape
from rest_framework import filters, generics, permissions
from rest_framework.exceptions import NotAuthenticated

from users.permissions import IsInstructor

from .access import visible_courses
from .filters import CourseFilter
from .models import Course
from .serializers import CourseSerializer


class CourseList(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    filterset_class = CourseFilter
    filter_backends = [
        *generics.ListCreateAPIView.filter_backends,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["title", "academy"]
    ordering_fields = ["price", "rating", "id"]
    ordering = ["id"]

    def get_permissions(self):
        return [IsInstructor()] if self.request.method == "POST" else [permissions.AllowAny()]

    # get_queryset (not queryset): it runs on every request, so it can know who is asking.
    def get_queryset(self):
        user = self.request.user
        wants_pro = self.request.query_params.get("is_pro", "").lower() in ("true", "1")
        if wants_pro and not user.is_authenticated:
            raise NotAuthenticated("Log in to see Pro Bundles.")
        return visible_courses(user)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)  # owner comes from the token


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor_id == request.user.id


class CourseDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_object(self):
        obj = super().get_object()
        if obj.is_pro and not self.request.user.is_authenticated:
            raise NotAuthenticated("Log in to open Pro Bundles.")
        return obj


COVERS = {
    "Programming": ("#1e3a8a", "#3b82f6", "💻"),
    "Design": ("#9d174d", "#f472b6", "🎨"),
    "Data Science": ("#064e3b", "#10b981", "📊"),
    "Business": ("#78350f", "#f59e0b", "💼"),
    "Music": ("#4c1d95", "#a78bfa", "🎵"),
}


def cover(request, pk):
    """A cover picture drawn from the course's own title, subject and academy."""
    c = get_object_or_404(Course, pk=pk)
    dark, light, icon = COVERS.get(c.category, ("#1b1f4b", "#6366f1", "📘"))
    lines = textwrap.wrap(c.title, 20)[:3]
    title = "".join(
        f'<tspan x="24" dy="{0 if i == 0 else 30}">{escape(line)}</tspan>' for i, line in enumerate(lines)
    )
    pro = '<rect x="24" y="20" width="48" height="22" rx="11" fill="#f5c451"/>' \
          '<text x="48" y="36" font-size="12" font-weight="700" text-anchor="middle" fill="#1b1f4b" ' \
          'font-family="Arial,sans-serif">PRO</text>' if c.is_pro else ""
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225">'
        f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{dark}"/>'
        f'<stop offset="1" stop-color="{light}"/></linearGradient></defs>'
        '<rect width="400" height="225" fill="url(#g)"/>'
        f'{pro}<text x="352" y="64" font-size="40" text-anchor="middle">{icon}</text>'
        f'<text x="24" y="104" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#fff">{title}</text>'
        f'<text x="24" y="204" font-family="Arial,sans-serif" font-size="13" fill="#fff" opacity=".85">'
        f'{escape(c.academy)} · {escape(c.level)}</text></svg>'
    )
    return HttpResponse(svg, content_type="image/svg+xml")
