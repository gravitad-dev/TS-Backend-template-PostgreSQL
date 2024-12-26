import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

export const sanitizeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && req.body.content) {
    // Sanitize the HTML content
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'h1',
        'h2',
        'h3',
        'strong',
        'em',
        'p',
        'ul',
        'li',
        'a',
        'img',
        'br',
        'hr',
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'title'], 
      },
      disallowedTagsMode: 'discard', 
    });
  }
  next();
};
