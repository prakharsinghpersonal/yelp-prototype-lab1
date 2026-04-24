import bcrypt
try:
    print("Hashing...")
    hashed = bcrypt.hashpw(b"Password123!", bcrypt.gensalt())
    print("Hash successful:", hashed)
    print("Verifying...")
    print("Verify successful:", bcrypt.checkpw(b"Password123!", hashed))
except Exception as e:
    print("Error:", e)
