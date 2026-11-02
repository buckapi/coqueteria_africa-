import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LegacyAssetsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private loading?: Promise<void>;

  load(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    if (this.loading) return this.loading;

    (window as Window & { __COQUETERIA_ANGULAR__?: boolean }).__COQUETERIA_ANGULAR__ = true;
    const scripts = [
      'assets/js/jquery.min.js',
      'assets/js/swiper.min.js',
      'assets/js/nice-select.min.js',
      'assets/js/odometer.min.js',
      'assets/js/lightgallery.min.js',
      'assets/js/main.js',
    ];

    this.loading = scripts.reduce(
      (chain, src) => chain.then(() => this.appendScript(src)),
      Promise.resolve(),
    );
    return this.loading;
  }

  private appendScript(src: string): Promise<void> {
    if (this.document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Unable to load ${src}`));
      this.document.body.appendChild(script);
    });
  }
}
