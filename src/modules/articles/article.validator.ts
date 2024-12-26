import prisma from '../../config/database';

const Status_Article = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
} as const;

type Status_Article = (typeof Status_Article)[keyof typeof Status_Article];

export const validateCreateArticle = async (data: any) => {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string') {
    errors.push('The title field is required and must be a string.');
  }

  if (data.summary && typeof data.summary !== 'string') {
    errors.push('The summary field must be a string if provided.');
  }

  if (data.coverImage && typeof data.coverImage !== 'string') {
    errors.push('The coverImage field must be a string if provided.');
  }

  if (!data.status || typeof data.status !== 'string') {
    errors.push('The status field is required and must be a string.');
  } else if (!Object.values(Status_Article).includes(data.status)) {
    errors.push(
      `The status field must be one of: ${Object.values(Status_Article).join(
        ', '
      )}.`
    );
  }

  if (!data.url || typeof data.url !== 'string') {
    errors.push('The "url" field is required and must be a string.');
  } else {
    const existedURL = await prisma.article.findUnique({
      where: { url: data.url },
    });

    if (existedURL) {
      errors.push('An article with this URL already exists.');
    }
  }

  if (data.categoryId && typeof data.categoryId !== 'number') {
    errors.push('The categoryId field must be a number if provided.');
  }

  if (data.scheduledAt && isNaN(Date.parse(data.scheduledAt))) {
    errors.push('The scheduledAt field must be a valid date if provided.');
  }

  if (!data.content || typeof data.content !== 'string') {
    errors.push('The content field must be required as a string, if provided.');
  }

  return errors.length > 0 ? { error: errors } : { error: null };
};

export const validateUpdateArticle = (data: any) => {
  const errors: string[] = [];

  if (data.title && typeof data.title !== 'string') {
    errors.push('The title field must be a string if provided.');
  }

  if (data.summary && typeof data.summary !== 'string') {
    errors.push('The summary field must be a string if provided.');
  }

  if (data.coverImage && typeof data.coverImage !== 'string') {
    errors.push('The coverImage field must be a string if provided.');
  }

  if (data.status && !Object.values(Status_Article).includes(data.status)) {
    errors.push(
      `The status field must be one of: ${Object.values(Status_Article).join(
        ', '
      )} if provided.`
    );
  }

  if (data.url && typeof data.url !== 'string') {
    errors.push('The url field must be a string if provided.');
  }

  if (data.authorId && typeof data.authorId !== 'number') {
    errors.push('The authorId field must be a number if provided.');
  }

  if (data.categoryId && typeof data.categoryId !== 'number') {
    errors.push('The categoryId field must be a number if provided.');
  }

  if (data.scheduledAt && isNaN(Date.parse(data.scheduledAt))) {
    errors.push('The scheduledAt field must be a valid date if provided.');
  }

  if (data.content && typeof data.content !== 'string') {
    errors.push('The content field must be required as a string, if provided.');
  }

  return errors.length > 0 ? { error: errors } : { error: null };
};
