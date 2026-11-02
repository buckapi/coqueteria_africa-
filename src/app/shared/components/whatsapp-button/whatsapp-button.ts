import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton {
  readonly href = `https://wa.me/584161711503?text=${encodeURIComponent('Hola, Coquetería Africa. Me gustaría recibir información sobre sus creaciones.')}`;
}
