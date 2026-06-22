/**
 * Resolves standard backend uploads image URLs robustly.
 * Handles full URLs, relative paths, old uploads prefixes, and raw filenames.
 */
export const getImageUrl = (imageVal) => {
  if (!imageVal) return null;

  // If it's a full URL, return it directly
  if (imageVal.startsWith('http://') || imageVal.startsWith('https://')) {
    if (imageVal.includes('/static/uploads/')) {
      return imageVal;
    }
    // If it contains /uploads/, map to /static/uploads/
    if (imageVal.includes('/uploads/')) {
      return imageVal.replace('/uploads/', '/static/uploads/');
    }
    return imageVal;
  }

  // If it's a relative path starting with / or static
  if (imageVal.startsWith('/static/uploads/')) {
    return `http://localhost:5000${imageVal}`;
  }
  if (imageVal.startsWith('static/uploads/')) {
    return `http://localhost:5000/${imageVal}`;
  }
  if (imageVal.startsWith('/uploads/')) {
    return `http://localhost:5000${imageVal.replace('/uploads/', '/static/uploads/')}`;
  }
  if (imageVal.startsWith('uploads/')) {
    return `http://localhost:5000/${imageVal.replace('uploads/', 'static/uploads/')}`;
  }

  // Otherwise assume it's just the raw filename
  return `http://localhost:5000/static/uploads/${imageVal}`;
};
