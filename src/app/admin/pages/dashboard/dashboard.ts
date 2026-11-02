import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductRecord, ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard {
  private readonly productsService = inject(ProductsService);
  readonly products = signal<ProductRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.productsService.list({ perPage: 100 });
      this.products.set(result.items);
    } catch {
      this.error.set('No se pudieron cargar los productos. Comprueba la conexión con PocketBase.');
    } finally {
      this.loading.set(false);
    }
  }

  count(status?: ProductRecord['status']): number {
    return status
      ? this.products().filter((product) => product.status === status).length
      : this.products().length;
  }
}
