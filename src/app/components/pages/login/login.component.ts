import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { CustomValidators } from '../../../validators/custom-validators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [NavbarComponent, FooterComponent, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {
  
  showPass = false;
  form!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  returnUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Si ya está logueado, redirigir según rol
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }

    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        CustomValidators.emailFormat(),
        CustomValidators.noWhitespace()
      ]],
      password: ['', [
        Validators.required,
        CustomValidators.noWhitespace()
      ]]
    });

    // Obtener URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['whitespace']) return 'No puede estar vacío o solo espacios';
    if (errors['invalidEmail']) return 'Formato de correo inválido (ejemplo@correo.com)';

    return '';
  }

  redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate([this.returnUrl || '/home']);
    }
  }

  submit() {
    // Marcar todos los campos como touched
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginData = {
      email: this.form.value.email.trim().toLowerCase(),
      password: this.form.value.password
    };

    this.authService.login(loginData.email, loginData.password).subscribe({
      next: (response) => {
        this.loading = false;
        const user = response.user;
        
        console.log('[LOGIN COMPONENT] ✅ Login exitoso para:', user.email);
        
        // Verificar que el token se guardó correctamente
        const tokenGuardado = localStorage.getItem('token');
        if (!tokenGuardado) {
          console.error('[LOGIN COMPONENT] ❌ ERROR CRÍTICO: El token NO se guardó en localStorage');
          console.error('[LOGIN COMPONENT] localStorage.token =', localStorage.getItem('token'));
          console.error('[LOGIN COMPONENT] localStorage.user =', localStorage.getItem('user'));
          this.errorMessage = 'Error crítico: No se pudo guardar la sesión. Por favor intenta nuevamente.';
          return;
        }
        
        console.log('[LOGIN COMPONENT] ✅ Token verificado en localStorage');
        console.log('[LOGIN COMPONENT] Token (primeros 50 chars):', tokenGuardado.substring(0, 50) + '...');
        
        if (user.rol === 'admin') {
          console.log('[LOGIN COMPONENT] Redirigiendo a /admin (rol:', user.rol + ')');
          this.successMessage = '¡Bienvenido Administrador! Redirigiendo al panel...';
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1500);
        } else {
          console.log('[LOGIN COMPONENT] Redirigiendo a /home (rol:', user.rol + ')');
          this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
          setTimeout(() => {
            this.router.navigate([this.returnUrl || '/home']);
          }, 1500);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Credenciales incorrectas. Intenta nuevamente.';
        console.error('[LOGIN COMPONENT] Error de login:', error);
      }
    });
  }
}
