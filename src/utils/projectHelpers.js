/**
 * Pure utility functions for project management.
 * No React dependencies — safe to use anywhere.
 */

/**
 * Validate a URL string.
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Normalize a Firestore timestamp / Date / string / number into an ISO string.
 * Returns a fallback when the value is missing or unparseable.
 */
export const normalizeFirestoreTimestamp = (value, fallback = new Date().toISOString()) => {
  if (!value) return fallback;

  // Firebase Timestamp object
  if (typeof value === 'object' && value?.toDate && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
  }
  // Unknown object type
  return fallback;
};

/**
 * Map a Firestore document snapshot into a plain project object with normalised dates.
 */
export const mapDocToProject = (docSnap) => {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: normalizeFirestoreTimestamp(data.createdAt),
    updatedAt: normalizeFirestoreTimestamp(data.updatedAt),
  };
};

/**
 * Format a date value for display (Indonesian locale by default).
 */
export const formatDate = (dateValue, locale = 'id-ID') => {
  try {
    if (!dateValue) return 'N/A';

    let date;

    if (typeof dateValue === 'object') {
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return 'Invalid date format';
      }
    } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return 'Invalid date type';
    }

    if (isNaN(date.getTime())) return 'Invalid date';

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
};

/**
 * Compress an image file client-side.
 * Returns a Blob (JPEG) if the file exceeds a size threshold.
 */
export const compressImage = (file, { maxWidth = 1200, quality = 0.7 } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Failed to compress image'))),
          'image/jpeg',
          quality,
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Process an image file (compress if > 2 MB) and return the file/blob + object URL.
 */
export const processImageFile = async (file, { maxSizeBytes = 2 * 1024 * 1024 } = {}) => {
  let imageToUse = file;

  if (file.size > maxSizeBytes) {
    try {
      imageToUse = await compressImage(file);
    } catch {
      // fallback to original
    }
  }

  const objectUrl = URL.createObjectURL(imageToUse);
  return { imageToUse, objectUrl };
};

/**
 * Validate and format a project object before writing to Firestore.
 */
export const validateProject = (project, { isUpdate = false } = {}) => {
  const errors = [];

  if (!project.title?.trim()) errors.push('Title is required');
  if (!project.desc?.trim()) errors.push('Description is required');
  if (!isUpdate && !project.img) errors.push('Project image is required');
  if (project.github && !isValidUrl(project.github)) errors.push('GitHub URL is invalid');
  if (project.demo && !isValidUrl(project.demo)) errors.push('Demo URL is invalid');
  if (project.tags && !Array.isArray(project.tags)) errors.push('Tags must be an array');

  const finalImg = project.img || (isUpdate ? 'https://source.unsplash.com/random/400x300?tech' : project.img);

  const formattedProject = errors.length === 0
    ? {
        title: project.title.trim(),
        desc: project.desc.trim(),
        img: finalImg,
        github: project.github?.trim() || '',
        demo: project.demo?.trim() || '',
        tags: Array.isArray(project.tags) ? project.tags : [],
        featured: Boolean(project.featured),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        id: project.id || null,
      }
    : null;

  return { isValid: errors.length === 0, errors, formattedProject };
};

/**
 * Validate and repair projects that have invalid date fields.
 */
export const validateProjectDates = (projects) => {
  if (!Array.isArray(projects)) return [];

  return projects
    .map((project) => {
      if (!project) return null;

      return {
        ...project,
        createdAt: normalizeFirestoreTimestamp(project.createdAt),
        updatedAt: normalizeFirestoreTimestamp(project.updatedAt),
      };
    })
    .filter(Boolean);
};

/**
 * Collect all unique tags from an array of projects, sorted alphabetically.
 */
export const getAllTags = (projects) => {
  const tagSet = new Set();
  projects.forEach((project) => {
    if (project?.tags && Array.isArray(project.tags)) {
      project.tags.forEach((tag) => {
        if (tag) tagSet.add(tag);
      });
    }
  });
  return Array.from(tagSet).sort();
};

/**
 * Parse a comma-separated tags string into an array.
 */
export const parseTagsString = (tagsString) => {
  return tagsString
    ? tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
};
