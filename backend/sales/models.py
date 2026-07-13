from django.db import models
from django.conf import settings
from products.models import Product

# Create your models here.
class Sale(models.Model):
  PAYMENT_CHOICES = [
      ('card', 'Card'),
      ('cash', 'Cash'),
      ('bank transfer', 'Bank Transfer'),
      ('ecocash', 'EcoCash')
    ]
    
  cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  total = models.DecimalField(max_digits=10, decimal_places=2)
  payment_method = models.CharField(max_length=15, choices=PAYMENT_CHOICES, default='cash')
  time_stamp= models.DateTimeField(auto_now_add=True)
  synced=models.BooleanField(default=False)
  

class SaleItem(models.Model):
  sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  quantity = models.IntegerField()
  price_at_sale = models.DecimalField(max_digits=10, decimal_places=2)
  