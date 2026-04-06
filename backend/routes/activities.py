import os
import secrets
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from typing import List

try:
    from ..database import get_db
    from ..models import Activity, Credit, User
    from ..schemas import ActivityResponse
    from ..services.ai_service import calculate_credits, verify_photo
    from ..services.exif_service import extract_gps
    from ..services.hash_service import get_hash, is_duplicate
    from .auth import get_current_user
except ImportError:
    from database import get_db
    from models import Activity, Credit, User
    from schemas import ActivityResponse
    from routes.auth import get_current_user
    from services.ai_service import calculate_credits, verify_photo
    from services.exif_service import extract_gps
    from services.hash_service import get_hash, is_duplicate

# Must match uploads_dir from main.py
UPLOADS_DIR = "uploads"
router = APIRouter()

@router.get("/my", response_model=List[ActivityResponse])
async def get_my_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve activity history for the current user.
    """
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .all()
    )
    
    # Map ai_verdict to status
    return [
        ActivityResponse(
            id=a.id,
            activity_type=a.activity_type,
            quantity=a.quantity,
            credits_earned=a.credits_earned,
            status=a.ai_verdict,
            ai_explanation=a.ai_explanation,
            tx_hash=a.tx_hash,
            created_at=a.created_at.isoformat()
        )
        for a in activities
    ]

@router.post("/submit")
async def submit_activity(
    activity_type: str = Form(...),
    quantity: float = Form(...),
    species_or_wattage: str = Form(...),
    age_or_size: str = Form(...),
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure uploads directory exists
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    # Save the uploaded file
    file_extension = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Write file to disk
    with open(file_path, "wb") as buffer:
        content = await photo.read()
        buffer.write(content)

    # 1. extract_gps
    gps_data = extract_gps(file_path)
    latitude = gps_data["latitude"] if gps_data else None
    longitude = gps_data["longitude"] if gps_data else None

    # 2. get_hash and check for duplicates
    try:
        photo_hash = get_hash(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file or failed to compute hash.")

    existing_activities = db.query(Activity.photo_hash).all()
    existing_hashes = [a.photo_hash for a in existing_activities if a.photo_hash]
    
    if is_duplicate(photo_hash, existing_hashes):
        raise HTTPException(status_code=400, detail="Duplicate photo detected")

    # 3. verify_photo
    verification_result = verify_photo(file_path, activity_type, quantity, species_or_wattage)
    if verification_result.get("verdict") == "rejected":
        raise HTTPException(
            status_code=400, 
            detail=verification_result.get("explanation", "Photo verification rejected")
        )

    # 4. calculate_credits
    credits_result = calculate_credits(
        activity_type, 
        quantity, 
        species_or_wattage, 
        age_or_size, 
        latitude or 0.0, 
        longitude or 0.0
    )
    credits_earned = credits_result.get("credits", 0.0)

    # 5. generate tx_hash
    tx_hash = "0x" + secrets.token_hex(32)

    # 6. Save Activity to DB
    new_activity = Activity(
        user_id=current_user.id,
        activity_type=activity_type,
        quantity=quantity,
        species_or_wattage=species_or_wattage,
        age_or_size=age_or_size,
        latitude=latitude,
        longitude=longitude,
        photo_path=file_path,
        photo_hash=photo_hash,
        ai_verdict="approved",
        ai_explanation=verification_result.get("explanation"),
        credits_earned=credits_earned,
        tx_hash=tx_hash
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    # 7. Save Credit record
    new_credit = Credit(
        user_id=current_user.id,
        activity_id=new_activity.id,
        amount=credits_earned,
        status="available"
    )
    db.add(new_credit)

    # 8. Update user credits balance
    current_user.credits_balance += credits_earned
    
    db.commit()

    return {
        "tx_hash": tx_hash,
        "credits_earned": credits_earned
    }
