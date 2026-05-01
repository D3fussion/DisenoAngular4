import { Component, signal } from '@angular/core';
import { AppHeader } from './app-header/app-header';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { StorageService } from './storage';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-root',
  imports: [AppHeader, CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('diseno-angular-4');
  protected isLoading = signal(false);

  newAccount: FormGroup;

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly fullNamePattern = /^[a-zA-Z\s]{3,}$/;
  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private toast: HotToastService,
  ) {
    this.newAccount = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.pattern(this.fullNamePattern)]],
        email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
        password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
        passwordConfirmation: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
        agreeTerms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const passwordConfirmation = group.get('passwordConfirmation')?.value;
    if (!password || !passwordConfirmation) return null;
    return password === passwordConfirmation ? null : { mismatch: true };
  }

  onSubmit() {
    this.isLoading.set(true);

    this.storageService
      .saveData(this.newAccount.value.email, this.newAccount.value)
      .subscribe((response) => {
        if (response.success) {
          this.toast.success(response.message, {
            duration: 3000,
            position: 'bottom-right',
          });

          this.newAccount.reset();
        } else {
          this.toast.error(response.message, {
            duration: 3000,
            position: 'bottom-right',
          });
        }

        this.isLoading.set(false);
      });
  }
}
