import { CommonModule } from '@angular/common';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LegacyAssetsService } from '../../core/services/legacy-assets.service';
import { ProductRecord, ProductsService } from '../../core/services/products.service';
import { CategoriesService, CategoryRecord } from '../../core/services/categories.service';
import { BannersService } from '../../core/services/banners.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogRealtimeService } from '../../core/services/catalog-realtime.service';

interface CategoryCard {
  name: string;
  slug: string;
  image: string;
}

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly legacyAssets = inject(LegacyAssetsService);
  private readonly route = inject(ActivatedRoute);
  readonly productsService = inject(ProductsService);
  readonly categoriesService = inject(CategoriesService);
  readonly bannersService = inject(BannersService);
  readonly catalog = inject(CatalogRealtimeService);
  readonly cart = inject(CartService);
  readonly publishedProducts = this.catalog.products;
  readonly categories = this.catalog.categories;
  readonly activeBanner = this.catalog.activeBanner;
  readonly selectedCategory = signal('');
  private readonly categoryImages = [
    'assets/img/categories/category-necklaces.jpg',
    'assets/img/categories/category-bracelets.jpg',
    'assets/img/categories/category-rings.jpg',
    'assets/img/categories/category-earrings.jpg',
    'assets/img/categories/category-necklaces-2.jpg',
  ];

  readonly visibleProducts = computed(() => {
    const category = this.selectedCategory();
    return category
      ? this.publishedProducts().filter(
          (product) => product.categorySlug === category || product.category === category,
        )
      : this.publishedProducts();
  });

  constructor() {
    afterNextRender(() => this.legacyAssets.load());
    this.route.queryParamMap.subscribe((params) =>
      this.selectedCategory.set(params.get('categoria') ?? ''),
    );
    void this.catalog.start();
  }

  addToCart(product: ProductRecord): void {
    this.cart.add(product);
  }

  categoryImage(category: CategoryRecord, index: number): string {
    return category.image
      ? this.categoriesService.fileUrl(category, category.image)
      : this.categoryImages[index % this.categoryImages.length];
  }
}
