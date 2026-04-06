import imagehash
from PIL import Image

def get_hash(file_path: str) -> str:
    """
    Computes a perceptual hash (average hash) for an image.
    Returns: Hex string of the hash.
    """
    try:
        with Image.open(file_path) as img:
            h = imagehash.average_hash(img)
            return str(h)
    except Exception as e:
        raise ValueError(f"Failed to compute hash for {file_path}: {e}")

def is_duplicate(new_hash_str: str, existing_hashes: list[str]) -> bool:
    """
    Checks if a new hash is a perceptual duplicate of any existing hashes.
    A duplicate is defined as having a Hamming distance <= 10.
    """
    try:
        new_hash = imagehash.hex_to_hash(new_hash_str)
        for h_str in existing_hashes:
            existing_hash = imagehash.hex_to_hash(h_str)
            if (new_hash - existing_hash) <= 10:
                return True
        return False
    except Exception:
        return False
