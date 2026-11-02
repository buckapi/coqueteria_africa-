import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CatalogRealtimeService } from '../../core/services/catalog-realtime.service';
import { ProductRecord, ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  readonly productsService = inject(ProductsService);
  readonly cart = inject(CartService);
  readonly catalog = inject(CatalogRealtimeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly products = this.catalog.products;
  readonly categories = this.catalog.categories;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly category = signal('');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly onlyAvailable = signal(false);
  readonly onlyFeatured = signal(false);
  readonly sort = signal('recent');
  readonly page = signal(1);
  readonly pageSize = 12;
  readonly filtersOpen = signal(false);
  private searchTimer?: ReturnType<typeof setTimeout>;

  readonly filtered = computed(() => {
    const term = this.normalize(this.search());
    const category = this.category();
    const min = this.minPrice();
    const max = this.maxPrice();
    const result = this.products().filter((product) => {
      const haystack = this.normalize(
        `${product.name} ${product.description} ${product.category} ${product.categorySlug}`,
      );
      return (
        (!term || haystack.includes(term)) &&
        (!category || product.categorySlug === category || product.category === category) &&
        (min === null || product.price >= min) &&
        (max === null || product.price <= max) &&
        (!this.onlyAvailable() || product.stock > 0) &&
        (!this.onlyFeatured() || product.featured)
      );
    });
    return [...result].sort((a, b) => {
      if (this.sort() === 'price-asc') return a.price - b.price;
      if (this.sort() === 'price-desc') return b.price - a.price;
      if (this.sort() === 'name')
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      return b.id.localeCompare(a.id);
    });
  });
  readonly visible = computed(() => this.filtered().slice(0, this.page() * this.pageSize));
  readonly hasMore = computed(() => this.visible().length < this.filtered().length);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('search') ?? '');
      this.category.set(params.get('categoria') ?? '');
      this.sort.set(params.get('orden') ?? 'recent');
      this.minPrice.set(params.get('min') ? Number(params.get('min')) : null);
      this.maxPrice.set(params.get('max') ? Number(params.get('max')) : null);
      this.onlyAvailable.set(params.get('disponible') === '1');
      this.onlyFeatured.set(params.get('destacados') === '1');
      this.page.set(1);
    });
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      await this.catalog.start();
    } catch {
      this.error.set('No se pudo cargar el catálogo. Comprueba la conexión.');
    } finally {
      this.loading.set(false);
    }
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.updateUrl(), 250);
  }

  updateUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search() || null,
        categoria: this.category() || null,
        orden: this.sort() === 'recent' ? null : this.sort(),
        min: this.minPrice() ?? null,
        max: this.maxPrice() ?? null,
        disponible: this.onlyAvailable() ? '1' : null,
        destacados: this.onlyFeatured() ? '1' : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearSearch(): void {
    this.updateSearch('');
  }
  loadMore(): void {
    this.page.update((page) => page + 1);
  }
  addToCart(product: ProductRecord): void {
    this.cart.add(product);
  }
  image(product: ProductRecord): string {
    return product.image
      ? this.productsService.fileUrl(product, product.image)
      : 'assets/img/product-img-44.png';
  }
  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
