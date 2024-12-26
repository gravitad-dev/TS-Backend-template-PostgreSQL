export function buildProductFilters(query: any): any {
  const {
    name,
    status,
    categoryId,
    minPrice,
    maxPrice,
    productType,
    minStock,
    maxStock,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    attributes,
  } = query;

  const filters: any = { AND: [] };

  if (name) {
    filters.AND.push({
      name: {
        contains: name as string,
        mode: 'insensitive',
      },
    });
  }

  if (status) {
    filters.AND.push({ status: status as string });
  }

  if (categoryId) {
    filters.AND.push({ categoryId: Number(categoryId) });
  }

  if (minPrice || maxPrice) {
    filters.AND.push({
      OR: [
        {
          offerPrice: {
            not: null,
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        },
        {
          AND: [
            { offerPrice: null },
            {
              regularPrice: {
                ...(minPrice ? { gte: Number(minPrice) } : {}),
                ...(maxPrice ? { lte: Number(maxPrice) } : {}),
              },
            },
          ],
        },
      ],
    });
  }

  if (productType) {
    filters.AND.push({ productType: productType as string });
  }

  addRangeFilter(filters, 'stock', minStock, maxStock);
  addDateRangeFilter(filters, 'createdAt', createdAfter, createdBefore);
  addDateRangeFilter(filters, 'updatedAt', updatedAfter, updatedBefore);

  if (attributes) {
    addDynamicAttributesFilter(filters, attributes);
  }

  return filters;
}

function addRangeFilter(filters: any, field: string, minValue?: any, maxValue?: any): void {
  const min = minValue ? Number(minValue) : null;
  const max = maxValue ? Number(maxValue) : null;

  if (min !== null || max !== null) {
    filters.AND.push({
      [field]: {
        ...(min !== null ? { gte: min } : {}),
        ...(max !== null ? { lte: max } : {}),
      },
    });
  }
}

function addDateRangeFilter(filters: any, field: string, after?: string, before?: string): void {
  if (after || before) {
    filters.AND.push({
      [field]: {
        ...(after ? { gte: new Date(after) } : {}),
        ...(before ? { lte: new Date(before) } : {}),
      },
    });
  }
}

function addDynamicAttributesFilter(filters: any, attributes: any): void {
  try {
    const parsedAttributes = JSON.parse(attributes);

    if (typeof parsedAttributes === 'object' && parsedAttributes !== null) {
      for (const [key, value] of Object.entries(parsedAttributes)) {
        filters.AND.push({
          attributes: {
            path: [key],
            equals: value,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error parsing attributes:', error);
  }
}
