import os
import requests

class SSLCommerzPayment:
    def __init__(self, store_id=None, store_password=None):
        self.store_id = store_id or os.getenv('SSLCOMMERZ_STORE_ID', 'tutor68298baf61ba2')
        self.store_password = store_password or os.getenv('SSLCOMMERZ_STORE_PASSWORD', 'tutor68298baf61ba2@ssl')
        self.session_api = os.getenv('SSLCOMMERZ_SESSION_API', 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php')
        self.validation_api = os.getenv('SSLCOMMERZ_VALIDATION_API', 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php')

    def get_payment_urls(self, frontend_base='http://localhost:3000/credit-purchase'):
        return {
            'success_url': f'{frontend_base}?success=1',
            'fail_url': f'{frontend_base}?fail=1',
            'cancel_url': f'{frontend_base}?cancel=1',
        }

    def initiate_payment(self, payment_data):
        data = {
            'store_id': self.store_id,
            'store_passwd': self.store_password,
            **payment_data
        }
        try:
            response = requests.post(self.session_api, data=data)
            return response.json()
        except Exception as e:
            return {'status': 'FAILED', 'error': str(e)}

    def validate_transaction(self, val_id):
        params = {
            'val_id': val_id,
            'store_id': self.store_id,
            'store_passwd': self.store_password,
            'format': 'json'
        }
        try:
            response = requests.get(self.validation_api, params=params)
            return response.json()
        except Exception as e:
            return {'status': 'FAILED', 'error': str(e)}

    def verify_ipn(self, ipn_data):
        val_id = ipn_data.get('val_id')
        if not val_id:
            return False
        validation_result = self.validate_transaction(val_id)
        return validation_result.get('status') == 'VALID'
