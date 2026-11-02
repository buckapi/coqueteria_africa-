import { CartService } from './cart.service';
import { ProductRecord } from './products.service';

const product = (overrides: Partial<ProductRecord> = {}): ProductRecord => ({
  id: 'product-1',
  collectionId: 'products',
  collectionName: 'products',
  name: 'Lazo lavanda',
  description: 'Detalle hecho a mano',
  price: 12,
  category: 'Accesorios',
  categorySlug: 'accesorios',
  stock: 5,
  sku: 'LAZO-1',
  featured: true,
  status: 'publicado',
  image: 'lazo.jpg',
  gallery: [],
  ...overrides,
});

describe('CartService', () => {
  beforeEach(() => localStorage.clear());

  it('combines duplicate products and calculates the subtotal', () => {
    const cart = new CartService();
    cart.add(product());
    cart.add(product(), 2);

    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBe(36);
    expect(cart.lines()).toHaveLength(1);
  });

  it('counts total units across different products', () => {
    const cart = new CartService();
    cart.add(product({ id: 'product-a' }), 3);
    cart.add(product({ id: 'product-b', name: 'Moño rosa', price: 10 }), 2);

    expect(cart.count()).toBe(5);
    expect(cart.subtotal()).toBe(56);
  });

  it('keeps one item when decreasing below one and persists removal', () => {
    const cart = new CartService();
    cart.add(product());
    cart.update('product-1', 0);

    expect(cart.lines()[0].quantity).toBe(1);
    cart.remove('product-1');
    const restored = new CartService();
    expect(restored.lines()).toEqual([]);
  });

  it('clamps added quantities to the available stock', () => {
    const cart = new CartService();
    cart.add(product(), 20);
    cart.update('product-1', 20, 5);

    expect(cart.count()).toBe(5);
  });

  it('increments and decrements through the public quantity actions', () => {
    const cart = new CartService();
    cart.add(product(), 2);

    cart.increase('product-1', 3);
    expect(cart.count()).toBe(3);

    cart.increase('product-1', 3);
    expect(cart.count()).toBe(3);

    cart.decrease('product-1');
    expect(cart.count()).toBe(2);
    expect(JSON.parse(localStorage.getItem('coqueteria-cart') ?? '[]')[0].quantity).toBe(2);
  });

  it('marks unpublished or unavailable products during synchronization', () => {
    localStorage.setItem(
      'coqueteria-cart',
      JSON.stringify([
        { productId: 'product-1', name: 'Lazo lavanda', price: 12, quantity: 1 },
        { productId: 'product-2', name: 'Agotado', price: 8, quantity: 1 },
      ]),
    );
    const cart = new CartService();

    const result = cart.sync([product()]);

    expect(result.unavailable).toEqual(['Agotado']);
    expect(cart.lines().map((line) => line.productId)).toEqual(['product-1', 'product-2']);
    expect(cart.lines()[1].available).toBe(false);
  });

  it('updates price and clamps quantity when the catalog changes', () => {
    const cart = new CartService();
    cart.add(product(), 4);

    const result = cart.sync([product({ price: 20, stock: 2 })]);

    expect(result.updated).toEqual(['Lazo lavanda']);
    expect(cart.lines()[0].quantity).toBe(2);
    expect(cart.subtotal()).toBe(40);
  });
});
