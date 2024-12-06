from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from ....core.database import get_database
from ....schemas.user import UserCreate, UserInDB, UserUpdate
from ....models.user import UserModel
from datetime import datetime
from bson import ObjectId

router = APIRouter()


@router.post("/", response_model=UserInDB)
async def create_user(
    user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if user exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_model = UserModel(
        email=user.email,
        username=user.username,
        hashed_password=user.password,  # In production, hash the password
        full_name=user.full_name,
    )

    result = await db.users.insert_one(user_model.to_dict())

    created_user = await db.users.find_one({"_id": result.inserted_id})
    return created_user


@router.get("/{user_id}", response_model=UserInDB)
async def get_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
