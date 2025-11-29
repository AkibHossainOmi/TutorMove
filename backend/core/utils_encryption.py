from cryptography.fernet import Fernet
import base64
from django.conf import settings

# In a real scenario, use settings.SECRET_KEY.
# For simplicity and reproducibility, we derive a key or use a fixed one if SECRET_KEY is not suitable directly (Fernet requires 32 url-safe base64 bytes).
# Let's derive a key from SECRET_KEY.

def get_cipher_suite():
    key = settings.SECRET_KEY
    # Pad or truncate to 32 bytes
    if len(key) < 32:
        key = key.ljust(32, '0')
    else:
        key = key[:32]

    # Fernet requires a url-safe base64-encoded 32-byte key.
    # We can just base64 encode the 32-byte string.
    encoded_key = base64.urlsafe_b64encode(key.encode('utf-8'))
    return Fernet(encoded_key)

def encrypt_text(text):
    if not text:
        return text
    try:
        cipher_suite = get_cipher_suite()
        encrypted_text = cipher_suite.encrypt(text.encode('utf-8'))
        return encrypted_text.decode('utf-8')
    except Exception as e:
        print(f"Encryption error: {e}")
        return text # Fallback or raise

def decrypt_text(text):
    if not text:
        return text
    try:
        # Check if it looks like Fernet token (optional, but safe)
        # Fernet tokens start with gAAAA... usually, but let's just try to decrypt
        cipher_suite = get_cipher_suite()
        decrypted_text = cipher_suite.decrypt(text.encode('utf-8'))
        return decrypted_text.decode('utf-8')
    except Exception as e:
        # If decryption fails (e.g. not encrypted), return original text
        # This handles legacy plain text messages
        return text
