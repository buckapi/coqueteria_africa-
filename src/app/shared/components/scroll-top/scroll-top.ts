import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  template: `
    @if (visible()) {
      <button
        type="button"
        class="cs_scrollup_btn show"
        aria-label="Volver arriba"
        (click)="scrollToTop()"
      >
        <i class="ri-arrow-up-line"></i>
      </button>
    }
  `,
})
export class ScrollTop {
  protected readonly visible = signal(false);

  @HostListener('window:scroll')
  protected updateVisibility(): void {
    this.visible.set(window.scrollY >= 300);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
