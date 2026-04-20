export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface ExecutionRecord {
  executedBy: string;
  executedAt: Date;
  result: 'Passed' | 'Failed' | 'Blocked' | 'Skipped';
  actualResult?: string;
  executionTime?: number;
  screenshot?: string;
  logs?: string;
}

export interface AutomationScript {
  scriptType: 'Selenium' | 'Katalon' | 'Playwright' | 'None';
  scriptPath?: string;
  parameters?: any;
}

export interface TestCase {
  _id?: string;
  testId: string;
  title: string;
  description: string;
  steps: TestStep[];
  type: 'Manual' | 'Automated' | 'Performance' | 'Security';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Active' | 'Deprecated' | 'Under Review';
  lastExecuted?: Date;
  executionHistory: ExecutionRecord[];
  automationScript: AutomationScript;
  tags: string[];
  createdBy: string;
  assignedTo?: string;
  estimatedTime?: number;
  defectCount: number;
  passRate: number;
  projectId?: string;
  suiteId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestCaseResponse {
  success: boolean;
  count?: number;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: TestCase | TestCase[];
}

export interface MetricsData {
  summary: {
    totalTests: number;
    avgPassRate: number;
    totalDefects: number;
    automatedCount: number;
    manualCount: number;
    performanceCount: number;
    securityCount: number;
  };
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  recentExecutions: Array<{
    testId: string;
    title: string;
    result: string;
    executedAt: Date;
    executedBy: string;
  }>;
  executionResults: Array<{ _id: string; count: number }>;
}

export interface MetricsResponse {
  success: boolean;
  data: MetricsData;
}
