import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Footer } from './share/footer/footer';
import { Header } from './share/header/header';
import { OfferModal } from './shared/components/offer-modal/offer-modal';
import { ScrollTop } from './shared/components/scroll-top/scroll-top';
import { WhatsappButton } from './shared/components/whatsapp-button/whatsapp-button';

@Component({
  selector: 'app-root',
  imports: [Footer, Header, OfferModal, RouterOutlet, ScrollTop, WhatsappButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly adminRoute = signal(false);

  constructor(router: Router) {
    this.adminRoute.set(router.url.startsWith('/admin'));
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.adminRoute.set((event as NavigationEnd).urlAfterRedirects.startsWith('/admin'));
    });
  }
}
