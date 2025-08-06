import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import jsPDF from 'jspdf';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
interface DescriptionSummary {
  description: string;
  count: number;
  totalDebit: number;
  totalCredit: number;
}

interface GroupedSummary {
  summary_id: number;
  created_at: string;
  file_name: string;
  descriptionSummaries: DescriptionSummary[];
  totalDebit: number;
  totalCredit: number;
  totalTransactions: number;
}

type ExcelRow = {
  '#': number | null;
  Description: string;
  'Transaction Count': number;
  'Total Debit': number;
  'Total Credit': number;
};

const ViewPage: React.FC = () => {
  const { id } = useParams(); // from route like /summary/:id
  const [summary, setSummary] = useState<GroupedSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/summary/${id}/details`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched single summary:', data);
        setSummary(data);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportPDF = () => {
  if (!summary) return;

  const fileName = prompt("Enter a file name for the PDF:", `Summary_${summary.summary_id}`);
  if (!fileName) return;

  const doc = new jsPDF();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Summary ID: ${summary.summary_id}`, 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Created At: ${new Date(summary.created_at).toLocaleString()}`, 14, 22);
  doc.text(`File Name: ${summary.file_name}`, 14, 29);

  const tableColumn = ['#', 'Description', 'Transaction Count', 'Total Debit', 'Total Credit'];
  const tableRows = summary.descriptionSummaries.map((item, index) => [
  index + 1,
  item.description,
  item.count,
  Number(item.totalDebit).toFixed(2),
  Number(item.totalCredit).toFixed(2),
]);

 tableRows.push([
  '',
  'TOTAL',
  summary.totalTransactions,
  Number(summary.totalDebit).toFixed(2),
  Number(summary.totalCredit).toFixed(2),
]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 36,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 58, 64],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    didDrawCell: (data) => {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [233, 236, 239];
      }
    },
  });

  doc.save(`${fileName}.pdf`);
};

  
  
  
  
 const handleExportExcel = () => {
  if (!summary) return;

  const fileName = prompt("Enter a file name for the Excel file:", `Summary_${summary.summary_id}`);
  if (!fileName) return;

  const data: ExcelRow[] = summary.descriptionSummaries.map((item, index) => ({
    '#': index + 1,
    Description: item.description,
    'Transaction Count': item.count,
    'Total Debit': item.totalDebit,
    'Total Credit': item.totalCredit,
  }));

  data.push({
    '#': null,
    Description: 'TOTAL',
    'Transaction Count': summary.totalTransactions,
    'Total Debit': summary.totalDebit,
    'Total Credit': summary.totalCredit,
  });

  const worksheet = XLSX.utils.json_to_sheet([]);
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [`Summary ID: ${summary.summary_id}`],
    [`Created At: ${new Date(summary.created_at).toLocaleString()}`],
    [`File Name: ${summary.file_name}`],
    [],
  ], { origin: "A1" });

  XLSX.utils.sheet_add_json(worksheet, data, { origin: -1, skipHeader: false });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

  

  return (
    
      <div className="pc-container">
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="card-header">
                <h3 className="text-center fs-2">Summary View</h3>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !summary ? (
            <div className="alert alert-danger text-center">Summary not found.</div>
          ) : (
            
            <div className="w-100 d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
            <div className="mb-3">
              <h3 className="mb-3">
                Summary ID: {summary.summary_id} —{' '}
                {new Date(summary.created_at).toLocaleString()}
                <span className="text-muted"> || File: {summary.file_name}</span>
              </h3>
              </div>
              <div className="d-flex gap-2">
                        <button className="btn btn-primary me-4" onClick={handleExportPDF}>
                          <PictureAsPdfIcon style={{ fontSize: '1.2rem' }} className="me-1" />
                              Export to PDF
                        </button>
                        <button className="btn btn-success" onClick={handleExportExcel}>
                          <FileDownloadIcon style={{ fontSize: '1.2rem' }} className="me-1" />
                          Export to Excel
                        </button>
                      </div>
                      
              <table className="table table-bordered table-striped">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Number of Transactions</th>
                    <th>Total Debit</th>
                    <th>Total Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.descriptionSummaries.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.description}</td>
                      <td>{item.count}</td>
                      <td className="text-end">{item.totalDebit.toLocaleString()}</td>
                      <td className="text-end">{item.totalCredit.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="table-footer">
                    <td colSpan={2}>Total</td>
                    <td>{summary.totalTransactions}</td>
                    <td className="text-end">{summary.totalDebit.toLocaleString()}</td>
                    <td className="text-end">{summary.totalCredit.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    
  );
};

export default ViewPage;
