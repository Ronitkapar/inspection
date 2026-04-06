from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    reputation_score = Column(Integer, nullable=False, default=50)
    credits_balance = Column(Float, nullable=False, default=0.0)

    activities = relationship("Activity", back_populates="user")
    credits = relationship("Credit", back_populates="user")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    species_or_wattage = Column(String, nullable=False)
    age_or_size = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    photo_path = Column(String, nullable=False)
    photo_hash = Column(String, nullable=False)
    ai_verdict = Column(String, default="pending")
    ai_explanation = Column(String, nullable=True)
    credits_earned = Column(Float, default=0.0)
    tx_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")
    credits = relationship("Credit", back_populates="activity")


class Credit(Base):
    __tablename__ = "credits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="available")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="credits")
    activity = relationship("Activity", back_populates="credits")
