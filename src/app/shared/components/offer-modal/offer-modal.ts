import { DOCUMENT } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './offer-modal.html',
})
export class OfferModal {
  private readonly document = inject(DOCUMENT);
  protected readonly open = signal(false);

  constructor() {
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem('coqueteriaAfricaIntroShown') === null
    ) {
      this.open.set(true);
      sessionStorage.setItem('coqueteriaAfricaIntroShown', '1');
      this.document.body.style.overflow = 'hidden';
    }
  }

  protected close(): void {
    this.open.set(false);
    this.document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (this.open()) this.close();
  }
}
