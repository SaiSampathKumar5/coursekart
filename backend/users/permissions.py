from rest_framework.permissions import BasePermission


class IsInstructor(BasePermission):
    message = "Only instructors can do this."

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.user_type == "instructor")
