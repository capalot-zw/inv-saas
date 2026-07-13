from django.urls import path
from .views import SaleListCreateView, SaleItemListCreateView

urlpatterns = [
  path('sales/', SaleListCreateView.as_view(), name='sale-list-create'),
  path('sales/items/', SaleItemListCreateView.as_view(), name='sale-item-list-create'),
  ]
