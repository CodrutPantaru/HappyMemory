import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

export interface UserProfile {
  name: string;
  email: string | null;
  imageUrl: string | null;
}

const USER_STORAGE_KEY = 'memory-game-google-user';

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly userSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly user$ = this.userSubject.asObservable();

  get user(): UserProfile | null {
    return this.userSubject.value;
  }

  async init(): Promise<void> {
    this.loadCachedUser();

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await SocialLogin.initialize({
        google: {
          webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
          mode: 'online'
        }
      });
    } catch {
      // ignore init errors
    }
  }

  async signIn(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const response = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['profile', 'email']
        }
      });

      if (response.provider !== 'google') {
        return;
      }

      const result = response.result;
      if (result.responseType !== 'online') {
        return;
      }

      const profile = result.profile;
      const user: UserProfile = {
        name: profile.name ?? 'Player',
        email: profile.email ?? null,
        imageUrl: profile.imageUrl ?? null
      };

      this.setUser(user);
    } catch {
      // ignore login errors
    }
  }

  async signOut(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.clearUser();
      return;
    }

    try {
      await SocialLogin.logout({ provider: 'google' });
    } catch {
      // ignore logout errors
    } finally {
      this.clearUser();
    }
  }

  private setUser(user: UserProfile): void {
    this.userSubject.next(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private clearUser(): void {
    this.userSubject.next(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  private loadCachedUser(): void {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as UserProfile;
      if (!parsed || !parsed.name) {
        return;
      }
      this.userSubject.next(parsed);
    } catch {
      // ignore cache errors
    }
  }
}
