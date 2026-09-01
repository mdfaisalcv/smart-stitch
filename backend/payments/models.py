import uuid
from django.db import models
from orders.models import Order


class Payment(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=64, unique=True, editable=False)
    method = models.CharField(max_length=30)  # bkash, nagad, card
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    # bKash-specific references, returned by their API
    bkash_payment_id = models.CharField(max_length=64, blank=True, db_index=True)
    bkash_trx_id = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN{uuid.uuid4().hex[:14].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id} ({self.status})"
