import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {

  username = '';
  password = '';
  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    this.error = '';

    const email = this.username.trim().toLowerCase();

    this.authService.login(email, this.password).subscribe({
      next: (response) => {
        if (response?.user?.rol === 'admin') {
          this.router.navigate(['/admin']);
          return;
        }

        this.error = 'Tu cuenta no tiene permisos de administrador.';
      },
      error: () => {
        this.error = 'Credenciales incorrectas';
      }
    });
  }
}
