import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductRecord, ProductsService } from '../../../../core/services/products.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private readonly service = inject(ProductsService);
  private readonly allProducts = signal<ProductRecord[]>([]);
  readonly products = computed(() =>
    this.status()
      ? this.allProducts().filter((product) => product.status === this.status())
      : this.allProducts(),
  );
  readonly counts = computed(() =>
    this.allProducts().reduce<Record<string, number>>((counts, product) => {
      counts[product.status] = (counts[product.status] ?? 0) + 1;
      return counts;
    }, {}),
  );
  readonly loading = signal(true);
  readonly error = signal('');
  readonly notice = signal('');
  readonly deleteTarget = signal<ProductRecord | null>(null);
  readonly deleting = signal(false);
  search = '';
  readonly status = signal<ProductRecord['status'] | ''>('');

  constructor() {
    void this.load();
  }

  allProductsCount(): number {
    return this.allProducts().length;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.service.list({ search: this.search, perPage: 500 });
      this.allProducts.set(result.items);
    } catch {
      this.error.set('No se pudo cargar el catálogo.');
    } finally {
      this.loading.set(false);
    }
  }

  async archive(product: ProductRecord): Promise<void> {
    if (!confirm(`¿Archivar «${product.name}»?`)) return;
    try {
      await this.service.archive(product.id);
      await this.load();
      this.notice.set('Producto archivado correctamente.');
    } catch {
      this.error.set('No se pudo archivar el producto.');
    }
  }

  async publish(product: ProductRecord): Promise<void> {
    try {
      await this.service.publish(product.id);
      await this.load();
      this.notice.set('Producto publicado correctamente.');
    } catch {
      this.error.set('No se pudo publicar el producto.');
    }
  }

  askDelete(product: ProductRecord): void {
    this.deleteTarget.set(product);
    this.error.set('');
  }

  cancelDelete(): void {
    if (!this.deleting()) this.deleteTarget.set(null);
  }

  async confirmDelete(): Promise<void> {
    const product = this.deleteTarget();
    if (!product || this.deleting()) return;
    this.deleting.set(true);
    this.error.set('');
    try {
      await this.service.delete(product.id);
      this.deleteTarget.set(null);
      await this.load();
      this.notice.set('Producto eliminado definitivamente.');
    } catch {
      this.error.set('No se pudo eliminar el producto. El registro se conservó.');
    } finally {
      this.deleting.set(false);
    }
  }
}
