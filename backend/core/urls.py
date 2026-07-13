from django.urls import path
from .views import BusinessSettingsListCreateView

urlpatterns = [
    path('core/', BusinessSettingsListCreateView.as_view(), name='business-settings-list-create')
  ]