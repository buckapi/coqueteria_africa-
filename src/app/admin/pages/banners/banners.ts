import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BannersService, BannerRecord } from '../../../core/services/banners.service';

@Component({
  selector: 'app-admin-banners',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './banners.html',
  styleUrl: './banners.css',
})
export class AdminBanners {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly service = inject(BannersService);
  readonly banners = signal<BannerRecord[]>([]);
  readonly activeBannerId = signal('');
  readonly generalBannerId = signal('');
  readonly error = signal('');
  readonly saving = signal(false);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly isForm =
    this.id !== null || this.route.snapshot.url.some((segment) => segment.path === 'nuevo');
  readonly desktopPreview = signal<string | null>(null);
  readonly mobilePreview = signal<string | null>(null);
  desktop?: File;
  mobile?: File;
  readonly form = this.fb.nonNullable.group({
    campaignName: ['', [Validators.required, Validators.maxLength(120)]],
    eyebrow: ['Coquetería Africa', Validators.maxLength(120)],
    title: ['', [Validators.required, Validators.maxLength(180)]],
    highlightText: ['', Validators.maxLength(180)],
    subtitle: ['', Validators.maxLength(500)],
    description: ['', Validators.maxLength(1000)],
    buttonText: ['Ver creaciones', Validators.maxLength(80)],
    buttonUrl: ['/shop', Validators.maxLength(500)],
    campaignType: ['general', Validators.maxLength(80)],
    startsAt: [''],
    endsAt: [''],
    priority: [0, [Validators.min(0)]],
    enabled: [true],
  });

  constructor() {
    this.loadBanners();
    this.loadSettings();
    if (this.id) this.loadBanner();
  }

  async loadSettings(): Promise<void> {
    try {
      const settings = await this.service.getSettings();
      this.activeBannerId.set(settings.activeBannerId ?? '');
      this.generalBannerId.set(settings.generalBannerId ?? '');
    } catch {
      this.error.set('No se pudo cargar la configuración del banner principal.');
    }
  }

  async loadBanners(): Promise<void> {
    try {
      this.banners.set(await this.service.listAll());
    } catch {
      this.error.set('No se pudieron cargar los banners.');
    }
  }

  async loadBanner(): Promise<void> {
    try {
      const banner = await this.service.get(this.id!);
      this.form.patchValue({
        ...banner,
        startsAt: this.toDatetimeLocal(banner.startsAt),
        endsAt: this.toDatetimeLocal(banner.endsAt),
      });
      if (banner.imageDesktop)
        this.desktopPreview.set(this.service.fileUrl(banner, banner.imageDesktop));
      if (banner.imageMobile)
        this.mobilePreview.set(this.service.fileUrl(banner, banner.imageMobile));
    } catch {
      this.error.set('No se pudo cargar el banner.');
    }
  }

  chooseImage(event: Event, type: 'desktop' | 'mobile'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      this.error.set('La imagen debe ser JPG, PNG o WebP de máximo 8 MB.');
      return;
    }
    if (type === 'desktop') {
      this.desktop = file;
      this.desktopPreview.set(URL.createObjectURL(file));
    } else {
      this.mobile = file;
      this.mobilePreview.set(URL.createObjectURL(file));
    }
  }

  async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa el título del banner.');
      return;
    }
    if (!this.desktopPreview() && !this.desktop) {
      this.error.set('Selecciona una imagen desktop para el banner.');
      return;
    }
    if (
      this.form.controls.buttonUrl.value &&
      !/^\/(?!\/)|^https?:\/\//i.test(this.form.controls.buttonUrl.value)
    ) {
      this.error.set('El enlace debe ser una ruta interna o una URL http/https.');
      return;
    }
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      const input = {
        ...value,
        startsAt: this.toIso(value.startsAt),
        endsAt: this.toIso(value.endsAt),
        imageDesktop: this.desktop,
        imageMobile: this.mobile,
      };
      if (this.id) await this.service.update(this.id, input);
      else await this.service.create(input);
      await this.router.navigateByUrl('/admin/banners');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo guardar el banner.');
    } finally {
      this.saving.set(false);
    }
  }

  async useAsPrimary(banner: BannerRecord): Promise<void> {
    try {
      await this.service.selectPrimary(banner.id);
      await this.loadSettings();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo seleccionar el banner.');
    }
  }

  async useAsGeneral(banner: BannerRecord): Promise<void> {
    try {
      await this.service.setGeneral(banner.id);
      await this.loadSettings();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'No se pudo guardar el fallback general.',
      );
    }
  }

  async toggle(banner: BannerRecord): Promise<void> {
    try {
      const disablingPrimary = this.activeBannerId() === banner.id && banner.enabled;
      await this.service.update(banner.id, {
        ...banner,
        campaignName: banner.campaignName || banner.campaignType || 'General',
        description: banner.description || '',
        enabled: !banner.enabled,
        imageDesktop: undefined,
        imageMobile: undefined,
      });
      if (disablingPrimary) await this.service.clearPrimary();
      await this.loadBanners();
      await this.loadSettings();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo actualizar el estado.');
    }
  }

  async remove(banner: BannerRecord): Promise<void> {
    if (
      !confirm(
        `¿Eliminar el banner «${banner.campaignName || banner.title}»? Si es el principal, se usará el banner general si está configurado.`,
      )
    )
      return;
    try {
      if (this.activeBannerId() === banner.id) await this.service.clearPrimary();
      if (this.generalBannerId() === banner.id) await this.service.clearGeneral();
      await this.service.delete(banner.id);
      await this.loadBanners();
      await this.loadSettings();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo eliminar el banner.');
    }
  }

  private toDatetimeLocal(value: string): string {
    return value ? new Date(value).toISOString().slice(0, 16) : '';
  }
  private toIso(value: string): string {
    return value ? new Date(value).toISOString() : '';
  }
}
