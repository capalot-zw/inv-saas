from django.db import models

# Create your models here.

class Product(models.Model):
  name = models.CharField(max_length=35)
  quantity = models.IntegerField()
  price = models.DecimalField(max_digits=10, decimal_places=2)
  description= models.CharField(max_length=35, blank=True, null=True)
  sku = models.CharField(max_length=12, unique=True)
  category=models.CharField(max_length=15, blank=True, null=True)
  
  def __str__(self):
    return self.name
    
