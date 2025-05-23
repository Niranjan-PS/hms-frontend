import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';
import { DoctorService } from '../services/doctor.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    if (user.role === 'admin') {
      return true;
    }
    if (user.role === 'doctor') {
      try {
        const doctor = await this.doctorService.getDoctor(route.params['id']).toPromise();
        if (doctor && doctor.user === user._id) {
          return true;
        }
      } catch (err) {
        console.error('Doctor fetch error:', err);
      }
    }
    this.router.navigate(['/']);
    return false;
  }
}