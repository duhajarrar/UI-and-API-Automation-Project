import requests
TIMEOUT = 30


class TraccarApi:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()

    def login(self, email, password):
        return self.session.post(
            f"{self.base_url}/api/session",
            data={"email": email, "password": password},
            timeout=TIMEOUT,
        )

    def create_geofence(self, geofence):
        return self.session.post(f"{self.base_url}/api/geofences", json=geofence, timeout=TIMEOUT)
 
    def get_geofences(self):
        return self.session.get(f"{self.base_url}/api/geofences", timeout=TIMEOUT)
 
    def get_geofence(self, geofence_id):
        return self.session.get(f"{self.base_url}/api/geofences/{geofence_id}", timeout=TIMEOUT)
 
    def update_geofence(self, geofence_id, geofence):
        return self.session.put(f"{self.base_url}/api/geofences/{geofence_id}", json=geofence, timeout=TIMEOUT)
 
    def delete_geofence(self, geofence_id):
        return self.session.delete(f"{self.base_url}/api/geofences/{geofence_id}", timeout=TIMEOUT)