from django.db import models

# Create your models here.
class BusinessSettings(models.Model):
  business_name= models.CharField(max_length=100)
  logo = models.ImageField(upload_to='logos/', blank=True, null=True)
  receipt_header = models.CharField(max_length=100, blank=True, null=True)
  receipt_footer = models.CharField(max_length=100, blank=True, null=True)
  