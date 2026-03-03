import requests

BASE_URL = "http://localhost:8000"

def verify_cascading():
    print("--- Starting Database Integrity Audit ---")
    session = requests.Session()
    session.post(f"{BASE_URL}/api/auth/login", json={"username": "admin", "password": "admin123"})
    
    # 1. Create Lead
    lead_data = {"title": "Integrity Test Lead", "contact_name": "Integrity User", "source": "website"}
    lead_resp = session.post(f"{BASE_URL}/api/crm/leads/", json=lead_data)
    lead_id = lead_resp.json()["id"]
    print(f"[✓] Created Lead ID: {lead_id}")

    # 2. Add Activity to Lead
    activity_data = {"type": "note", "title": "Check cascading", "lead_id": lead_id}
    act_resp = session.post(f"{BASE_URL}/api/crm/activities/", json=activity_data)
    activity_id = act_resp.json()["id"]
    print(f"[✓] Created Activity ID: {activity_id} for Lead")

    # 3. Delete Lead
    del_resp = session.delete(f"{BASE_URL}/api/crm/leads/{lead_id}")
    if del_resp.status_code in [200, 204]:
        print(f"[✓] Deleted Lead ID: {lead_id}")
    else:
        print(f"[✗] Failed to delete Lead: {del_resp.status_code}")

    # 4. Check if Activity is gone (Cascade) or orphaned
    check_resp = session.get(f"{BASE_URL}/api/crm/activities/")
    all_acts = check_resp.json()
    found = any(a["id"] == activity_id for a in all_acts)
    
    if not found:
        print("[✓] Success: Activity was cascaded (deleted) with Lead")
    else:
        # Check if it was nulled out (SET NULL)
        target_act = next(a for a in all_acts if a["id"] == activity_id)
        if target_act.get("lead_id") is None:
            print("[✓] Success: Activity was orphaned but lead_id nulled (SET NULL policy)")
        else:
            print(f"[✗] Failure: Activity {activity_id} still points to deleted Lead {lead_id}!")

    print("--- Database Integrity Audit Finished ---")

if __name__ == "__main__":
    verify_cascading()
