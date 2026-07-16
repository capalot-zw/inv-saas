from django.urls import path
from .views import (
    SaleListCreateView,
    SaleItemListCreateView,
    CheckoutView,
    AllSalesView,
    TopProductsView,
)

urlpatterns = [
    path('sales/', SaleListCreateView.as_view(), name='sale-list-create'),
    path('sales/items/', SaleItemListCreateView.as_view(), name='saleitem-list-create'),
    path('sales/checkout/', CheckoutView.as_view(), name='checkout'),
    path('sales/all/', AllSalesView.as_view(), name='all-sales'),
    path('sales/top-products/', TopProductsView.as_view(), name='top-products'),
]