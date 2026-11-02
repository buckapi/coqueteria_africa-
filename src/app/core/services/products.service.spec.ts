import { ProductRecord, ProductsService } from './products.service';

const product = (overrides: Partial<ProductRecord> = {}): ProductRecord =>
  ({
    id: 'product-1',
    collectionId: 'products',
    collectionName: 'products',
    name: 'Moño satinado rosa',
    description: 'Detalle hecho a mano',
    price: 12,
    category: 'Accesorios',
    categorySlug: 'accesorios',
    stock: 5,
    sku: 'MONO-1',
    featured: true,
    status: 'publicado',
    image: 'mono.jpg',
    gallery: [],
    ...overrides,
  }) as ProductRecord;

describe('ProductsService slugs', () => {
  it('normalizes accents and special characters in generated slugs', () => {
    const service = new ProductsService();

    expect(service.productSlug(product())).toBe('mono-satinado-rosa');
  });

  it('preserves an explicit slug when one exists', () => {
    const service = new ProductsService();

    expect(service.productSlug(product({ slug: 'coleccion-especial' }))).toBe('coleccion-especial');
    expect(service.productSlug(product({ name: 'Nombre nuevo', slug: 'coleccion-especial' }))).toBe(
      'coleccion-especial',
    );
  });
});
