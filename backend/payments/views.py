"""
Payment initiation & callback.

- method == 'bkash' -> calls the real bKash Tokenized Checkout API
  (see bkash_client.py). Requires BKASH_* settings to be configured.
- other methods (cod, nagad, card) -> still use the mock flow until you
  wire up their real gateways the same way.
"""
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order
from .models import Payment
from . import bkash_client


class PaymentInitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_number = request.data.get('order_number')
        method = request.data.get('method', 'bkash')
        order = get_object_or_404(Order, order_number=order_number, user=request.user)

        payment = Payment.objects.create(order=order, method=method, amount=order.total)

        if method == 'bkash':
            try:
                callback_url = f"{settings.BACKEND_URL}/api/payments/bkash/callback/"
                result = bkash_client.create_payment(
                    amount=order.total,
                    invoice_number=order.order_number,
                    callback_url=callback_url,
                )
            except bkash_client.BkashError as e:
                payment.status = 'failed'
                payment.save(update_fields=['status'])
                return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

            payment.bkash_payment_id = result['paymentID']
            payment.save(update_fields=['bkash_payment_id'])

            return Response({
                'transaction_id': payment.transaction_id,
                'gateway_url': result['bkashURL'],
                'sandbox': settings.PAYMENT_SANDBOX,
            })

        # ---- mock flow for other payment methods ----
        gateway_url = (
            f"{settings.FRONTEND_URL}/pay/mock"
            f"?txn={payment.transaction_id}&order={order.order_number}&amount={order.total}&method={method}"
        )
        return Response({
            'transaction_id': payment.transaction_id,
            'gateway_url': gateway_url,
            'sandbox': settings.PAYMENT_SANDBOX,
        })


class BkashCallbackView(APIView):
    """
    bKash redirects the browser here after the user authorizes (or cancels)
    on their hosted page, adding ?paymentID=...&status=success|failure|cancel
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        payment_id = request.query_params.get('paymentID')
        bkash_status = request.query_params.get('status')  # success | failure | cancel

        payment = get_object_or_404(Payment, bkash_payment_id=payment_id)

        if bkash_status != 'success':
            payment.status = 'cancelled' if bkash_status == 'cancel' else 'failed'
            payment.save(update_fields=['status'])
        else:
            result = bkash_client.execute_payment(payment_id)
            if result.get('transactionStatus') == 'Completed':
                payment.status = 'success'
                payment.bkash_trx_id = result.get('trxID', '')
                payment.save(update_fields=['status', 'bkash_trx_id'])
                payment.order.status = 'paid'
                payment.order.save(update_fields=['status'])
            else:
                payment.status = 'failed'
                payment.save(update_fields=['status'])

        # Send the browser back to the frontend order page.
        return Response(status=302, headers={
            'Location': f"{settings.FRONTEND_URL}/orders/{payment.order.order_number}"
        })


class PaymentCallbackView(APIView):
    """Kept for the mock flow (cod / nagad / card placeholder)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        result = request.data.get('result')  # 'success' | 'failed' | 'cancelled'

        payment = get_object_or_404(Payment, transaction_id=transaction_id, order__user=request.user)
        payment.status = result if result in dict(Payment.STATUS_CHOICES) else 'failed'
        payment.save(update_fields=['status'])

        if payment.status == 'success':
            payment.order.status = 'paid'
            payment.order.save(update_fields=['status'])

        return Response({
            'transaction_id': payment.transaction_id,
            'status': payment.status,
            'order_number': payment.order.order_number,
            'order_status': payment.order.status,
        })
