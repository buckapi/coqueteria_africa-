import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  identity = '';
  password = '';
  readonly error = signal('');

  async submit(): Promise<void> {
    this.error.set('');
    try {
      await this.auth.login(this.identity, this.password);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'No se pudo iniciar sesión. Comprueba tus datos.',
      );
    }
  }
}
