import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { pocketBase } from './pocketbase.client';

export interface BannerRecord extends RecordModel {
  title: string;
  eyebrow: string;
  highlightText: string;
  subtitle: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  buttonUrl: string;
  campaignType: string;
  campaignName: string;
  description: string;
  startsAt: string;
  endsAt: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerSettingsRecord extends RecordModel {
  activeBannerId: string;
  generalBannerId: string;
  catalogVersion?: string;
}

export interface BannerInput {
  title: string;
  eyebrow: string;
  highlightText: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  campaignType: string;
  campaignName: string;
  description: string;
  startsAt: string;
  endsAt: string;
  priority: number;
  enabled: boolean;
  createdAt?: string;
  imageDesktop?: File;
  imageMobile?: File;
}

@Injectable({ providedIn: 'root' })
export class BannersService {
  private readonly pb: PocketBase = pocketBase;
  private readonly settingsId = 'activebanner001';

  listAll() {
    return this.pb.collection<BannerRecord>('store_banners').getFullList({ sort: '-priority,-id' });
  }

  async listAvailable(): Promise<BannerRecord[]> {
    const now = Date.now();
    const banners = await this.pb
      .collection<BannerRecord>('store_banners')
      .getFullList({ filter: 'enabled = true', sort: '-priority,-id' });
    return banners.filter((banner) => {
      const starts = banner.startsAt ? Date.parse(banner.startsAt) : Number.NEGATIVE_INFINITY;
      const ends = banner.endsAt ? Date.parse(banner.endsAt) : Number.POSITIVE_INFINITY;
      return starts <= now && now <= ends;
    });
  }

  async getSelected(): Promise<BannerRecord | null> {
    const settings = await this.getSettings();
    for (const id of [settings.activeBannerId, settings.generalBannerId]) {
      if (!id) continue;
      try {
        const banner = await this.get(id);
        if (this.isUsable(banner)) return banner;
      } catch {
        // A removed campaign falls through to the configured general banner.
      }
    }
    return null;
  }

  getSettings() {
    return this.pb.collection<BannerSettingsRecord>('store_settings').getOne(this.settingsId);
  }

  async selectPrimary(id: string): Promise<void> {
    const banner = await this.get(id);
    if (!banner.imageDesktop)
      throw new Error('El banner necesita una imagen desktop antes de activarlo.');
    if (!banner.enabled) throw new Error('Activa el banner antes de seleccionarlo como principal.');
    await this.pb
      .collection<BannerSettingsRecord>('store_settings')
      .update(this.settingsId, { activeBannerId: id });
  }

  async setGeneral(id: string): Promise<void> {
    const banner = await this.get(id);
    if (!banner.imageDesktop) throw new Error('El banner general necesita una imagen desktop.');
    await this.pb
      .collection<BannerSettingsRecord>('store_settings')
      .update(this.settingsId, { generalBannerId: id });
  }

  clearPrimary() {
    return this.pb
      .collection<BannerSettingsRecord>('store_settings')
      .update(this.settingsId, { activeBannerId: '' });
  }

  clearGeneral() {
    return this.pb
      .collection<BannerSettingsRecord>('store_settings')
      .update(this.settingsId, { generalBannerId: '' });
  }

  delete(id: string) {
    return this.pb.collection<BannerRecord>('store_banners').delete(id);
  }

  get(id: string) {
    return this.pb.collection<BannerRecord>('store_banners').getOne(id);
  }

  create(input: BannerInput) {
    return this.pb
      .collection<BannerRecord>('store_banners')
      .create(this.toFormData(input, new Date().toISOString()));
  }

  update(id: string, input: BannerInput) {
    return this.pb
      .collection<BannerRecord>('store_banners')
      .update(id, this.toFormData(input, input.createdAt ?? new Date().toISOString()));
  }

  fileUrl(banner: BannerRecord, filename: string): string {
    return this.pb.files.getURL(banner, filename);
  }

  private toFormData(input: BannerInput, createdAt: string): FormData {
    const data = new FormData();
    for (const key of [
      'title',
      'eyebrow',
      'highlightText',
      'subtitle',
      'buttonText',
      'buttonUrl',
      'campaignType',
      'campaignName',
      'description',
      'startsAt',
      'endsAt',
    ]) {
      data.set(key, String(input[key as keyof BannerInput] ?? ''));
    }
    data.set('priority', String(input.priority ?? 0));
    data.set('enabled', String(input.enabled));
    data.set('createdAt', createdAt);
    data.set('updatedAt', new Date().toISOString());
    if (input.imageDesktop) data.set('imageDesktop', input.imageDesktop);
    if (input.imageMobile) data.set('imageMobile', input.imageMobile);
    return data;
  }

  private isUsable(banner: BannerRecord): boolean {
    const now = Date.now();
    const starts = banner.startsAt ? Date.parse(banner.startsAt) : Number.NEGATIVE_INFINITY;
    const ends = banner.endsAt ? Date.parse(banner.endsAt) : Number.POSITIVE_INFINITY;
    return banner.enabled && !!banner.imageDesktop && starts <= now && now <= ends;
  }
}
