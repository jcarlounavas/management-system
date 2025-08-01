import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  tx_date: string;
  description: string;
  reference_no: string;
  debit: number;
  credit: number;
  type: string;
  sender: string;
  receiver: string;
}

const TransactionTable: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits
  return `${day}-${month}-${year}`; // ddmmyy
};


  useEffect(() => {
    fetch('http://localhost:3001/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((tx: any) => ({
          ...tx,
          debit: Number(tx.debit) || 0,
          credit: Number(tx.credit) || 0,
        }));
        setTransactions(parsed);
      })
      .catch((err) => console.error('Error fetching transactions:', err))
      .finally(() => setLoading(false));
      
  }, []);

  // Filtered transactions by date range
  const filteredTransactions = transactions.filter((tx) => {
    
    const txDate = new Date(tx.tx_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const matchesDate =
    (!start && !end) ||
    (start && end && txDate >= start && txDate <= end) ||
    (start && !end && txDate >= start) ||
    (!start && end && txDate <= end);

  const matchesSearch = (() => {
    if (searchTerm === '') return true;

  const term = searchTerm.toLowerCase();
  switch (searchCategory) {
    case 'Sender':
      return tx.sender.toLowerCase().includes(term);
    case 'Receiver':
      return tx.receiver.toLowerCase().includes(term);
    case 'Reference':
      return tx.reference_no.toLowerCase().includes(term);
    case 'All':
    default:
      return (
        tx.sender.toLowerCase().includes(term) ||
        tx.receiver.toLowerCase().includes(term) ||
        tx.reference_no.toLowerCase().includes(term)
      );
}
  })();
  const matchesType =
    selectedType === 'All' || tx.type.toLowerCase() === selectedType.toLowerCase();

  return matchesDate && matchesSearch && matchesType;

  });

  const totalDebit = filteredTransactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + tx.credit, 0);
  

  const handleExportPDF = () => {
  const fileName = prompt("Enter a file name for the PDF:", "Filtered_Transactions");

  if (!fileName) return;

  const doc = new jsPDF();

  const tableColumn = ['Date', 'Reference No', 'Description', 'Type', 'Sender', 'Receiver', 'Debit', 'Credit'];

  const tableRows = filteredTransactions.map(tx => [
    formatDate(tx.tx_date),
    tx.reference_no,
    tx.description,
    tx.type,
    tx.sender,
    tx.receiver,
    tx.debit.toFixed(2),
    tx.credit.toFixed(2),
  ]);

  // Add totals row
  tableRows.push([
    'TOTAL',
    '', '', '', '', '',
    totalDebit.toFixed(2),
    totalCredit.toFixed(2),
  ]);

  doc.text('Filtered Transactions Report', 14, 15);
  autoTable(doc, {
  head: [tableColumn],
  body: tableRows,
  startY: 20,
  theme: 'grid', 
  headStyles: {
    fillColor: [52, 58, 64], 
    textColor: 255,
    fontStyle: 'bold',
    halign: 'center',
    valign: 'middle'
  },
  bodyStyles: {
    fontSize: 6,
    cellPadding: 4,
    valign: 'middle'
  },
  alternateRowStyles: {
    fillColor: [248, 249, 250] // ⬜ light gray like Bootstrap striped
  },
  columnStyles: {
    5: { halign: 'right' }, // Debit
    6: { halign: 'right' }, // Credit
  },
  didDrawCell: (data) => {
    if (data.row.index === tableRows.length - 1) {
      // 🔸 Total row
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.fillColor = [233, 236, 239]; // Slightly different to stand out
    }
  }
});

  doc.save(`${fileName}.pdf`);
};



  return (
    <DashboardLayout>
      <div
        
        data-pc-preset="preset-1"
        data-pc-sidebar-caption="false"
        data-pc-direction="ltr"
        data-pc-theme="light"
        
      >
        <div className="loader-bg">
            <div className="loader-track">
              <div className="loader-fill"></div>
            </div>
        </div>

        <div className="pc-container">
          <div className="pc-content">
            <div className="page-header">
              <div className="page-block">
                <div className="card-header">
                  <h1 className="text-center">All Transactions</h1>
                </div>
              </div>
            </div>

            <div className="container">
              {/* Date Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Transaction Type</label>
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Payment">Payment</option>
                      <option value="GGives">GGives</option>
                      <option value="Refund">Refund</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                  <label className="form-label">Search By</label>
                  <select
                    className="form-select mb-2"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Sender">Sender</option>
                    <option value="Receiver">Receiver</option>
                    <option value="Reference">Reference No</option>
                  </select>

                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Search ${searchCategory}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  
                </div>
                <div className="mb-3 text-end">
                <button className="btn btn-outline-primary" onClick={handleExportPDF}>
                  Export to PDF
                </button>
              </div>
                  
              </div>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="alert alert-info text-center">No transactions found.</div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-bordered table-striped">
                    <thead className="table-primary">
                      <tr>
                        <th>Date</th>
                        <th>Reference No</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Sender</th>
                        <th>Receiver</th>
                        <th>Debit</th>
                        <th>Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx, index) => (
                        <tr key={index}>
                          <td>{formatDate(tx.tx_date)}</td>
                          <td>{tx.reference_no}</td>
                          <td>{tx.description}</td>
                          <td>{tx.type}</td>
                          <td>{tx.sender}</td>
                          <td>{tx.receiver}</td>
                          <td>{tx.debit.toFixed(2)}</td>
                          <td>{tx.credit.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="table-secondary fw-bold">
                        <td><h4>Total</h4></td>
                        <td colSpan={5}></td>
                        <td>{totalDebit.toFixed(2)}</td>
                        <td>{totalCredit.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionTable;
