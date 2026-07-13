from rest_framework import generics
from .serializers import BusinessSettingsSerializer
from .models import BusinessSettings

# Create your views here.
class BusinessSettingsListCreateView(generics.ListCreateAPIView):
  queryset = BusinessSettings.objects.all()
  serializer_class = BusinessSettingsSerializer