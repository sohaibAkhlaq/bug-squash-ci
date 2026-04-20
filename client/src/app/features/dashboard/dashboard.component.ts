import { Component, OnInit } from '@angular/core';
import { TestCaseService } from '../../core/services/test-case.service';
import { AuthService } from '../../core/services/auth.service';
import { MetricsData } from '../../core/models/test-case.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  metrics: MetricsData | null = null;
  isLoading = true;

  constructor(
    private testCaseService: TestCaseService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.testCaseService.getMetrics().subscribe({
      next: (response) => {
        this.metrics = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getResultColor(result: string): string {
    const colors: Record<string, string> = {
      'Passed': 'badge-success',
      'Failed': 'badge-danger',
      'Blocked': 'badge-warning',
      'Skipped': 'badge-neutral'
    };
    return colors[result] || 'badge-info';
  }

  getResultDot(result: string): string {
    const colors: Record<string, string> = {
      'Passed': 'bg-emerald-500',
      'Failed': 'bg-red-500',
      'Blocked': 'bg-amber-500',
      'Skipped': 'bg-dark-400'
    };
    return colors[result] || 'bg-blue-500';
  }

  getStatusBarWidth(count: number): number {
    if (!this.metrics) return 0;
    const total = this.metrics.summary.totalTests;
    return total > 0 ? (count / total) * 100 : 0;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Active': 'bg-emerald-500',
      'Draft': 'bg-amber-500',
      'Deprecated': 'bg-red-500',
      'Under Review': 'bg-blue-500'
    };
    return colors[status] || 'bg-dark-400';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'Critical': 'bg-red-500',
      'High': 'bg-amber-500',
      'Medium': 'bg-blue-500',
      'Low': 'bg-emerald-500'
    };
    return colors[priority] || 'bg-dark-400';
  }
}
