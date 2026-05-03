import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestCase } from '../models/test-case.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  exportTestCasesToPDF(testCases: any[], title: string = 'Test Case Report'): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Primary-600
    doc.text('BugSquash CI', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(title, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 45, 196, 45);

    const tableData = testCases.map(tc => [
      tc.testId,
      tc.title,
      tc.priority,
      tc.status,
      tc.type,
      `${tc.passRate}%`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['ID', 'Title', 'Priority', 'Status', 'Type', 'Pass Rate']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' }
      }
    });

    doc.save(`bugsquash-report-${new Date().getTime()}.pdf`);
  }
}
