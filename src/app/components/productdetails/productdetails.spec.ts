import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductRecord } from '../../core/services/products.service';
import { Productdetails } from './productdetails';

describe('Productdetails', () => {
  let component: Productdetails;
  let fixture: ComponentFixture<Productdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Productdetails],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Productdetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds a generic WhatsApp share link with product data', () => {
    component.product.set({
      id: 'product-1',
      collectionId: 'products',
      collectionName: 'products',
      name: 'Aretes dorados',
      description: 'Una creación especial',
      price: 25,
      category: 'Aretes',
      categorySlug: 'aretes',
      stock: 1,
      sku: 'ARETES-1',
      featured: false,
      status: 'publicado',
      image: 'aretes.jpg',
      gallery: [],
      slug: 'aretes-dorados',
    } as ProductRecord);

    expect(component.whatsappShareLink()).toContain('https://wa.me/?text=');
    expect(decodeURIComponent(component.whatsappShareLink())).toContain('Aretes dorados');
    expect(decodeURIComponent(component.whatsappShareLink())).toContain('aretes-dorados');
  });

  it('builds the commercial WhatsApp link with the current product URL', () => {
    component.product.set({
      id: 'product-1',
      collectionId: 'products',
      collectionName: 'products',
      name: 'Aretes dorados',
      description: 'Una creación especial',
      price: 25,
      category: 'Aretes',
      categorySlug: 'aretes',
      stock: 1,
      sku: 'ARETES-1',
      featured: false,
      status: 'publicado',
      image: 'aretes.jpg',
      gallery: [],
      slug: 'aretes-dorados',
    } as ProductRecord);

    expect(component.whatsappLink()).toContain('https://wa.me/584161711503?text=');
    expect(decodeURIComponent(component.whatsappLink())).toContain('Aretes dorados');
    expect(decodeURIComponent(component.whatsappLink())).toContain('aretes-dorados');
  });
});
