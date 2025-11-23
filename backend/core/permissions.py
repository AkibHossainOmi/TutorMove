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
