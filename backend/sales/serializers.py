from rest_framework import serializers
from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = '__all__'


class SaleItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_sale']


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['cashier']


class SaleDetailSerializer(serializers.ModelSerializer):
    items = SaleItemDetailSerializer(source='saleitem_set', many=True, read_only=True)
    cashier_username = serializers.CharField(source='cashier.username', read_only=True)

    class Meta:
        model = Sale
        fields = ['id', 'cashier', 'cashier_username', 'total', 'payment_method', 'time_stamp', 'synced', 'items']
        read_only_fields = ['cashier']