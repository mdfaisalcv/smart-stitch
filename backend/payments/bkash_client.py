"""
Thin client for bKash's Tokenized Checkout API.

Docs: https://developer.bka.sh/docs/tokenized-checkout-overview

Flow used here:
  1. grant_token()   -> id_token (cached ~55 min; bKash tokens last 1hr)
  2. create_payment() -> bkashURL to redirect the customer to
  3. execute_payment() -> called from our callback once bKash redirects back
"""
import requests
from django.conf import settings
from django.core.cache import cache

BASE_URL = (
    "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    if settings.PAYMENT_SANDBOX
    else "https://tokenized.pay.bka.sh/v1.2.0-beta"
)

CACHE_KEY = "bkash_id_token"


class BkashError(Exception):
    pass


def _headers(id_token=None):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-App-Key": settings.BKASH_APP_KEY,
    }
    if id_token:
        headers["Authorization"] = id_token
    return headers


def grant_token():
    """Returns a cached id_token, requesting a fresh one if expired."""
    token = cache.get(CACHE_KEY)
    if token:
        return token

    resp = requests.post(
        f"{BASE_URL}/tokenized/checkout/token/grant",
        json={
            "app_key": settings.BKASH_APP_KEY,
            "app_secret": settings.BKASH_APP_SECRET,
        },
        headers={
            "Content-Type": "application/json",
            "username": settings.BKASH_USERNAME,
            "password": settings.BKASH_PASSWORD,
        },
        timeout=15,
    )
    data = resp.json()
    if "id_token" not in data:
        raise BkashError(data.get("errorMessage", "Failed to get bKash token"))

    # bKash id_token is valid ~1hr; cache slightly under that.
    cache.set(CACHE_KEY, data["id_token"], timeout=55 * 60)
    return data["id_token"]


def create_payment(amount, invoice_number, callback_url):
    id_token = grant_token()
    resp = requests.post(
        f"{BASE_URL}/tokenized/checkout/create",
        json={
            "mode": "0011",  # checkout (URL based)
            "payerReference": invoice_number,
            "callbackURL": callback_url,
            "amount": str(amount),
            "currency": "BDT",
            "intent": "sale",
            "merchantInvoiceNumber": invoice_number,
        },
        headers=_headers(id_token),
        timeout=15,
    )
    data = resp.json()
    if "bkashURL" not in data:
        raise BkashError(data.get("errorMessage", "Failed to create bKash payment"))
    return data  # includes paymentID, bkashURL


def execute_payment(payment_id):
    id_token = grant_token()
    resp = requests.post(
        f"{BASE_URL}/tokenized/checkout/execute",
        json={"paymentID": payment_id},
        headers=_headers(id_token),
        timeout=15,
    )
    return resp.json()  # includes transactionStatus: "Completed" | "Failed"


def query_payment(payment_id):
    """Optional: verify a payment's status independently of the callback."""
    id_token = grant_token()
    resp = requests.post(
        f"{BASE_URL}/tokenized/checkout/payment/status",
        json={"paymentID": payment_id},
        headers=_headers(id_token),
        timeout=15,
    )
    return resp.json()
