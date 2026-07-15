from django.urls import path
from .views import UserListCreateView, CurrentUserView, UserDetailView

urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]