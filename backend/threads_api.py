"""
Threads API Client
"""
import os
import time
import json
from typing import Optional, Dict, Any

import requests


class ThreadsAPI:
    BASE_URL = "https://graph.threads.net/v1.0"
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("LONG_LIVED_ACCESS_TOKEN")
        if not self.token:
            raise ValueError("Threads access token not provided")
        self.user_id = None
    
    def me(self) -> Dict[str, Any]:
        """Get current user info"""
        response = requests.get(
            f"{self.BASE_URL}/me",
            params={"fields": "id,username", "access_token": self.token},
            timeout=20
        )
        response.raise_for_status()
        data = response.json()
        self.user_id = data["id"]
        return data
    
    def post_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Post text to Threads"""
        if not self.user_id:
            self.me()
        
        try:
            # 1. Create container
            container_id = self._create_container(text)
            
            # 2. Wait for processing
            if not self._wait_for_container(container_id):
                return None
            
            # 3. Publish
            media_id = self._publish_container(container_id)
            
            # 4. Get permalink
            permalink = self._get_permalink(media_id)
            
            return {
                "media_id": media_id,
                "container_id": container_id,
                "permalink": permalink,
                "text": text
            }
        except Exception as e:
            print(f"Error posting to Threads: {e}")
            return None
    
    def _create_container(self, text: str) -> str:
        """Create a media container"""
        response = requests.post(
            f"{self.BASE_URL}/{self.user_id}/threads",
            data=json.dumps({
                "media_type": "TEXT",
                "text": text,
                "access_token": self.token
            }),
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()["id"]
    
    def _wait_for_container(self, container_id: str, max_attempts: int = 5) -> bool:
        """Wait for container to be ready"""
        for _ in range(max_attempts):
            response = requests.get(
                f"{self.BASE_URL}/{container_id}",
                params={
                    "fields": "status,error_message",
                    "access_token": self.token
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            status = data.get("status")
            if status == "FINISHED":
                return True
            elif status == "ERROR":
                print(f"Container error: {data.get('error_message')}")
                return False
            
            time.sleep(1)
        
        return False
    
    def _publish_container(self, container_id: str) -> str:
        """Publish the container"""
        response = requests.post(
            f"{self.BASE_URL}/{self.user_id}/threads_publish",
            data={
                "creation_id": container_id,
                "access_token": self.token
            },
            timeout=20
        )
        response.raise_for_status()
        return response.json()["id"]
    
    def _get_permalink(self, media_id: str) -> str:
        """Get permalink for published post"""
        response = requests.get(
            f"{self.BASE_URL}/{media_id}",
            params={"fields": "permalink", "access_token": self.token},
            timeout=20
        )
        response.raise_for_status()
        return response.json()["permalink"]
