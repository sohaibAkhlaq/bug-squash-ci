import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase, TestCaseResponse, MetricsResponse, ExecutionRecord } from '../models/test-case.model';

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private apiUrl = `${environment.apiUrl}/testcases`;

  constructor(private http: HttpClient) {}

  getTestCases(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
  }): Observable<TestCaseResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<TestCaseResponse>(this.apiUrl, { params: httpParams });
  }

  getTestCase(id: string): Observable<TestCaseResponse> {
    return this.http.get<TestCaseResponse>(`${this.apiUrl}/${id}`);
  }

  createTestCase(testCase: Partial<TestCase>): Observable<TestCaseResponse> {
    return this.http.post<TestCaseResponse>(this.apiUrl, testCase);
  }

  updateTestCase(id: string, testCase: Partial<TestCase>): Observable<TestCaseResponse> {
    return this.http.put<TestCaseResponse>(`${this.apiUrl}/${id}`, testCase);
  }

  deleteTestCase(id: string): Observable<TestCaseResponse> {
    return this.http.delete<TestCaseResponse>(`${this.apiUrl}/${id}`);
  }

  addExecution(id: string, execution: Partial<ExecutionRecord>): Observable<TestCaseResponse> {
    return this.http.post<TestCaseResponse>(`${this.apiUrl}/${id}/execute`, execution);
  }

  getMetrics(): Observable<MetricsResponse> {
    return this.http.get<MetricsResponse>(`${this.apiUrl}/metrics/summary`);
  }
}
