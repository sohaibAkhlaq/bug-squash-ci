import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isUpdating = false;
  isChangingPassword = false;
  successMessage = '';
  errorMessage = '';
  activeTab: 'profile' | 'password' = 'profile';

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      title: [''],
      department: ['Other']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        title: this.user.title || '',
        department: this.user.department || 'Other'
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isUpdating = true;
    this.clearMessages();

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.isUpdating = false;
        // Update local storage
        const updated = { ...this.user, ...this.profileForm.value };
        localStorage.setItem('user', JSON.stringify(updated));
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isUpdating = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isChangingPassword = true;
    this.clearMessages();

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully!';
        this.isChangingPassword = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isChangingPassword = false;
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
