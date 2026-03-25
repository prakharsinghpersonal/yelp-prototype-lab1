import traceback
from services.auth import hash_password, verify_password

def test_auth():
    print("Testing hash...")
    try:
        hashed = hash_password("Password123!")
        print("Hash successful:", hashed)
        
        print("Testing verify...")
        is_valid = verify_password("Password123!", hashed)
        print("Verify successful:", is_valid)
    except Exception as e:
        print("Exception caught:")
        traceback.print_exc()

if __name__ == "__main__":
    test_auth()
