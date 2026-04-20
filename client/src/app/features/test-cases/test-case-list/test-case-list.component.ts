import { Component, OnInit } from '@angular/core';
import { TestCaseService } from '../../../core/services/test-case.service';
import { AuthService } from '../../../core/services/auth.service';
import { TestCase } from '../../../core/models/test-case.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-case-list',
  templateUrl: './test-case-list.component.html'
})
export class TestCaseListComponent implements OnInit {
  testCases: TestCase[] = [];
  isLoading = true;
  pagination: any = {};

  filters = { status: '', priority: '', type: '', search: '' };
  currentPage = 1;
  limit = 10;

  constructor(
    private testCaseService: TestCaseService,
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadTestCases();
  }

  loadTestCases(): void {
    this.isLoading = true;
    this.testCaseService.getTestCases({
      page: this.currentPage,
      limit: this.limit,
      ...this.filters
    }).subscribe({
      next: (response) => {
        this.testCases = response.data as TestCase[];
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTestCases();
  }

  clearFilters(): void {
    this.filters = { status: '', priority: '', type: '', search: '' };
    this.applyFilters();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadTestCases();
  }

  deleteTestCase(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this test case?')) {
      this.testCaseService.deleteTestCase(id).subscribe({
        next: () => this.loadTestCases()
      });
    }
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'Critical': 'badge-danger', 'High': 'badge-warning',
      'Medium': 'badge-info', 'Low': 'badge-success'
    };
    return colors[priority] || 'badge-info';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Active': 'badge-success', 'Draft': 'badge-warning',
      'Deprecated': 'badge-danger', 'Under Review': 'badge-purple'
    };
    return colors[status] || 'badge-info';
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Manual': '🖱️', 'Automated': '🤖', 'Performance': '⚡', 'Security': '🔒'
    };
    return icons[type] || '📋';
  }

  getPages(): number[] {
    if (!this.pagination?.totalPages) return [];
    const pages: number[] = [];
    const total = this.pagination.totalPages;
    const current = this.currentPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) { pages.push(i); }
    return pages;
  }
}
