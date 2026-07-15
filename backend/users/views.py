from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import ProtectedError
from .models import User
from .serializers import UserSerializer
from sales.permissions import IsManagerOrAdmin


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'role': request.user.role,
        })


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        if user == request.user:
            return Response({'error': 'You cannot delete your own account.'}, status=400)
        try:
            user.delete()
            return Response(status=204)
        except ProtectedError:
            return Response(
                {'error': 'Cannot delete this user — they have sales history linked to their account.'},
                status=400
            )