import piexif
from PIL import Image

def _convert_to_degrees(value):
    """Helper function to convert the GPS coordinates stored in the EXIF to float degrees."""
    d = float(value[0][0]) / float(value[0][1])
    m = float(value[1][0]) / float(value[1][1])
    s = float(value[2][0]) / float(value[2][1])
    return d + (m / 60.0) + (s / 3600.0)

def extract_gps(file_path: str) -> dict | None:
    """
    Extracts GPS coordinates (latitude and longitude) from a photo's EXIF data.
    Returns: {"latitude": float, "longitude": float} or None if not found.
    """
    try:
        exif_dict = piexif.load(file_path)
        gps_data = exif_dict.get("GPS")
        
        if not gps_data:
            return None
            
        lat_ref = gps_data.get(piexif.GPSIFD.GPSLatitudeRef)
        lat = gps_data.get(piexif.GPSIFD.GPSLatitude)
        lon_ref = gps_data.get(piexif.GPSIFD.GPSLongitudeRef)
        lon = gps_data.get(piexif.GPSIFD.GPSLongitude)
        
        if not (lat and lat_ref and lon and lon_ref):
            return None
            
        latitude = _convert_to_degrees(lat)
        if lat_ref.decode() != "N":
            latitude = -latitude
            
        longitude = _convert_to_degrees(lon)
        if lon_ref.decode() != "E":
            longitude = -longitude
            
        return {"latitude": round(latitude, 6), "longitude": round(longitude, 6)}
    except Exception:
        return None
