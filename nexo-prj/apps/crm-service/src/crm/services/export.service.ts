import { Injectable } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class ExportService {
  private readonly exportDir = '/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/tmp/exports';

  constructor() {
    // Ensure export directory exists
    if (!existsSync(this.exportDir)) {
      mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Export data to CSV format
   */
  async exportToCSV(data: any[], headers: { id: string; title: string }[], filename: string): Promise<string> {
    const filepath = join(this.exportDir, `${filename}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: headers,
    });
User: follow this prompt.dockerfile
    await csvWriter.writeRecords(data);
    return filepath;
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(data: any[], columns: { header: string; key: string; width?: number }[], filename: string, sheetName: string = 'Sheet1'): Promise<string> {
    const filepath = join(this.exportDir, `${filename}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add columns
    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    worksheet.addRows(data);

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };

    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  /**
   * Format clients data for export
   */
  formatClientsForExport(clients: any[]) {
    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      status: client.status,
      created_at: client.created_at,
      updated_at: client.updated_at,
    }));
  }

  /**
   * Format employees data for export
   */
  formatEmployeesForExport(employees: any[]) {
    return employees.map((emp) => ({
      id: emp.id,
      name: emp.name || emp.full_name,
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
      department: emp.department || '',
      salary: emp.salary || '',
      hire_date: emp.hire_date || '',
      status: emp.status,
      created_at: emp.created_at,
      updated_at: emp.updated_at,
    }));
  }

  /**
   * Format suppliers data for export
   */
  formatSuppliersForExport(suppliers: any[]) {
    return suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      category: supplier.category || '',
      payment_terms: supplier.payment_terms || '',
      status: supplier.status,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at,
    }));
  }

  /**
   * Format professionals data for export
   */
  formatProfessionalsForExport(professionals: any[]) {
    return professionals.map((prof) => ({
      id: prof.id,
      name: prof.name,
      full_name: prof.full_name || prof.name,
      email: prof.email || '',
      phone: prof.phone || '',
      specialty: prof.specialty || '',
      hourly_rate: prof.hourly_rate || '',
      status: prof.status,
      created_at: prof.created_at,
      updated_at: prof.updated_at,
    }));
  }

  /**
   * Format projects data for export
   */
  formatProjectsForExport(projects: any[]) {
    return projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      description: proj.description || '',
      client_id: proj.client_id || '',
      status: proj.status,
      budget: proj.budget || '',
      start_date: proj.start_date || '',
      end_date: proj.end_date || proj.deadline || '',
      progress: proj.progress || proj.completion_percentage || 0,
      created_at: proj.created_at,
      updated_at: proj.updated_at,
    }));
  }

  /**
   * Format tasks data for export
   */
  formatTasksForExport(tasks: any[]) {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      project_id: task.project_id || '',
      assigned_to: task.assigned_to || '',
      status: task.status,
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      completed_at: task.completed_at || '',
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));
  }

  /**
   * Get CSV headers for clients
   */
  getClientsCSVHeaders() {
    return [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'company', title: 'Company' },
      { id: 'address', title: 'Address' },
      { id: 'status', title: 'Status' },
      { id: 'created_at', title: 'Created At' },
      { id: 'updated_at', title: 'Updated At' },
    ];
  }

  /**
   * Get Excel columns for clients
   */
  getClientsExcelColumns() {
    return [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'Updated At', key: 'updated_at', width: 20 },
    ];
  }

  // Similar methods for other entities...
  getEmployeesCSVHeaders() {
    return [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'position', title: 'Position' },
      { id: 'department', title: 'Department' },
      { id: 'salary', title: 'Salary' },
      { id: 'hire_date', title: 'Hire Date' },
      { id: 'status', title: 'Status' },
      { id: 'created_at', title: 'Created At' },
      { id: 'updated_at', title: 'Updated At' },
    ];
  }

  getEmployeesExcelColumns() {
    return [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Salary', key: 'salary', width: 15 },
      { header: 'Hire Date', key: 'hire_date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'Updated At', key: 'updated_at', width: 20 },
    ];
  }
}
