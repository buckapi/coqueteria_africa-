import { DestroyRef, Injectable, signal } from '@angular/core';
import { BannerRecord, BannersService } from './banners.service';
import { CategoriesService, CategoryRecord } from './categories.service';
import { ProductRecord, ProductsService } from './products.service';
import { pocketBase } from './pocketbase.client';

export type RealtimeState = 'idle' | 'connecting' | 'connected' | 'offline';

@Injectable({ providedIn: 'root' })
export class CatalogRealtimeService {
  readonly products = signal<ProductRecord[]>([]);
  readonly categories = signal<CategoryRecord[]>([]);
  readonly activeBanner = signal<BannerRecord | null>(null);
  readonly loaded = signal(false);
  readonly state = signal<RealtimeState>('idle');
  readonly error = signal('');

  private startPromise?: Promise<void>;
  private refreshScheduled = false;
  private unsubscribers: Array<() => void> = [];
  private readonly knownCategoryKeys = new Set<string>();

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly bannersService: BannersService,
    destroyRef: DestroyRef,
  ) {
    destroyRef.onDestroy(() => this.stop());
  }

  start(): Promise<void> {
    if (!this.startPromise) {
      this.startPromise = this.initialize().catch((error) => {
        this.error.set(error instanceof Error ? error.message : 'No se pudo conectar al catálogo.');
        this.state.set('offline');
      });
    }
    return this.startPromise;
  }

  async refresh(): Promise<void> {
    try {
      const [allCategories, products, activeBanner] = await Promise.all([
        this.categoriesService.listAll(),
        this.productsService.listPublished(),
        this.bannersService.getSelected(),
      ]);
      this.rememberCategories(allCategories);
      this.categories.set(allCategories.filter((category) => category.active));
      this.products.set(this.visibleProducts(products, allCategories));
      this.activeBanner.set(activeBanner);
      this.loaded.set(true);
      this.error.set('');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo actualizar el catálogo.');
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    this.state.set('connecting');
    this.bindBrowserRecovery();
    if (typeof EventSource === 'undefined') {
      await this.refresh();
      this.state.set('offline');
      return;
    }
    await Promise.all([
      this.subscribe('products'),
      this.subscribe('product_categories'),
      this.subscribe('store_banners'),
      this.subscribe('store_settings'),
    ]);
    await this.refresh();
    this.state.set('connected');
  }

  private async subscribe(
    collectionName: 'products' | 'product_categories' | 'store_banners' | 'store_settings',
  ): Promise<void> {
    const unsubscribe = await pocketBase.collection(collectionName).subscribe('*', (event) => {
      if (event.action === 'PB_CONNECT') {
        void this.refresh().catch(() => this.state.set('offline'));
        return;
      }
      this.schedule(() => this.refresh());
    });
    this.unsubscribers.push(() => void unsubscribe());
  }

  private schedule(refresh: () => Promise<void>): void {
    if (this.refreshScheduled) return;
    this.refreshScheduled = true;
    queueMicrotask(() => {
      this.refreshScheduled = false;
      void refresh().catch(() => this.state.set('offline'));
    });
  }

  private visibleProducts(
    products: ProductRecord[],
    categories: CategoryRecord[],
  ): ProductRecord[] {
    return products.filter((product) => {
      const category = categories.find(
        (item) => item.slug === product.categorySlug || item.name === product.category,
      );
      if (category) return category.active;
      const key = product.categorySlug || product.category;
      return !key || !this.knownCategoryKeys.has(key);
    });
  }

  private rememberCategories(categories: CategoryRecord[]): void {
    for (const category of categories) {
      this.knownCategoryKeys.add(category.slug || category.name);
    }
  }

  private bindBrowserRecovery(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', this.recover);
    document.addEventListener('visibilitychange', this.recover);
  }

  private readonly recover = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    void this.refresh()
      .then(() => this.state.set('connected'))
      .catch(() => this.state.set('offline'));
  };

  private stop(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.unsubscribers = [];
    if (typeof window !== 'undefined') window.removeEventListener('online', this.recover);
    if (typeof document !== 'undefined')
      document.removeEventListener('visibilitychange', this.recover);
  }
}
