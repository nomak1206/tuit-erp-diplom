import requests
import concurrent.futures
import time
import random
import string

BASE_URL = "http://localhost:8000"

def get_random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class StressTester:
    def __init__(self):
        self.session = requests.Session()
        self.cookies = None

    def login(self):
        resp = self.session.post(f"{BASE_URL}/api/auth/login", json={"username": "admin", "password": "admin123"})
        if resp.status_code == 200:
            self.cookies = resp.cookies
            return True
        return False

    def create_lead(self):
        data = {
            "title": f"Stress Lead {get_random_string(5)}",
            "contact_name": f"Stress Person {get_random_string(5)}",
            "phone": f"+99890{random.randint(1000000, 9999999)}",
            "source": "website", # Valid enum value
            "status": "new"      # Valid enum value
        }
        try:
            resp = self.session.post(f"{BASE_URL}/api/crm/leads/", json=data, cookies=self.cookies)
            return resp.status_code
        except Exception as e:
            return f"Error: {str(e)}"

    def get_hr_data(self):
        try:
            resp = self.session.get(f"{BASE_URL}/api/hr/employees/", cookies=self.cookies)
            return resp.status_code
        except Exception as e:
            return f"Error: {str(e)}"

    def check_warehouse(self):
        try:
            resp = self.session.get(f"{BASE_URL}/api/warehouse/products/", cookies=self.cookies)
            return resp.status_code
        except Exception as e:
            return f"Error: {str(e)}"

    def check_accounting(self):
        try:
            resp = self.session.get(f"{BASE_URL}/api/accounting/accounts/", cookies=self.cookies)
            return resp.status_code
        except Exception as e:
            return f"Error: {str(e)}"

def run_stress_test(num_requests=100):
    tester = StressTester()
    if not tester.login():
        print("[!] Login failed")
        return

    print(f"--- Starting Stress Test: {num_requests} concurrent operations ---")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        for _ in range(num_requests):
            choice = random.random()
            if choice < 0.25:
                futures.append(executor.submit(tester.create_lead))
            elif choice < 0.5:
                futures.append(executor.submit(tester.get_hr_data))
            elif choice < 0.75:
                futures.append(executor.submit(tester.check_warehouse))
            else:
                futures.append(executor.submit(tester.check_accounting))
        
        results = []
        for f in concurrent.futures.as_completed(futures):
            try:
                results.append(f.result())
            except Exception as e:
                results.append(f"Future Error: {str(e)}")
    
    success_count = results.count(200) + results.count(201)
    error_results = [r for r in results if not isinstance(r, int) or (r >= 400)]
    
    print(f"Finished: {success_count}/{num_requests} successful")
    if error_results:
        print(f"Errors encountered: {set(error_results)}")

if __name__ == "__main__":
    run_stress_test(100)
