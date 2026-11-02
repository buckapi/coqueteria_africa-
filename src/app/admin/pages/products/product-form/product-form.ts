import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ProductRecord,
  ProductStatus,
  ProductsService,
} from '../../../../core/services/products.service';
import { CategoriesService, CategoryRecord } from '../../../../core/services/categories.service';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  readonly categories = signal<CategoryRecord[]>([]);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly saving = signal(false);
  readonly loading = signal(!!this.id);
  readonly error = signal('');
  readonly saved = signal(false);
  image?: File;
  gallery: File[] = [];
  imagePreview = signal<string | null>(null);
  galleryPreviews = signal<string[]>([]);
  private slugEdited = false;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    slug: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(5000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.maxLength(80)]],
    categorySlug: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    sku: ['', [Validators.maxLength(80)]],
    featured: [false],
    status: ['borrador' as ProductStatus, Validators.required],
  });

  constructor() {
    this.categoriesService
      .listAll()
      .then((categories) => this.categories.set(categories.filter((category) => category.active)))
      .catch(() => undefined);
    if (this.id) this.load();
  }

  async load(): Promise<void> {
    try {
      const product = await this.service.get(this.id!);
      this.form.patchValue(product);
      this.slugEdited = Boolean(product.slug);
      if (product.image) this.imagePreview.set(this.service.fileUrl(product, product.image));
      this.galleryPreviews.set(
        product.gallery?.map((file) => this.service.fileUrl(product, file)) ?? [],
      );
    } catch {
      this.error.set('No se pudo cargar el producto.');
    } finally {
      this.loading.set(false);
    }
  }

  chooseImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.validFile(file)) return;
    this.image = file;
    this.imagePreview.set(URL.createObjectURL(file));
  }
  chooseGallery(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []).filter((file) =>
      this.validFile(file),
    );
    this.gallery = [...this.gallery, ...files];
    this.galleryPreviews.update((previews) => [
      ...previews,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  }
  removeGallery(index: number): void {
    this.gallery.splice(index, 1);
    this.galleryPreviews.update((previews) =>
      previews.filter((_, itemIndex) => itemIndex !== index),
    );
  }
  private validFile(file: File): boolean {
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.error.set('Las imágenes deben ser JPG, PNG o WebP de máximo 5 MB.');
      return false;
    }
    this.error.set('');
    return true;
  }

  async save(): Promise<void> {
    this.saved.set(false);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos obligatorios antes de guardar el producto.');
      return;
    }
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      value.category =
        this.categories().find((category) => category.slug === value.categorySlug)?.name ??
        value.category;
      const input = { ...value, image: this.image, gallery: this.gallery };
      if (this.id) await this.service.update(this.id, input);
      else await this.service.create(input);
      this.saved.set(true);
      await this.router.navigateByUrl('/admin/productos');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      this.saving.set(false);
    }
  }

  generateSlug(): void {
    if (this.slugEdited) return;
    this.form.controls.slug.setValue(this.slugify(this.form.controls.name.value));
  }

  markSlugEdited(): void {
    this.slugEdited = true;
    this.form.controls.slug.setValue(this.slugify(this.form.controls.slug.value));
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }
}
