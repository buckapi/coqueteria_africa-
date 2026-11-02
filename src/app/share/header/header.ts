import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  imports: [FormsModule, RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  searchTerm = '';
  protected readonly menuOpen = signal(false);
  protected readonly searchOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleSearch(): void {
    this.searchOpen.update((open) => !open);
  }

  protected submitSearch(): void {
    this.searchOpen.set(false);
    void this.router.navigate(['/shop'], { queryParams: { search: this.searchTerm || null } });
  }
}
