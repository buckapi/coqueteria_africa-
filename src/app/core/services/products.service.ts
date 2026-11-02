import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { pocketBase } from './pocketbase.client';

export type ProductStatus = 'borrador' | 'publicado' | 'archivado';

export interface ProductRecord extends RecordModel {
  name: string;
  description: string;
  price: number;
  category: string;
  categorySlug: string;
  stock: number;
  sku: string;
  featured: boolean;
  status: ProductStatus;
  image: string;
  gallery: string[];
  slug?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  categorySlug: string;
  stock: number;
  sku: string;
  featured: boolean;
  status: ProductStatus;
  slug: string;
  image?: File;
  gallery?: File[];
  removeGallery?: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly pb: PocketBase = pocketBase;

  list(options: { page?: number; perPage?: number; search?: string; status?: ProductStatus } = {}) {
    const filters: string[] = [];
    if (options.status) filters.push(`status = "${options.status}"`);
    const search = options.search?.trim();
    if (search) {
      filters.push(
        `(name ~ "${this.escapeFilter(search)}" || description ~ "${this.escapeFilter(search)}" || category ~ "${this.escapeFilter(search)}")`,
      );
    }
    return this.pb
      .collection<ProductRecord>('products')
      .getList(options.page ?? 1, options.perPage ?? 50, {
        filter: filters.join(' && '),
        sort: '-id',
      });
  }

  listPublished() {
    return this.pb
      .collection<ProductRecord>('products')
      .getFullList({ filter: 'status = "publicado"', sort: '-id' })
      .then((products) => this.resolveSlugs(products));
  }

  get(id: string) {
    return this.pb.collection<ProductRecord>('products').getOne(id);
  }

  async getBySlugOrId(value: string): Promise<ProductRecord> {
    try {
      return await this.pb
        .collection<ProductRecord>('products')
        .getFirstListItem(`slug = "${this.escapeFilter(value)}"`);
    } catch {
      try {
        return await this.get(value);
      } catch {
        const products = await this.listPublished();
        const product = products.find(
          (item) =>
            item.slug === value ||
            this.productSlug(item) === value ||
            this.legacyProductSlug(item, products) === value,
        );
        if (!product) throw new Error('Producto no encontrado.');
        return product;
      }
    }
  }

  productSlug(product: Pick<ProductRecord, 'id' | 'name' | 'slug'>): string {
    return (product.slug ? this.slugify(product.slug) : this.slugify(product.name)) || product.id;
  }

  create(input: ProductInput) {
    return this.pb.collection<ProductRecord>('products').create(this.toFormData(input));
  }

  update(id: string, input: ProductInput) {
    return this.pb.collection<ProductRecord>('products').update(id, this.toFormData(input));
  }

  archive(id: string) {
    return this.pb.collection<ProductRecord>('products').update(id, { status: 'archivado' });
  }

  publish(id: string) {
    return this.pb.collection<ProductRecord>('products').update(id, { status: 'publicado' });
  }

  delete(id: string) {
    return this.pb.collection<ProductRecord>('products').delete(id);
  }

  fileUrl(record: ProductRecord, filename: string, thumb?: string): string {
    return this.pb.files.getURL(record, filename, thumb ? { thumb } : undefined);
  }

  private toFormData(input: ProductInput): FormData {
    const data = new FormData();
    data.set('name', input.name);
    data.set('description', input.description);
    data.set('price', String(input.price));
    data.set('category', input.category);
    data.set('categorySlug', input.categorySlug);
    data.set('stock', String(input.stock));
    data.set('sku', input.sku);
    data.set('featured', String(input.featured));
    data.set('status', input.status);
    data.set('slug', input.slug);
    if (input.image) data.set('image', input.image);
    input.gallery?.forEach((file) => data.append('gallery', file));
    input.removeGallery?.forEach((file) => data.append('gallery-', file));
    return data;
  }

  private escapeFilter(value: string): string {
    return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  }

  private resolveSlugs(products: ProductRecord[]): ProductRecord[] {
    const groups = new Map<string, ProductRecord[]>();
    for (const product of products) {
      const base = this.slugify(product.name) || product.id;
      groups.set(base, [...(groups.get(base) ?? []), product]);
    }
    return products.map((product) => {
      if (product.slug?.trim()) return { ...product, slug: this.slugify(product.slug) };
      const base = this.slugify(product.name) || product.id;
      const duplicate = (groups.get(base)?.length ?? 0) > 1;
      return { ...product, slug: duplicate ? `${base}-${product.id.slice(-6)}` : base };
    });
  }

  private legacyProductSlug(product: ProductRecord, products: ProductRecord[]): string {
    const base = this.slugify(product.name) || product.id;
    const duplicate =
      products.filter((item) => (this.slugify(item.name) || item.id) === base).length > 1;
    return duplicate ? `${base}-${product.id.slice(-6)}` : base;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
