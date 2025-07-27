import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

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

  const matchesSearch =
    searchTerm === '' ||
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference_no.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesType =
    selectedType === 'All' || tx.type.toLowerCase() === selectedType.toLowerCase();

  return matchesDate && matchesSearch && matchesType;

  });

  const totalDebit = filteredTransactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + tx.credit, 0);
  


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
                    <label className="form-label">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name, Ref. No, Contact, etc."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="table-responsive">
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
