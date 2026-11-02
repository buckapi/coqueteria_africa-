import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { pocketBase } from './pocketbase.client';

export interface CategoryRecord extends RecordModel {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  sortOrder: number;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  active: boolean;
  sortOrder: number;
  image?: File;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly pb: PocketBase = pocketBase;

  listPublic() {
    return this.pb
      .collection<CategoryRecord>('product_categories')
      .getFullList({ filter: 'active = true', sort: 'sortOrder,name' });
  }

  listAll() {
    return this.pb
      .collection<CategoryRecord>('product_categories')
      .getFullList({ sort: 'sortOrder,name' });
  }

  get(id: string) {
    return this.pb.collection<CategoryRecord>('product_categories').getOne(id);
  }

  create(input: CategoryInput) {
    return this.pb.collection<CategoryRecord>('product_categories').create(this.toFormData(input));
  }

  update(id: string, input: CategoryInput) {
    return this.pb
      .collection<CategoryRecord>('product_categories')
      .update(id, this.toFormData(input));
  }

  async archive(id: string) {
    const category = await this.get(id);
    return this.update(id, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      active: false,
      sortOrder: category.sortOrder,
    });
  }

  delete(id: string) {
    return this.pb.collection<CategoryRecord>('product_categories').delete(id);
  }

  fileUrl(category: CategoryRecord, filename: string): string {
    return this.pb.files.getURL(category, filename);
  }

  private toFormData(input: CategoryInput): FormData {
    const data = new FormData();
    data.set('name', input.name);
    data.set('slug', input.slug);
    data.set('description', input.description ?? '');
    data.set('active', String(input.active));
    data.set('sortOrder', String(input.sortOrder ?? 0));
    if (input.image) data.set('image', input.image);
    return data;
  }
}
