import requests

BASE_URL = "http://localhost:8000"

def test_api():
    print("--- Starting API Sanity Check ---")
    
    # 1. Login
    login_data = {"username": "admin", "password": "admin123"}
    resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if resp.status_code == 200:
        print("[✓] Login successful")
        cookies = resp.cookies
    else:
        print(f"[✗] Login failed: {resp.status_code} - {resp.text}")
        return

    # 2. CRM Check
    resp = requests.get(f"{BASE_URL}/api/crm/leads/", cookies=cookies)
    if resp.status_code == 200:
        print(f"[✓] CRM Leads accessible (Count: {len(resp.json())})")
    else:
        print(f"[✗] CRM Leads failed: {resp.status_code}")

    # 3. HR Check
    resp = requests.get(f"{BASE_URL}/api/hr/employees/", cookies=cookies)
    if resp.status_code == 200:
        print(f"[✓] HR Employees accessible (Count: {len(resp.json())})")
    else:
        print(f"[✗] HR Employees failed: {resp.status_code}")

    # 4. Warehouse Check
    resp = requests.get(f"{BASE_URL}/api/warehouse/products/", cookies=cookies)
    if resp.status_code == 200:
        print(f"[✓] Warehouse Products accessible")
    else:
        print(f"[✗] Warehouse failed: {resp.status_code}")

    print("--- Sanity Check Finished ---")

if __name__ == "__main__":
    test_api()
