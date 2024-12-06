from datetime import datetime
from typing import Optional
from bson import ObjectId


class UserModel:
    def __init__(
        self,
        email: str,
        username: str,
        hashed_password: str,
        full_name: Optional[str] = None,
    ):
        self.email = email
        self.username = username
        self.hashed_password = hashed_password
        self.full_name = full_name
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True

    def to_dict(self):
        return {
            "email": self.email,
            "username": self.username,
            "hashed_password": self.hashed_password,
            "full_name": self.full_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_active": self.is_active,
        }
