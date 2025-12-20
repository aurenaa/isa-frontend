import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { NgForm } from '@angular/forms';

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
    firstname: '',
    lastname: '',
    address: ''
  };
  
  confirmPassword = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(registerForm: NgForm): void {
    this.submitted = true;

    if (registerForm.invalid || this.userData.password !== this.confirmPassword) {
      return;
    }

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (error) => {
      }
    });
  }
}