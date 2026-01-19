import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './formatting';

/**
 * Export data to Excel file using ExcelJS
 * @param data - Array of objects to export
 * @param fileName - Name of the file (without extension)
 */
export const exportToExcel = async <T extends object>(
  data: T[],
  fileName: string
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  if (data.length > 0) {
    // Get column headers from first object
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map((header) => ({
      header: header,
      key: header,
      width: 15,
    }));

    // Add rows
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
  }

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Export to PDF
export const exportToPDF = <T extends object>(
  data: T[],
  headers: string[],
  fileName: string,
  title: string = 'Report'
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Date
  const date = formatDate(new Date());
  doc.text(`Generated on: ${date}`, 14, 30);

  // Prepare table data
  const tableData = data.map((row) => Object.values(row));

  autoTable(doc, {
    head: [headers],
    body: tableData as any[][],
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  doc.save(`${fileName}.pdf`);
};

/**
 * Import data from Excel file using ExcelJS
 * @param file - Excel file to import
 * @returns Promise resolving to array of row objects
 */
export const importFromExcel = (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Get first worksheet
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
          reject(new Error('No worksheet found in Excel file'));
          return;
        }

        const jsonData: Record<string, unknown>[] = [];
        const headers: string[] = [];

        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
        });

        // Process data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            return;
          } // Skip header row

          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            rowData[header] = cell.value;
          });

          jsonData.push(rowData);
        });

        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
