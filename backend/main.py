import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles

try:
    from .database import Base, engine
    from .routes.auth import router as auth_router
    from .routes.activities import router as activities_router
    from . import models
except ImportError:
    from database import Base, engine
    from routes.auth import router as auth_router
    from routes.activities import router as activities_router
    import models

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = "uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(activities_router, prefix="/activities", tags=["activities"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
