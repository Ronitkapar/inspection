from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

try:
    from ..database import get_db
    from ..models import User
    from ..schemas import UserResponse
    from .auth import get_current_user
except ImportError:
    from database import get_db
    from models import User
    from schemas import UserResponse
    from routes.auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve current user details.
    """
    return current_user
