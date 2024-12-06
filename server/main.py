from fastapi import FastAPI
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.endpoints import user

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Database events
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

# Include routers
app.include_router(user.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
