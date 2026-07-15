from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleItemSerializer

class SaleListCreateView(generics.ListCreateAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Sale.objects.filter(cashier=self.request.user)

    def perform_create(self, serializer):
        serializer.save(cashier=self.request.user)

class SaleItemListCreateView(generics.ListCreateAPIView):
    queryset = SaleItem.objects.all()
    serializer_class = SaleItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        if product.quantity < quantity:
            raise ValidationError(
                f'Not enough stock for {product.name}. Only {product.quantity} left.'
            )

        product.quantity -= quantity
        product.save()

        serializer.save()
        
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from products.models import Product

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', 'cash')

        if not items_data:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: validate stock for every item BEFORE touching the database
        products_to_update = []
        total = 0
        for item in items_data:
            try:
                product = Product.objects.get(id=item['product'])
            except Product.DoesNotExist:
                return Response({'error': f"Product {item['product']} not found"}, status=status.HTTP_400_BAD_REQUEST)

            quantity = item['quantity']
            if product.quantity < quantity:
                return Response(
                    {'error': f'Not enough stock for {product.name}. Only {product.quantity} left.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            products_to_update.append((product, quantity))
            total += float(product.price) * quantity

        # Step 2: everything validated — now commit it all together
        with transaction.atomic():
            sale = Sale.objects.create(cashier=request.user, total=total, payment_method=payment_method)
            for product, quantity in products_to_update:
                SaleItem.objects.create(
                    sale=sale,
                    product=product,
                    quantity=quantity,
                    price_at_sale=product.price,
                )
                product.quantity -= quantity
                product.save()

        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)    
        
        
from .permissions import IsManagerOrAdmin

class AllSalesView(generics.ListAPIView):
    queryset = Sale.objects.all().order_by('-time_stamp')
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
from django.db.models import Sum
from .permissions import IsManagerOrAdmin

class TopProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]

    def get(self, request):
        top = (
            SaleItem.objects.values('product__id', 'product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:5]
        )
        return Response(list(top))    