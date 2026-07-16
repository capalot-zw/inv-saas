from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleItemSerializer, SaleDetailSerializer
from .permissions import IsManagerOrAdmin
from products.models import Product


class SaleListCreateView(generics.ListCreateAPIView):
    serializer_class = SaleDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Sale.objects.filter(cashier=self.request.user).order_by('-time_stamp')

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


class AllSalesView(generics.ListAPIView):
    queryset = Sale.objects.all().order_by('-time_stamp')
    serializer_class = SaleDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


class TopProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]

    def get(self, request):
        top = (
            SaleItem.objects.values('product__id', 'product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:5]
        )
        return Response(list(top))


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', 'cash')

        if not items_data:
            return Response({'error': 'Cart is empty'}, status=400)

        products_to_update = []
        total = 0
        for item in items_data:
            try:
                product = Product.objects.get(id=item['product'])
            except Product.DoesNotExist:
                return Response({'error': f"Product {item['product']} not found"}, status=400)

            quantity = item['quantity']
            if product.quantity < quantity:
                return Response(
                    {'error': f'Not enough stock for {product.name}. Only {product.quantity} left.'},
                    status=400
                )
            products_to_update.append((product, quantity))
            total += float(product.price) * quantity

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

        return Response(SaleDetailSerializer(sale).data, status=201)