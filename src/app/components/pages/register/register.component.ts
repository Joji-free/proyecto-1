import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { CustomValidators } from '../../../validators/custom-validators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  showPass = false;
  showPass2 = false;
  form!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    this.form = this.fb.group({
      nombre: ['', [
        Validators.required,
        CustomValidators.minLength(3),
        CustomValidators.onlyLetters(),
        CustomValidators.noWhitespace()
      ]],
      email: ['', [
        Validators.required,
        CustomValidators.emailFormat(),
        CustomValidators.noWhitespace()
      ]],
      password: ['', [
        Validators.required,
        CustomValidators.minLength(6),
        CustomValidators.noWhitespace()
      ]],
      password2: ['', [
        Validators.required,
        CustomValidators.noWhitespace()
      ]]
    }, {
      validators: CustomValidators.passwordsMatch('password', 'password2')
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minLength']) return `Mínimo ${errors['minLength'].requiredLength} caracteres`;
    if (errors['onlyLetters']) return 'Solo se permiten letras, no números ni símbolos';
    if (errors['hasNumbers']) return 'No se permiten números';
    if (errors['whitespace']) return 'No puede estar vacío o solo espacios';
    if (errors['invalidEmail']) return 'Formato de correo inválido (ejemplo@correo.com)';
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';

    return '';
  }

  submit() {
    // Marcar todos los campos como touched para mostrar errores
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

    const userData = {
      nombre: this.form.value.nombre.trim(),
      email: this.form.value.email.trim().toLowerCase(),
      password: this.form.value.password
    };

    this.authService.register(userData.nombre, userData.email, userData.password).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo...';
        this.form.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al registrar. Intenta nuevamente.';
        console.error('Error de registro:', error);
      }
    });
  }
}
