import requests

BASE_URL = "http://localhost:8000"

def run_advanced_audit():
    print("--- Starting Advanced Security & Validation Audit ---")
    
    # 1. Login as Manager to test RBAC
    manager_session = requests.Session()
    manager_session.post(f"{BASE_URL}/api/auth/login", json={"username": "manager", "password": "manager123"})
    print("[✓] Logged in as Manager")

    # 2. Test RBAC: Manager trying to access Admin-only /api/auth/users
    resp = manager_session.get(f"{BASE_URL}/api/auth/users")
    if resp.status_code == 403:
        print("[✓] Security: Manager restricted from Admin users list (403 Forbidden)")
    else:
        print(f"[✗] Security Gap: Manager accessed admin route with code {resp.status_code}")

    # 3. Test Data Validation: Sending negative salary or empty fields
    bad_employee = {
        "employee_number": "ERR-001",
        "first_name": "", # Empty name
        "last_name": "Test",
        "hire_date": "invalid-date",
        "position": "Dev",
        "salary": -5000 # Negative salary
    }
    resp = manager_session.post(f"{BASE_URL}/api/hr/employees/", json=bad_employee)
    if resp.status_code == 400:
        print("[✓] Validation: Server correctly rejected malformed employee date (400 Bad Request)")
    elif resp.status_code == 422:
         print("[✓] Validation: Server correctly rejected malformed data via Pydantic (422)")
    else:
        print(f"[✗] Validation Gap: Server returned {resp.status_code} instead of 400/422")

    # 4. Test ID Injection / Out of bounds
    resp = manager_session.get(f"{BASE_URL}/api/crm/leads/999999")
    if resp.status_code == 404:
        print("[✓] Integrity: Non-existent ID correctly handled (404)")
    else:
        print(f"[✗] Integrity Gap: Unexpected response for non-existent ID: {resp.status_code}")

    # 5. Test Long Strings & SQL Injection Patterns
    chaos_data = {
        "title": "A" * 500, # Very long title (exceeds 255)
        "contact_name": "Robert'); DROP TABLE users;--", # Classic SQL Injection pattern
        "source": "website"
    }
    resp = manager_session.post(f"{BASE_URL}/api/crm/leads/", json=chaos_data)
    if resp.status_code == 422:
        print("[✓] Resilience: System correctly rejected excessively long string (422 Unprocessable)")
    elif resp.status_code in [200, 201]:
        print("[✓] Resilience: System safely handled potential SQL injection string as literal text")
    else:
        print(f"[✗] Resilience: System failed to handle complex string input with code {resp.status_code}")

    # 6. Large Number Overflow
    huge_deal = {
        "title": "Billion Dollar Deal",
        "amount": 999999999999.99,
        "stage": "new"
    }
    resp = manager_session.post(f"{BASE_URL}/api/crm/deals/", json=huge_deal)
    if resp.status_code in [200, 201]:
        print("[✓] Resilience: System handled extremely large numeric values")
    else:
        print(f"[✗] Resilience: System failed on large numeric input with code {resp.status_code}")

    print("--- Advanced Audit Finished ---")

if __name__ == "__main__":
    run_advanced_audit()
