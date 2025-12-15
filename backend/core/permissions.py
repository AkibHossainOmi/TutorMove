from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        # For Question, owner is 'student'. For Answer, owner is 'tutor'.
        if hasattr(obj, 'student'):
            return obj.student == request.user
        if hasattr(obj, 'tutor'):
            return obj.tutor == request.user
        return False


class IsAdminOrModerator(permissions.BasePermission):
    """
    Custom permission to allow access to admin and moderator users.
    Moderators can view and delete, but cannot edit.
    """

    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow if user is admin (staff or superuser)
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Allow if user is moderator
        if hasattr(request.user, 'user_type') and request.user.user_type == 'moderator':
            return True

        return False

    def has_object_permission(self, request, view, obj):
        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins have full access
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Moderators can view (GET, HEAD, OPTIONS) and delete (DELETE) but not edit (PUT, PATCH, POST)
        if hasattr(request.user, 'user_type') and request.user.user_type == 'moderator':
            # Allow safe methods (GET, HEAD, OPTIONS) and DELETE
            if request.method in permissions.SAFE_METHODS or request.method == 'DELETE':
                return True
            # Deny edit operations (PUT, PATCH, POST)
            return False

        return False
