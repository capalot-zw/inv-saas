from rest_framework import generics, permissions
from .models import Product
from .serializers import ProductSerializer
from sales.permissions import IsManagerOrAdmin


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.AllowAny()]


class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]