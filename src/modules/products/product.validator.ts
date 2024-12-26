function parseImageGallery(imageGallery: string) {
  try {
    const parsed = JSON.parse(imageGallery);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error('Invalid format for imageGallery; it must be a JSON array of strings.');
  }
}

function parseAttributes(attributes: string) {
  try {
    const parsed = JSON.parse(attributes);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error('Invalid format for attributes; it must be a JSON object.');
  }
}

function validateScheduledAt(dateString: string) {
  const isoFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return isoFormatRegex.test(dateString) && !isNaN(new Date(dateString).getTime());
}

export function validateCreateProduct(body: any) {
  const errors = [];

  // Required fields validation
  if (!body.name || typeof body.name !== 'string') {
    errors.push('Product name is required and must be a string.');
  }
  if (!body.regularPrice || isNaN(parseFloat(body.regularPrice))) {
    errors.push('Regular price is required and must be a number.');
  }
  if (body.offerPrice && isNaN(parseFloat(body.offerPrice))) {
    errors.push('Offer price must be a number.');
  }
  if (!body.stock || isNaN(parseInt(body.stock, 10))) {
    errors.push('Stock is required and must be an integer.');
  }
  if (body.status && !['ACTIVE', 'DISABLED'].includes(body.status.toUpperCase())) {
    errors.push('Invalid status. Allowed values are ACTIVE or DISABLED.');
  }
  if (body.description && typeof body.description !== 'string') {
    errors.push('Description is required and must be a string.');
  }
  if (!body.productType || !['PHYSICAL', 'NONPHYSICAL'].includes(body.productType.toUpperCase())) {
    errors.push('Invalid product type. Allowed values are PHYSICAL or NONPHYSICAL.');
  }
  if (!body.categoryId || isNaN(parseInt(body.categoryId, 10))) {
    errors.push('Category ID is required and must be an integer.');
  }

  // Optional fields with custom parsing
  try {
    if (body.imageGallery) body.imageGallery = parseImageGallery(body.imageGallery);
  } catch (e: any) {
    errors.push(e.message);
  }

  try {
    if (body.attributes) body.attributes = parseAttributes(body.attributes);
  } catch (e: any) {
    errors.push(e.message);
  }

  // Validate scheduledAt if provided
  if (body.scheduledAt && !validateScheduledAt(body.scheduledAt)) {
    errors.push('Invalid scheduledAt date format. Must be a valid date string.');
  }

  return errors;
}

export function validateUpdateProduct(body: any) {
  const errors = [];

  // Optional fields validation
  if (body.name && typeof body.name !== 'string') {
    errors.push('Product name must be a string.');
  }
  if (body.regularPrice && isNaN(parseFloat(body.regularPrice))) {
    errors.push('Regular price must be a number.');
  }
  if (body.offerPrice && isNaN(parseFloat(body.offerPrice))) {
    errors.push('Offer price must be a number.');
  }
  if (body.stock && isNaN(parseInt(body.stock, 10))) {
    errors.push('Stock must be an integer.');
  }
  if (body.description && typeof body.description !== 'string') {
    errors.push('Description is required and must be a string.');
  }
  if (body.status && !['ACTIVE', 'DISABLED'].includes(body.status.toUpperCase())) {
    errors.push('Invalid status. Allowed values are ACTIVE or DISABLED.');
  }
  if (body.productType && !['PHYSICAL', 'NONPHYSICAL'].includes(body.productType.toUpperCase())) {
    errors.push('Invalid product type. Allowed values are PHYSICAL or NONPHYSICAL.');
  }
  if (body.categoryId && isNaN(parseInt(body.categoryId, 10))) {
    errors.push('Category ID must be an integer.');
  }

  // Optional fields with custom parsing
  try {
    if (body.imageGallery) body.imageGallery = parseImageGallery(body.imageGallery);
  } catch (e: any) {
    errors.push(e.message);
  }

  try {
    if (body.attributes) body.attributes = parseAttributes(body.attributes);
  } catch (e: any) {
    errors.push(e.message);
  }

  // Validate scheduledAt if provided
  if (body.scheduledAt && !validateScheduledAt(body.scheduledAt)) {
    errors.push('Invalid scheduledAt date format. Must be a valid date string.');
  }

  return errors;
}
