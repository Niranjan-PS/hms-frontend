import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    try {
      // First try the regular logout that calls the backend
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logout successful');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout error:', err);
          // If the backend logout fails, use the local logout
          this.handleLocalLogout();
        },
        complete: () => {
          console.log('Logout process completed');
        }
      });
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // If any unexpected error occurs, fall back to local logout
      this.handleLocalLogout();
    }
  }

  // Handle local logout and navigation
  // This is public because it's called from the template
  handleLocalLogout(): void {
    this.authService.logoutLocally();
    console.log('Local logout performed');
    this.router.navigate(['/login']);
  }
}
