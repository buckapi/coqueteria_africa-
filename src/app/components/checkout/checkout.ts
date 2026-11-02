import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CatalogRealtimeService } from '../../core/services/catalog-realtime.service';
import { ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  readonly cart = inject(CartService);
  readonly catalog = inject(CatalogRealtimeService);
  readonly productsService = inject(ProductsService);
  readonly products = this.catalog.products;
  readonly name = signal('');
  readonly notes = signal('');
  readonly error = signal('');
  readonly unavailable = signal<string[]>([]);
  readonly validating = signal(false);

  constructor() {
    effect(() => {
      if (!this.catalog.loaded()) return;
      const result = untracked(() => this.cart.sync(this.catalog.products()));
      this.unavailable.set(result.unavailable);
      if (result.updated.length)
        this.error.set(`El catálogo se actualizó: ${result.updated.join(', ')}.`);
    });
    void this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.cart.lines().length) return;
    try {
      await this.catalog.start();
      const result = untracked(() => this.cart.sync(this.catalog.products()));
      this.unavailable.set(result.unavailable);
    } catch {
      this.error.set('No se pudo validar la disponibilidad actual. Intenta nuevamente.');
    }
  }

  image(productId: string, filename: string): string {
    const product = this.products().find((item) => item.id === productId);
    return product && filename
      ? this.productsService.fileUrl(product, filename)
      : 'assets/img/product-img-44.png';
  }

  whatsappUrl(): string {
    const lines = this.cart
      .lines()
      .filter((line) => line.available)
      .map(
        (line, index) =>
          `${index + 1}. ${line.name}\nCantidad: ${line.quantity}\nPrecio unitario: ${this.money(line.price)}\nSubtotal: ${this.money(line.price * line.quantity)}`,
      )
      .join('\n\n');
    const message = `Hola, Coquetería Africa. Me gustaría consultar y solicitar los siguientes productos:\n\n${lines}\n\nTotal estimado: ${this.money(this.cart.subtotal())}\n\n${this.name() ? `Nombre: ${this.name()}\n\n` : ''}${this.notes() ? `Observaciones: ${this.notes()}\n\n` : ''}Quedo pendiente de confirmar disponibilidad, entrega y forma de pago. Gracias.`;
    return `https://wa.me/584161711503?text=${encodeURIComponent(message)}`;
  }

  async sendWhatsApp(event: Event): Promise<void> {
    event.preventDefault();
    this.validating.set(true);
    this.error.set('');
    try {
      await this.catalog.refresh();
      const result = untracked(() => this.cart.sync(this.catalog.products()));
      this.unavailable.set(result.unavailable);
      if (result.unavailable.length) {
        this.error.set('Revisa los productos no disponibles antes de enviar el pedido.');
        return;
      }
      window.open(this.whatsappUrl(), '_blank', 'noopener,noreferrer');
    } catch {
      this.error.set('No se pudo validar la disponibilidad actual. Intenta nuevamente.');
    } finally {
      this.validating.set(false);
    }
  }

  private money(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
