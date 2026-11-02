import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CatalogRealtimeService } from '../../core/services/catalog-realtime.service';
import { ProductRecord, ProductsService } from '../../core/services/products.service';
import { environment } from '../../../environments/environment';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-productdetails',
  styleUrl: './productdetails.css',
  templateUrl: './productdetails.html',
})
export class Productdetails {
  readonly service = inject(ProductsService);
  readonly catalog = inject(CatalogRealtimeService);
  readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  readonly product = signal<ProductRecord | null>(null);
  readonly related = signal<ProductRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly quantity = signal(1);
  readonly added = signal(false);
  readonly selectedImage = signal('');
  readonly shareOpen = signal(false);
  readonly shareStatus = signal('');
  readonly images = computed(() => {
    const product = this.product();
    return product ? [product.image, ...(product.gallery ?? [])].filter(Boolean) : [];
  });

  constructor() {
    effect(() => {
      const current = this.product();
      const products = this.catalog.products();
      if (!current || !this.catalog.loaded()) return;
      const latest = products.find((item) => item.id === current.id);
      if (!latest) {
        this.product.set(null);
        this.error.set('Esta creación ya no está disponible.');
        this.loading.set(false);
        return;
      }
      if (latest !== current) {
        this.product.set(latest);
        this.selectedImage.set(latest.image ?? '');
        this.updateSeo(latest);
      }
      this.related.set(
        products
          .filter(
            (item) =>
              item.id !== latest.id &&
              (item.categorySlug === latest.categorySlug || item.category === latest.category),
          )
          .slice(0, 3),
      );
    });
    this.load();
  }

  async load(): Promise<void> {
    try {
      await this.catalog.start();
      const id = this.route.snapshot.paramMap.get('slug');
      if (!id) throw new Error('Producto no encontrado.');
      const product = await this.service.getBySlugOrId(id);
      if (product.status !== 'publicado') throw new Error('Producto no disponible.');
      if (!this.catalog.products().some((item) => item.id === product.id))
        throw new Error('Producto no disponible.');
      const canonicalSlug = this.service.productSlug(product);
      if (id !== canonicalSlug) {
        await this.router.navigate(['/shop', canonicalSlug], { replaceUrl: true });
        return;
      }
      this.product.set(product);
      this.selectedImage.set(product.image ?? '');
      this.updateSeo(product);
    } catch {
      this.error.set('No encontramos esta creación o ya no está disponible.');
    } finally {
      this.loading.set(false);
    }
  }

  image(filename: string): string {
    return this.product() ? this.service.fileUrl(this.product()!, filename) : '';
  }
  relatedImage(product: ProductRecord): string {
    return product.image
      ? this.service.fileUrl(product, product.image)
      : 'assets/img/product-img-44.png';
  }
  changeQuantity(amount: number): void {
    this.quantity.update((value) =>
      Math.max(1, Math.min(this.product()?.stock || 1, value + amount)),
    );
  }
  addToCart(): void {
    if (!this.product() || this.product()!.stock <= 0) return;
    this.cart.add(this.product()!, this.quantity());
    this.added.set(true);
    window.setTimeout(() => this.added.set(false), 2200);
  }
  whatsappLink(): string {
    const product = this.product();
    const name = product?.name ?? 'esta creación';
    return `https://wa.me/584161711503?text=${encodeURIComponent(`Hola, Coquetería Africa. Me gustaría consultar por el producto ${name}. ${this.productUrl()}`)}`;
  }

  productUrl(): string {
    const product = this.product();
    if (!product) return '';
    const base = (environment.storeUrl || globalThis.location?.origin || '').replace(/\/+$/, '');
    return `${base}/shop/${this.service.productSlug(product)}`;
  }

  whatsappShareLink(): string {
    const product = this.product();
    if (!product) return '';
    const message = `¡Mira esta creación de Coquetería Africa!\n\nNombre: ${product.name}\n\nPrecio: ${this.money(product.price)}\n\nVer producto:\n${this.productUrl()}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  openShare(): void {
    this.shareStatus.set(
      environment.storeUrl || !this.isLocalHost()
        ? ''
        : 'Estás en desarrollo; este enlace usa la dirección local y no será accesible desde otro dispositivo.',
    );
    this.shareOpen.set(true);
  }

  closeShare(): void {
    this.shareOpen.set(false);
  }

  async nativeShare(): Promise<void> {
    const product = this.product();
    const share = globalThis.navigator?.share;
    if (!product || !share) {
      this.shareStatus.set('Elige WhatsApp o copia el enlace para compartir.');
      return;
    }
    try {
      await share.call(globalThis.navigator, {
        title: product.name,
        text: `Mira ${product.name} de Coquetería Africa`,
        url: this.productUrl(),
      });
      this.closeShare();
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== 'AbortError') {
        this.shareStatus.set('No se pudo abrir el menú de compartir.');
      }
    }
  }

  async copyLink(): Promise<void> {
    try {
      const clipboard = globalThis.navigator?.clipboard;
      if (!clipboard) throw new Error('Clipboard API unavailable');
      await clipboard.writeText(this.productUrl());
      this.shareStatus.set('Enlace copiado.');
    } catch {
      this.shareStatus.set('No se pudo copiar el enlace.');
    }
  }

  private money(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }

  private updateSeo(product: ProductRecord): void {
    const description = product.description.trim();
    const url = this.productUrl();
    this.title.setTitle(`${product.name} | Coquetería Africa`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: `${product.name} | Coquetería Africa` });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (product.image)
      this.meta.updateTag({ property: 'og:image', content: this.image(product.image) });
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private isLocalHost(): boolean {
    const hostname = globalThis.location?.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  }
}
