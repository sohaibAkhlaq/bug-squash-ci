import { Component, OnInit } from '@angular/core';
import { TestCaseService } from '../../core/services/test-case.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  metrics: any = null;
  isLoading = true;
  currentUser: User | null = null;

  constructor(
    private testCaseService: TestCaseService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.testCaseService.getMetrics().subscribe({
      next: (response: any) => {
        this.metrics = response.data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getStatusBarWidth(count: number): number {
    if (!this.metrics?.summary?.totalTests) return 0;
    return (count / this.metrics.summary.totalTests) * 100;
  }

  getPriorityColor(priority: string): string {
    const map: Record<string, string> = {
      'Critical': 'bg-red-500', 'High': 'bg-amber-500', 'Medium': 'bg-blue-500', 'Low': 'bg-emerald-500'
    };
    return map[priority] || 'bg-slate-400';
  }

  getResultColor(result: string): string {
    const map: Record<string, string> = {
      'Passed': 'badge-success', 'Failed': 'badge-danger', 'Blocked': 'badge-warning', 'Skipped': 'badge-neutral'
    };
    return map[result] || 'badge-neutral';
  }
}
