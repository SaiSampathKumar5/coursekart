from .models import Course


def visible_courses(user):
    """The one place that says who sees what: visitors never see Pro Bundles."""
    qs = Course.objects.all()
    if not (user and user.is_authenticated):
        qs = qs.filter(is_pro=False)
    return qs
