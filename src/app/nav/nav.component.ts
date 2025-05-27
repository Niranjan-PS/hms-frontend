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
      
      this.authService.logout().subscribe({
        next: () => {
         
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.handleLocalLogout();
        },
        complete: () => {
          console.log('Logout process completed');
        }
      });
    } catch (error) {
      this.handleLocalLogout();
    }
  }

  handleLocalLogout(): void {
    this.authService.logoutLocally();
  
    this.router.navigate(['/login']);
  }
}
