from rest_framework import generics
from .serializers import UserSerializer
from .models import User

# Create your views here.
class UserListCreateView(generics.ListCreateAPIView):
  queryset = User.objects.all()
  serializer_class = UserSerializer
  
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'role': request.user.role,
        })