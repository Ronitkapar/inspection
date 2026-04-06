import os
import json
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load .env using absolute resolution as requested
# Path(__file__) is /home/ronit/coading/inception/backend/services/ai_service.py
# .parents[2] is /home/ronit/coading/inception/
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)

# Initialize the Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

def verify_photo(photo_path: str, activity_type: str, quantity: float, species_or_wattage: str) -> dict:
    """Verifies if a photo is consistent with the claimed environmental activity using the Google GenAI SDK."""
    try:
        if not client:
            raise ValueError("Gemini Client not initialized - check GEMINI_API_KEY")

        if not os.path.exists(photo_path):
            raise FileNotFoundError(f"Photo not found at {photo_path}")

        with open(photo_path, "rb") as f:
            image_data = f.read()

        mime_type = "image/jpeg"
        if photo_path.lower().endswith(".png"):
            mime_type = "image/png"
        elif photo_path.lower().endswith(".webp"):
            mime_type = "image/webp"

        prompt = f"""Does this photo look consistent with the claimed activity?
Activity: {activity_type}, Quantity: {quantity}, Species/Wattage: {species_or_wattage}.
Reply ONLY with JSON: {{"verdict": "approved"/"rejected", "confidence": 0-100, "explanation": "string"}}"""

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[
                prompt,
                types.Part.from_bytes(data=image_data, mime_type=mime_type)
            ]
        )

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[text.find("{"):text.rfind("}")+1]
        elif "{" in text and "}" in text:
            text = text[text.find("{"):text.rfind("}")+1]

        return json.loads(text)

    except Exception as e:
        # Fallback consistent with requirements
        return {
            "verdict": "approved",
            "confidence": 50,
            "explanation": "Verification unavailable"
        }

def calculate_credits(activity_type: str, quantity: float, species_or_wattage: str, 
                      age_or_size: str, latitude: float, longitude: float) -> dict:
    """Calculates carbon credits with AI-driven context-aware adjustments using the Google GenAI SDK."""
    try:
        if not client:
            raise ValueError("Gemini Client not initialized - check GEMINI_API_KEY")

        # Base calculation logic
        coeffs = {"tree": 21.0, "solar": 300.0, "compost": 0.5}
        base_coeff = coeffs.get(activity_type.lower(), 0.0)
        base_credits = (quantity * base_coeff) / 1000.0

        prompt = f"""As an AI environmental expert, calculate the carbon credits for the following activity:
Activity: {activity_type}
Quantity: {quantity}
Species/Wattage: {species_or_wattage}
Age/Size: {age_or_size}
Location: Latitude {latitude}, Longitude {longitude}

Base coefficients:
- tree: 21 kg CO2/year
- solar: 300 kg CO2/year
- compost: 0.5 kg CO2/kg

Formula: credits = (quantity * coefficient) / 1000

Current base credits calculation: {base_credits} (using coefficient {base_coeff})

Please adjust this base calculation based on the specific species, solar panel wattage, plant age, and geographic location provided.
Show the math in the breakdown.
Return ONLY a JSON object:
{{
  "credits": float,
  "explanation": "string explaining the adjustments",
  "breakdown": "detailed mathematical breakdown"
}}"""

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[text.find("{"):text.rfind("}")+1]
        elif "{" in text and "}" in text:
            text = text[text.find("{"):text.rfind("}")+1]

        result = json.loads(text)
        return result

    except Exception as e:
        # Fallback calculation consistent with requirements
        coeffs = {"tree": 21.0, "solar": 300.0, "compost": 0.5}
        base_coeff = coeffs.get(activity_type.lower(), 0.0)
        credits = (quantity * base_coeff) / 1000.0
        return {
            "credits": float(credits),
            "explanation": "API adjustment unavailable, using base calculation",
            "breakdown": f"({quantity} * {base_coeff}) / 1000 = {credits}"
        }
