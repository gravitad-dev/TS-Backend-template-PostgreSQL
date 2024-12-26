import { Prisma } from '@prisma/client';

export const articleSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
  summary: true,
  coverImage: true,
  status: true,
  url: true,
  scheduledAt: true,
  createdAt: true,
  content: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
});
