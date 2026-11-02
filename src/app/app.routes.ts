import { Routes } from '@angular/router';
import { adminGuard } from './admin/guards/admin.guard';
export const routes: Routes = [
  {
    path: '',
    title: 'Coquetería Africa | Creaciones hechas a mano y con amor',
    loadComponent: () => import('./components/home/home').then(({ Home }) => Home),
  },
  {
    path: 'shop',
    title: 'Creaciones | Coquetería Africa',
    loadComponent: () => import('./components/shop/shop').then(({ Shop }) => Shop),
  },
  {
    path: 'shop/:slug',
    title: 'Detalle de creación | Coquetería Africa',
    loadComponent: () =>
      import('./components/productdetails/productdetails').then(
        ({ Productdetails }) => Productdetails,
      ),
  },
  {
    path: 'carrito',
    title: 'Carrito | Coquetería Africa',
    loadComponent: () => import('./components/cart/cart').then(({ Cart }) => Cart),
  },
  {
    path: 'checkout',
    title: 'Pedido por WhatsApp | Coquetería Africa',
    loadComponent: () => import('./components/checkout/checkout').then(({ Checkout }) => Checkout),
  },
  {
    path: 'admin/login',
    title: 'Acceso administrativo | Coquetería Africa',
    loadComponent: () => import('./admin/pages/login/login').then(({ AdminLogin }) => AdminLogin),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/layouts/admin-layout/admin-layout').then(({ AdminLayout }) => AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        title: 'Panel administrativo | Coquetería Africa',
        loadComponent: () =>
          import('./admin/pages/dashboard/dashboard').then(({ AdminDashboard }) => AdminDashboard),
      },
      {
        path: 'productos',
        title: 'Productos | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/products/product-list/product-list').then(
            ({ ProductList }) => ProductList,
          ),
      },
      {
        path: 'productos/nuevo',
        title: 'Nuevo producto | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/products/product-form/product-form').then(
            ({ ProductForm }) => ProductForm,
          ),
      },
      {
        path: 'productos/editar/:id',
        title: 'Editar producto | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/products/product-form/product-form').then(
            ({ ProductForm }) => ProductForm,
          ),
      },
      {
        path: 'categorias',
        title: 'Categorías | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/categories/categories').then(
            ({ AdminCategories }) => AdminCategories,
          ),
      },
      {
        path: 'categorias/nueva',
        title: 'Nueva categoría | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/categories/categories').then(
            ({ AdminCategories }) => AdminCategories,
          ),
      },
      {
        path: 'categorias/editar/:id',
        title: 'Editar categoría | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/categories/categories').then(
            ({ AdminCategories }) => AdminCategories,
          ),
      },
      {
        path: 'banners',
        title: 'Banners | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/banners/banners').then(({ AdminBanners }) => AdminBanners),
      },
      {
        path: 'banners/nuevo',
        title: 'Nuevo banner | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/banners/banners').then(({ AdminBanners }) => AdminBanners),
      },
      {
        path: 'banners/editar/:id',
        title: 'Editar banner | Panel administrativo',
        loadComponent: () =>
          import('./admin/pages/banners/banners').then(({ AdminBanners }) => AdminBanners),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
