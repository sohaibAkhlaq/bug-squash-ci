import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  currentUser: User | null = null;
  sidebarOpen = true;
  currentRoute = '';
  showMobileMenu = false;

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/test-cases', label: 'Test Cases', icon: '🧪' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  constructor(public authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.showMobileMenu = false;
    });
  }

  isActive(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout(): void {
    this.authService.logout();
  }
}
