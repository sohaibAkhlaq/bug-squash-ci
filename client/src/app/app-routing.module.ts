import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard, RoleGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TestCaseListComponent } from './features/test-cases/test-case-list/test-case-list.component';
import { TestCaseDetailComponent } from './features/test-cases/test-case-detail/test-case-detail.component';
import { TestCaseFormComponent } from './features/test-cases/test-case-form/test-case-form.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LayoutComponent } from './shared/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'test-cases', component: TestCaseListComponent },
      { path: 'test-cases/new', component: TestCaseFormComponent, canActivate: [RoleGuard], data: { roles: ['admin', 'qa_engineer'] } },
      { path: 'test-cases/:id', component: TestCaseDetailComponent },
      { path: 'test-cases/:id/edit', component: TestCaseFormComponent, canActivate: [RoleGuard], data: { roles: ['admin', 'qa_engineer'] } },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
