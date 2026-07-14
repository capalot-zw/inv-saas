from rest_framework import permissions


class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['manager', 'admin']