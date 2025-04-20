from rest_framework.permissions import BasePermission, IsAuthenticated
from django.contrib.auth.models import User
from .models import UserProfile, Company, Vacancies

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD']:
            return True
        return IsAuthenticated().has_permission(request, view) and request.user.is_staff

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser

class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        if not IsAuthenticated().has_permission(request, view):
            return False
        try:
            return request.user.userprofile.admin_type == 'employer'
        except UserProfile.DoesNotExist:
            return False

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        if not IsAuthenticated().has_permission(request, view):
            return False
        try:
            return request.user.userprofile.admin_type == 'admin'
        except UserProfile.DoesNotExist:
            return False

class IsEmployerOwner(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        company_id = request.data.get('company') or view.kwargs.get('company_id')
        if not company_id:
            return Company.objects.filter(owner=request.user).exists()
        try:
            company = Company.objects.get(id=company_id)
            return company.owner == request.user
        except (Company.DoesNotExist, ValueError):
            return False

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Vacancies):
            return obj.company.owner == request.user
        if isinstance(obj, Company):
            return obj.owner == request.user
        return False
    
class IsEmployerOrAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not IsAuthenticated().has_permission(request, view):
            return False
        try:
            return (
                request.user.userprofile.admin_type in ['employer', 'super'] or
                request.user.is_superuser
            )
        except UserProfile.DoesNotExist:
            return request.user.is_superuser