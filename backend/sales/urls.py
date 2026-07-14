from django.urls import path
from .views import SaleListCreateView, SaleItemListCreateView, CheckoutView, AllSalesView

urlpatterns = [
  path('sales/', SaleListCreateView.as_view(), name='sale-list-create'),
  path('sales/items/', SaleItemListCreateView.as_view(), name='sale-item-list-create'),
  path('sales/checkout/', CheckoutView.as_view(), name='checkout'),
  path('sales/all/', AllSalesView.as_view(), name='all-sales'),
  ]
