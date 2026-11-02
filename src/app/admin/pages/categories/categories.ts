import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriesService, CategoryRecord } from '../../../core/services/categories.service';
import { ProductRecord, ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class AdminCategories {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly service = inject(CategoriesService);
  private readonly productsService = inject(ProductsService);
  readonly categories = signal<CategoryRecord[]>([]);
  readonly visibleCategories = computed(() => {
    if (this.categoryStatus() === '') return this.categories();
    return this.categories().filter((category) =>
      this.categoryStatus() === 'active' ? category.active : !category.active,
    );
  });
  readonly activeCategoryCount = computed(
    () => this.categories().filter((category) => category.active).length,
  );
  readonly productCounts = signal<Record<string, number>>({});
  readonly error = signal('');
  readonly saved = signal(false);
  readonly saving = signal(false);
  readonly notice = signal('');
  readonly deleteTarget = signal<CategoryRecord | null>(null);
  readonly deleting = signal(false);
  readonly categoryStatus = signal<'' | 'active' | 'inactive'>('');
  readonly imagePreview = signal<string | null>(null);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly isForm =
    this.id !== null || this.route.snapshot.url.some((segment) => segment.path === 'nueva');
  image?: File;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    slug: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(500)],
    active: [true],
    sortOrder: [0, [Validators.min(0)]],
  });

  constructor() {
    this.loadCategories();
    if (this.id) this.loadCategory();
  }

  async loadCategories(): Promise<void> {
    try {
      const [categories, products] = await Promise.all([
        this.service.listAll(),
        this.productsService.list({ perPage: 500 }),
      ]);
      this.categories.set(categories);
      this.productCounts.set(
        products.items.reduce<Record<string, number>>((counts, product: ProductRecord) => {
          const key = product.categorySlug || product.category;
          if (key) counts[key] = (counts[key] ?? 0) + 1;
          return counts;
        }, {}),
      );
    } catch {
      this.error.set('No se pudieron cargar las categorías.');
    }
  }

  async loadCategory(): Promise<void> {
    try {
      const category = await this.service.get(this.id!);
      this.form.patchValue(category);
      if (category.image) this.imagePreview.set(this.service.fileUrl(category, category.image));
    } catch {
      this.error.set('No se pudo cargar la categoría.');
    }
  }

  chooseImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.error.set('La imagen debe ser JPG, PNG o WebP de máximo 5 MB.');
      return;
    }
    this.image = file;
    this.imagePreview.set(URL.createObjectURL(file));
  }

  slugify(): void {
    if (this.form.controls.slug.value) return;
    this.form.controls.slug.setValue(
      this.form.controls.name.value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    );
  }

  async save(): Promise<void> {
    this.saved.set(false);
    this.error.set('');
    this.slugify();
    this.form.controls.slug.setValue(this.slugifyValue(this.form.controls.slug.value));
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa el nombre y el slug de la categoría.');
      return;
    }
    this.saving.set(true);
    try {
      const input = { ...this.form.getRawValue(), image: this.image };
      if (this.id) await this.service.update(this.id, input);
      else await this.service.create(input);
      await this.router.navigateByUrl('/admin/categorias');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo guardar la categoría.');
    } finally {
      this.saving.set(false);
    }
  }

  private slugifyValue(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async toggle(category: CategoryRecord): Promise<void> {
    try {
      await this.service.update(category.id, {
        name: category.name,
        slug: category.slug,
        description: category.description,
        active: !category.active,
        sortOrder: category.sortOrder,
      });
      await this.loadCategories();
      this.notice.set(
        category.active
          ? 'Categoría desactivada correctamente.'
          : 'Categoría reactivada correctamente.',
      );
    } catch {
      this.error.set('No se pudo actualizar el estado de la categoría.');
    }
  }

  askDelete(category: CategoryRecord): void {
    this.deleteTarget.set(category);
    this.error.set('');
  }

  cancelDelete(): void {
    if (!this.deleting()) this.deleteTarget.set(null);
  }

  productCount(category: CategoryRecord): number {
    return this.productCounts()[category.slug] || this.productCounts()[category.name] || 0;
  }

  async confirmDelete(): Promise<void> {
    const category = this.deleteTarget();
    if (!category || this.deleting()) return;
    const related = this.productCount(category);
    if (related) {
      this.error.set(
        `No puedes eliminar esta categoría porque tiene ${related} producto(s) asociado(s). Reasigna o elimina esos productos antes de continuar.`,
      );
      this.deleteTarget.set(null);
      return;
    }
    this.deleting.set(true);
    this.error.set('');
    try {
      await this.service.delete(category.id);
      this.deleteTarget.set(null);
      await this.loadCategories();
      this.notice.set('Categoría eliminada definitivamente.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo eliminar la categoría.');
    } finally {
      this.deleting.set(false);
    }
  }
}
