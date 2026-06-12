import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Clase de Validadores Personalizados
 * 
 * Contiene validadores reutilizables para formularios reactivos de Angular.
 * Estos validadores trabajan con AbstractControl y retornan ValidationErrors
 * cuando la validación falla, o null cuando es exitosa.
 * 
 * Uso en formularios:
 * this.myForm = this.formBuilder.group({
 *   nombre: ['', [Validators.required, CustomValidators.onlyLetters()]],
 *   email: ['', [Validators.required, CustomValidators.emailFormat()]]
 * });
 */
export class CustomValidators {
  
  /**
   * Validador que rechaza campos con números
   * 
   * Útil para campos que no deben contener dígitos (nombres, apellidos, etc.)
   * 
   * @returns ValidatorFn que retorna { hasNumbers: true } si contiene números
   */
  static noNumbers(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; // Campo vacío se maneja con Validators.required
      
      const hasNumber = /\d/.test(control.value); // Regex para detectar dígitos
      return hasNumber ? { hasNumbers: true } : null;
    };
  }

  /**
   * Validador que solo permite letras y espacios
   * 
   * Acepta:
   * - Letras mayúsculas y minúsculas (a-z, A-Z)
   * - Vocales acentuadas (á, é, í, ó, ú)
   * - Letra ñ y Ñ
   * - Letra ü y Ü
   * - Espacios en blanco
   * 
   * Rechaza números, símbolos y caracteres especiales.
   * 
   * @returns ValidatorFn que retorna { onlyLetters: true } si contiene caracteres inválidos
   */
  static onlyLetters(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Patrón que acepta solo letras (incluyendo español) y espacios
      const onlyLettersPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      const isValid = onlyLettersPattern.test(control.value);
      return isValid ? null : { onlyLetters: true };
    };
  }

  /**
   * Validador de formato de email
   * 
   * Verifica que el email tenga un formato válido:
   * - Parte local: letras, números, puntos, guiones y guión bajo
   * - Símbolo @
   * - Dominio: letras, números, puntos y guiones
   * - Extensión: 2-6 letras (.com, .edu, .mx, etc.)
   * 
   * Ejemplos válidos: usuario@ejemplo.com, nombre.apellido@dominio.edu.mx
   * 
   * @returns ValidatorFn que retorna { invalidEmail: true } si el formato es inválido
   */
  static emailFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Patrón regex para validar formato de email
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      const isValid = emailPattern.test(control.value);
      return isValid ? null : { invalidEmail: true };
    };
  }

  /**
   * Validador para verificar que dos contraseñas coincidan
   * 
   * Se aplica a nivel de FormGroup (no a un control individual).
   * Compara dos campos de contraseña y marca el segundo con error
   * si no coinciden.
   * 
   * Uso:
   * this.myForm = this.formBuilder.group({
   *   password: ['', Validators.required],
   *   confirmPassword: ['', Validators.required]
   * }, {
   *   validators: CustomValidators.passwordsMatch('password', 'confirmPassword')
   * });
   * 
   * @param password1 - Nombre del campo de contraseña original
   * @param password2 - Nombre del campo de confirmación de contraseña
   * @returns ValidatorFn que retorna { passwordMismatch: true } si no coinciden
   */
  static passwordsMatch(password1: string, password2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const pass1 = formGroup.get(password1);
      const pass2 = formGroup.get(password2);

      if (!pass1 || !pass2) return null; // Si los campos no existen, no validar

      if (pass1.value !== pass2.value) {
        // Las contraseñas no coinciden - agregar error
        pass2.setErrors({ ...pass2.errors, passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        // Las contraseñas coinciden - limpiar el error de passwordMismatch
        if (pass2.hasError('passwordMismatch')) {
          const errors = { ...pass2.errors };
          delete errors['passwordMismatch'];
          // Si no hay más errores, setear null; si hay, mantener los otros errores
          pass2.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
      
      return null;
    };
  }

  // Validar longitud mínima
  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = String(control.value).trim();
      return value.length >= min ? null : { minLength: { requiredLength: min, actualLength: value.length } };
    };
  }

  // Validar que no tenga solo espacios
  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const isWhitespace = String(control.value).trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }
}
