import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCaseService } from '../../../core/services/test-case.service';
import { AuthService } from '../../../core/services/auth.service';
import { TestCase } from '../../../core/models/test-case.model';

@Component({
  selector: 'app-test-case-detail',
  templateUrl: './test-case-detail.component.html'
})
export class TestCaseDetailComponent implements OnInit {
  testCase: TestCase | null = null;
  isLoading = true;
  showExecuteModal = false;

  executeForm: { executedBy: string; result: 'Passed' | 'Failed' | 'Blocked' | 'Skipped'; actualResult: string; executionTime: number } = {
    executedBy: '',
    result: 'Passed',
    actualResult: '',
    executionTime: 0
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private testCaseService: TestCaseService,
    public authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.executeForm.executedBy = user.name;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTestCase(id);
    }
  }

  loadTestCase(id: string): void {
    this.isLoading = true;
    this.testCaseService.getTestCase(id).subscribe({
      next: (response) => {
        this.testCase = response.data as TestCase;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/test-cases']);
      }
    });
  }

  submitExecution(): void {
    if (!this.testCase?._id) return;
    this.testCaseService.addExecution(this.testCase._id, this.executeForm).subscribe({
      next: (response) => {
        this.testCase = response.data as TestCase;
        this.showExecuteModal = false;
        this.executeForm.actualResult = '';
        this.executeForm.executionTime = 0;
      }
    });
  }

  deleteTestCase(): void {
    if (!this.testCase?._id) return;
    if (confirm('Are you sure you want to delete this test case?')) {
      this.testCaseService.deleteTestCase(this.testCase._id).subscribe({
        next: () => this.router.navigate(['/test-cases'])
      });
    }
  }

  getResultColor(result: string): string {
    const c: Record<string, string> = {
      'Passed': 'badge-success', 'Failed': 'badge-danger',
      'Blocked': 'badge-warning', 'Skipped': 'badge-neutral'
    };
    return c[result] || 'badge-info';
  }

  getPriorityColor(p: string): string {
    const c: Record<string, string> = {
      'Critical': 'badge-danger', 'High': 'badge-warning',
      'Medium': 'badge-info', 'Low': 'badge-success'
    };
    return c[p] || 'badge-info';
  }

  getStatusColor(s: string): string {
    const c: Record<string, string> = {
      'Active': 'badge-success', 'Draft': 'badge-warning',
      'Deprecated': 'badge-danger', 'Under Review': 'badge-purple'
    };
    return c[s] || 'badge-info';
  }
}
