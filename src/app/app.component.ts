import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { routes } from './app.routes';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Hospital Management System';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    } else {
      this.router.navigate(['/login']);
    }

   
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      
      window.scrollTo(0, 0);
    });
  }

  private redirectBasedOnRole(): void {
    const role = this.authService.getUserRole();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'doctor') {
      this.router.navigate(['/doctor']);
    } else if (role === 'patient') {
      this.router.navigate(['/patient']);
    } else {
      
      this.authService.logoutLocally();
      this.router.navigate(['/login']);
    }
  }
}


export const appConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
  ],
};
