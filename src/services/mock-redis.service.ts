import { Injectable } from '@nestjs/common';

// Mock Redis Service para desenvolvimento sem Redis
@Injectable()
export class MockRedisService {
  private store = new Map<string, string>();

  async set(key: string, value: string, ttl?: number): Promise<void> {
    this.store.set(key, value);
    if (ttl) {
      setTimeout(() => {
        this.store.delete(key);
      }, ttl * 1000);
    }
    console.log(`Redis Mock SET: ${key} = ${value}`);
  }

  async get(key: string): Promise<string | null> {
    const value = this.store.get(key) || null;
    console.log(`Redis Mock GET: ${key} = ${value}`);
    return value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    console.log(`Redis Mock DEL: ${key}`);
  }

  async exists(key: string): Promise<boolean> {
    const exists = this.store.has(key);
    console.log(`Redis Mock EXISTS: ${key} = ${exists}`);
    return exists;
  }
}
