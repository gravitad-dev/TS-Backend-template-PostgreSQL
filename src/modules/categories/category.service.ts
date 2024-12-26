import {Category} from './category.model';

export const categoryService = {
  async createCategory(data: {
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return Category.create(data);
  },
  async getAllCategories() {
    return Category.findAll();
  },
  async getCategoryById(id: number) {
    return Category.findById(id);
  },
  async updateCategory(
    id: number,
    data: Partial<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>
  ) {
    return Category.update(id, data);
  },
  async deleteCategory(id: number) {
    return Category.delete(id);
  },
};
