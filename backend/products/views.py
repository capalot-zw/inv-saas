from rest_framework import generics
from .serializers import ProductSerializer
from .models import Product

class ProductListCreateView(generics.ListCreateAPIView):
  queryset = Product.objects.all()
  serializer_class = ProductSerializer
