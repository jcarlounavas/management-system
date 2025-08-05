import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
interface Transaction {
  tx_date: string;
  description_with_names: string;
  reference_no: string;
  debit: number;
  credit: number;
  type: string;
  balance: number;
  contact_name?: string;
}

const ContactTransactions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contactName, setContactName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/contacts/${id}/transactions`);
        const data = await res.json();
        setTransactions(data.transactions);

        if (data.transactions.length > 0) {
          setContactName(data.transactions[0].contact_name);

          // Default: filter all June transactions if no filters are selected
          if (!startDate && !endDate) {
            const juneStart = new Date('2025-06-01');
            const juneEnd = new Date('2025-06-30');
            setStartDate(juneStart.toISOString().split('T')[0]);
            setEndDate(juneEnd.toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    if (id) fetchTransactions();
  }, [id]);

 const filteredTransactions = transactions.filter(tx => {
  const txDate = new Date(tx.tx_date);
  txDate.setHours(0, 0, 0, 0);

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  return (!start || txDate >= start) && (!end || txDate <= end);
});

  const totalDebit = filteredTransactions.reduce((sum, tx) => sum + Number(tx.debit || 0), 0);
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + Number(tx.credit || 0), 0);
  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US');
};

const handleExportPDF = () => {
  const fileName = prompt("Enter a file name for the PDF:", `Transactions_${contactName}`);
  if (!fileName) return;

  const doc = new jsPDF();

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Transactions with ${contactName}`, 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`, 14, 22);

  const tableColumn = ['Date', 'Description', 'Reference No', 'Debit', 'Credit'];
  const tableRows = filteredTransactions.map(tx => [
    formatDate(tx.tx_date),
    tx.description_with_names,
    tx.reference_no,
    Number(tx.debit || 0).toFixed(2),
    Number(tx.credit || 0).toFixed(2),
  ]);

  tableRows.push([
    'TOTAL', '', '',
    totalDebit.toFixed(2),
    totalCredit.toFixed(2),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 58, 64],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: 6,
      cellPadding: 4,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
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
  const fileName = prompt("Enter a file name for the Excel file:", `Transactions_${contactName}`);
  if (!fileName) return;

  const data = filteredTransactions.map(tx => ({
    Date: formatDate(tx.tx_date),
    Description: tx.description_with_names,
    'Reference No': tx.reference_no,
    Debit: Number(tx.debit || 0),
    Credit: Number(tx.credit || 0),
  }));

  data.push({
    Date: 'TOTAL',
    Description: '',
    'Reference No': '',
    Debit: totalDebit,
    Credit: totalCredit,
  });

  const worksheet = XLSX.utils.json_to_sheet([]);
  
  // Add title and date range
  XLSX.utils.sheet_add_aoa(worksheet, [
    [`Transactions with ${contactName}`],
    [`Date range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`],
    [],
  ], { origin: "A1" });

  // Add data after title
  XLSX.utils.sheet_add_json(worksheet, data, { origin: -1, skipHeader: false });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};



  return (
    <div className="container mt-4">
      <h2 className="mb-3">Transactions with {contactName}</h2>
    <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap gap-2">
      <div className="d-flex gap-2 mb-3">
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="form-control"
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="form-control"
          />
        </div>
        </div>
        <div className="mb-3 text-end">
                          <button className="btn btn-outline-primary me-4" onClick={handleExportPDF}>
                            <PictureAsPdfIcon style={{ fontSize: '1.2rem' }} />
                            Export to PDF
                            </button>
                          <button className="btn btn-outline-success" onClick={handleExportExcel}>
                            <FileDownloadIcon style={{ fontSize: '1.2rem' }} />
                            Export to Excel
                            </button>
                        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th className="text-center">Date</th>
              <th className="text-center">Description</th>
              <th className="text-center">Reference No</th>
              <th className="text-center">Debit</th>
              <th className="text-center">Credit</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, idx) => (
              <tr key={idx}>
                <td className="text-center">
                  {new Date(tx.tx_date).toLocaleDateString('en-US')}
                </td>
                <td className="text-center">{tx.description_with_names}</td>
                <td className="text-center">{tx.reference_no}</td>
                <td className="text-end">
                  {tx.debit > 0 ? currency.format(tx.debit) : '-'}
                </td>
                <td className="text-end">
                  {tx.credit > 0 ? currency.format(tx.credit) : '-'}
                </td>
              </tr>
            ))}
            <tr className="table-footer">
              <td colSpan={3}>Total</td>
              <td className="text-end">{currency.format(totalDebit)}</td>
              <td className="text-end">{currency.format(totalCredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactTransactions;
