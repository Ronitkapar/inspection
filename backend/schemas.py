from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    reputation_score: int
    credits_balance: float


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activity_type: str
    quantity: float
    credits_earned: float
    status: str
    ai_explanation: str | None = None
    tx_hash: str | None = None
    created_at: str  # We'll format this as a string in the response

    @classmethod
    def from_orm(cls, obj):
        # Custom mapping for status (ai_verdict) and created_at
        return cls(
            id=obj.id,
            activity_type=obj.activity_type,
            quantity=obj.quantity,
            credits_earned=obj.credits_earned,
            status=obj.ai_verdict,
            ai_explanation=obj.ai_explanation,
            tx_hash=obj.tx_hash,
            created_at=obj.created_at.isoformat()
        )
