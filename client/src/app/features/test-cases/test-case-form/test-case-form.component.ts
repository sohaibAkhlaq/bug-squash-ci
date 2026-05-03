import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCaseService } from '../../../core/services/test-case.service';
import { AuthService } from '../../../core/services/auth.service';
import { TestCase } from '../../../core/models/test-case.model';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-test-case-form',
  templateUrl: './test-case-form.component.html'
})
export class TestCaseFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  isGeneratingAi = false;
  errorMessage = '';
  testCaseId: string | null = null;

  types = ['Manual', 'Automated', 'Performance', 'Security'];
  priorities = ['Critical', 'High', 'Medium', 'Low'];
  statuses = ['Draft', 'Active', 'Deprecated', 'Under Review'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private testCaseService: TestCaseService,
    private authService: AuthService,
    private aiService: AiService
  ) {
    const user = this.authService.getCurrentUser();
    this.form = this.fb.group({
      testId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      type: ['Manual'],
      priority: ['Medium'],
      status: ['Draft'],
      createdBy: [user?.name || '', [Validators.required]],
      assignedTo: [''],
      estimatedTime: [null],
      defectCount: [0],
      tags: [''],
      steps: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.testCaseId = this.route.snapshot.paramMap.get('id');
    if (this.testCaseId) {
      this.isEditing = true;
      this.loadTestCase(this.testCaseId);
    } else {
      this.addStep();
    }
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.fb.group({
      stepNumber: [this.steps.length + 1],
      action: ['', Validators.required],
      expectedResult: ['', Validators.required]
    }));
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
    this.steps.controls.forEach((ctrl, i) => {
      ctrl.get('stepNumber')?.setValue(i + 1);
    });
  }

  loadTestCase(id: string): void {
    this.isLoading = true;
    this.testCaseService.getTestCase(id).subscribe({
      next: (response) => {
        const tc = response.data as TestCase;
        this.form.patchValue({
          testId: tc.testId,
          title: tc.title,
          description: tc.description,
          type: tc.type,
          priority: tc.priority,
          status: tc.status,
          createdBy: tc.createdBy,
          assignedTo: tc.assignedTo || '',
          estimatedTime: tc.estimatedTime,
          defectCount: tc.defectCount,
          tags: tc.tags?.join(', ') || ''
        });

        // Clear existing steps and add from data
        while (this.steps.length) { this.steps.removeAt(0); }
        if (tc.steps && tc.steps.length > 0) {
          tc.steps.forEach(step => {
            this.steps.push(this.fb.group({
              stepNumber: [step.stepNumber],
              action: [step.action, Validators.required],
              expectedResult: [step.expectedResult, Validators.required]
            }));
          });
        } else {
          this.addStep();
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/test-cases']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.errorMessage = '';

    const formValue = this.form.value;
    const payload = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : []
    };

    const request = this.isEditing
      ? this.testCaseService.updateTestCase(this.testCaseId!, payload)
      : this.testCaseService.createTestCase(payload);

    request.subscribe({
      next: (response) => {
        const tc = response.data as TestCase;
        this.router.navigate(['/test-cases', tc._id]);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isSaving = false;
      }
    });
  }

  generateWithAi(): void {
    const title = this.form.get('title')?.value;
    if (!title) {
      this.errorMessage = 'Please enter a brief title or description first to help the AI generate details.';
      return;
    }

    this.isGeneratingAi = true;
    this.errorMessage = '';

    this.aiService.generateTestCase(title).subscribe({
      next: (response) => {
        const aiTc = response.data;
        this.form.patchValue({
          title: aiTc.title,
          description: aiTc.description,
          priority: aiTc.priority,
          type: aiTc.type
        });

        // Clear and replace steps
        while (this.steps.length) { this.steps.removeAt(0); }
        aiTc.steps.forEach((step: any) => {
          this.steps.push(this.fb.group({
            stepNumber: [step.stepNumber],
            action: [step.action, Validators.required],
            expectedResult: [step.expectedResult, Validators.required]
          }));
        });

        this.isGeneratingAi = false;
      },
      error: (err) => {
        this.errorMessage = 'AI generation failed. Please try again or fill manually.';
        this.isGeneratingAi = false;
      }
    });
  }
}
