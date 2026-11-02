import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CatalogRealtimeService } from '../../core/services/catalog-realtime.service';
import { ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  readonly cart = inject(CartService);
  readonly catalog = inject(CatalogRealtimeService);
  readonly productsService = inject(ProductsService);
  readonly products = this.catalog.products;
  readonly notice = signal('');

  constructor() {
    effect(() => {
      if (!this.catalog.loaded()) return;
      const result = untracked(() => this.cart.sync(this.catalog.products()));
      const messages = [
        result.unavailable.length ? `No disponibles: ${result.unavailable.join(', ')}.` : '',
        result.updated.length ? `Catálogo actualizado: ${result.updated.join(', ')}.` : '',
      ].filter(Boolean);
      if (messages.length) this.notice.set(messages.join(' '));
    });
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      await this.catalog.start();
    } catch {
      this.notice.set('No se pudo comprobar la disponibilidad actual.');
    }
  }

  image(productId: string, filename: string): string {
    const product = this.products().find((item) => item.id === productId);
    return product && filename
      ? this.productsService.fileUrl(product, filename)
      : 'assets/img/product-img-44.png';
  }

  stock(productId: string): number {
    return this.products().find((product) => product.id === productId)?.stock ?? 0;
  }
}
