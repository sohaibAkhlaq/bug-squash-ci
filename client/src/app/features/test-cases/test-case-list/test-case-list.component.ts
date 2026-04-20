import { Component, OnInit } from '@angular/core';
import { TestCaseService } from '../../../core/services/test-case.service';
import { AuthService } from '../../../core/services/auth.service';
import { TestCase } from '../../../core/models/test-case.model';

@Component({
  selector: 'app-test-case-list',
  templateUrl: './test-case-list.component.html'
})
export class TestCaseListComponent implements OnInit {
  testCases: TestCase[] = [];
  isLoading = true;
  currentPage = 1;
  pagination: any = null;
  filters = { search: '', status: '', priority: '', type: '' };

  constructor(
    private testCaseService: TestCaseService,
    public authService: AuthService
  ) {}

  ngOnInit(): void { this.loadTestCases(); }

  loadTestCases(): void {
    this.isLoading = true;
    const params: any = { page: this.currentPage, limit: 10 };
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.priority) params.priority = this.filters.priority;
    if (this.filters.type) params.type = this.filters.type;

    this.testCaseService.getTestCases(params).subscribe({
      next: (response: any) => {
        this.testCases = response.data;
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilters(): void { this.currentPage = 1; this.loadTestCases(); }
  clearFilters(): void { this.filters = { search: '', status: '', priority: '', type: '' }; this.applyFilters(); }
  changePage(page: number): void { this.currentPage = page; this.loadTestCases(); }

  getPages(): number[] {
    if (!this.pagination) return [];
    const pages = [];
    for (let i = 1; i <= this.pagination.totalPages; i++) pages.push(i);
    return pages;
  }

  deleteTestCase(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this test case?')) {
      this.testCaseService.deleteTestCase(id).subscribe({ next: () => this.loadTestCases() });
    }
  }

  getPriorityColor(priority: string): string {
    const map: Record<string, string> = {
      'Critical': 'badge-danger', 'High': 'badge-warning', 'Medium': 'badge-info', 'Low': 'badge-success'
    };
    return map[priority] || 'badge-neutral';
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge-success', 'Draft': 'badge-neutral', 'Deprecated': 'badge-danger', 'Under Review': 'badge-purple'
    };
    return map[status] || 'badge-neutral';
  }
}
