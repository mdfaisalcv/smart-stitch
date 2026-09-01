from django.urls import path
from .views import PaymentInitView, PaymentCallbackView, BkashCallbackView

urlpatterns = [
    path('init/', PaymentInitView.as_view(), name='payment-init'),
    path('callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    path('bkash/callback/', BkashCallbackView.as_view(), name='bkash-callback'),
]
