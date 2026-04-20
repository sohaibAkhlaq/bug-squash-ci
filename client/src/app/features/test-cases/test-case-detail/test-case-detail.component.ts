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
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTestCase(id);
    this.authService.currentUser$.subscribe(user => {
      if (user) this.executeForm.executedBy = user.name;
    });
  }

  loadTestCase(id: string): void {
    this.isLoading = true;
    this.testCaseService.getTestCase(id).subscribe({
      next: (response: any) => { this.testCase = response.data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.router.navigate(['/test-cases']); }
    });
  }

  submitExecution(): void {
    if (!this.testCase?._id) return;
    this.testCaseService.addExecution(this.testCase._id, this.executeForm).subscribe({
      next: (response: any) => {
        this.testCase = response.data;
        this.showExecuteModal = false;
        this.executeForm = { executedBy: this.executeForm.executedBy, result: 'Passed', actualResult: '', executionTime: 0 };
      }
    });
  }

  deleteTestCase(): void {
    if (!this.testCase?._id || !confirm('Delete this test case?')) return;
    this.testCaseService.deleteTestCase(this.testCase._id).subscribe({
      next: () => this.router.navigate(['/test-cases'])
    });
  }

  getPriorityColor(p: string): string {
    return { 'Critical': 'badge-danger', 'High': 'badge-warning', 'Medium': 'badge-info', 'Low': 'badge-success' }[p] || 'badge-neutral';
  }
  getStatusColor(s: string): string {
    return { 'Active': 'badge-success', 'Draft': 'badge-neutral', 'Deprecated': 'badge-danger', 'Under Review': 'badge-purple' }[s] || 'badge-neutral';
  }
  getResultColor(r: string): string {
    return { 'Passed': 'badge-success', 'Failed': 'badge-danger', 'Blocked': 'badge-warning', 'Skipped': 'badge-neutral' }[r] || 'badge-neutral';
  }
}
