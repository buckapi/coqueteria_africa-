import { computed, Injectable, signal } from '@angular/core';
import { ProductRecord } from './products.service';

export interface CartLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  stock: number;
  available: boolean;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'coqueteria-cart';
  readonly lines = signal<CartLine[]>(this.restore());
  readonly count = computed(() => this.lines().reduce((total, line) => total + line.quantity, 0));
  readonly subtotal = computed(() =>
    this.lines().reduce(
      (total, line) => (line.available ? total + line.price * line.quantity : total),
      0,
    ),
  );

  add(product: ProductRecord, quantity = 1): void {
    if (product.stock <= 0) return;
    const amount = Math.min(product.stock, Math.max(1, Math.floor(quantity)));
    this.lines.update((lines) => {
      const existing = lines.find((line) => line.productId === product.id);
      if (existing) {
        return lines.map((line) =>
          line.productId === product.id
            ? {
                ...line,
                quantity: Math.min(product.stock, line.quantity + amount),
                stock: product.stock,
                price: product.price,
                name: product.name,
                image: product.image,
                sku: product.sku,
                available: true,
              }
            : line,
        );
      }
      return [...lines, this.toLine(product, amount)];
    });
    this.persist();
  }

  update(productId: string, quantity: number, maxQuantity?: number): void {
    this.lines.update((lines) =>
      lines.map((line) => {
        if (line.productId !== productId) return line;
        const amount = Math.max(1, Math.floor(quantity));
        const limit = maxQuantity && maxQuantity > 0 ? maxQuantity : line.stock;
        return { ...line, quantity: limit > 0 ? Math.min(limit, amount) : amount };
      }),
    );
    this.persist();
  }

  increase(productId: string, maxQuantity?: number): void {
    const line = this.lines().find((item) => item.productId === productId);
    if (line) this.update(productId, line.quantity + 1, maxQuantity);
  }

  decrease(productId: string): void {
    const line = this.lines().find((item) => item.productId === productId);
    if (line) this.update(productId, line.quantity - 1);
  }

  remove(productId: string): void {
    this.lines.update((lines) => lines.filter((line) => line.productId !== productId));
    this.persist();
  }

  clear(): void {
    this.lines.set([]);
    this.persist();
  }

  sync(products: ProductRecord[]): {
    lines: CartLine[];
    unavailable: string[];
    updated: string[];
  } {
    const byId = new Map(products.map((product) => [product.id, product]));
    const unavailable: string[] = [];
    const updated: string[] = [];
    const next = this.lines().map((line) => {
      const product = byId.get(line.productId);
      if (!product || product.status !== 'publicado' || product.stock <= 0) {
        unavailable.push(line.name);
        return { ...line, available: false };
      }
      if (
        line.name !== product.name ||
        line.price !== product.price ||
        line.stock !== product.stock ||
        line.image !== product.image ||
        line.quantity > product.stock
      ) {
        updated.push(product.name);
      }
      return this.toLine(product, Math.min(line.quantity, product.stock));
    });
    this.lines.set(next);
    this.persist();
    return { lines: next, unavailable, updated };
  }

  private toLine(product: ProductRecord, quantity: number): CartLine {
    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      sku: product.sku,
      stock: product.stock,
      available: true,
    };
  }

  private restore(): CartLine[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
      return Array.isArray(stored)
        ? stored
            .filter((line) => line?.productId && line.quantity > 0)
            .map((line) => ({
              ...line,
              stock: Number(line.stock ?? 0),
              available: line.available !== false,
            }))
        : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem(this.storageKey, JSON.stringify(this.lines()));
  }
}
