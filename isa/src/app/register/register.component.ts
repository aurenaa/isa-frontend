import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    address: ''
  };
  
  confirmPassword = '';
  message = '';
  messageClass = '';
  loading = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.submitted = true;
    if (this.userData.password !== this.confirmPassword) {
      this.message = 'Passwords do not match!';
      this.messageClass = 'error';
      return;
    }

    this.loading = true;
    this.message = '';
    this.messageClass = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.message = 'Registration successful! Redirecting to login...';
        this.messageClass = 'success';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.message = error.error || 'Registration failed. Please try again.';
        this.messageClass = 'error';
        this.loading = false;
      }
    });
  }
}