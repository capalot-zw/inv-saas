from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
  ROLE_CHOICES =[
    ('cashier', 'Cashier'),
    ('manager', 'Manager'),
    ('admin', 'Admin')
    ]
  role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='cashier')