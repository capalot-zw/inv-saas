from rest_framework import generics
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleItemSerializer
# Create your views here.

class SaleListCreateView(generics.ListCreateAPIView):
  queryset = Sale.objects.all()
  serializer_class = SaleSerializer
  
  
class SaleItemListCreateView(generics.ListCreateAPIView):
  queryset= SaleItem.objects.all()
  serializer_class = SaleItemSerializer
