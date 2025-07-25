import React from 'react';
import { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { Link, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';




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
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [transactionType, setTransactionType] = useState('All');

  useEffect(() => {
    
    fetch('http://localhost:3001/api/transactions')
    
      .then((res) => res.json())
      .then((data) => { console.log('Fetched data:', data) ;setTransactions(data);})
      .catch((err) => console.error('Error fetching transactions:', err))
      .finally(() => setLoading(false));  
  }, []);

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <h4 className="m-b-10 badge bg-brand-color-2 text-white f-24 mt-4 ms-2 px-3 py-2">Transactions</h4>
<div className="d-flex gap-3 flex-wrap mb-4">
      <input
        type="text"
        placeholder="Search description..."
        className="form-control"
        style={{ maxWidth: 200 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <DatePicker
        selected={startDate || undefined}
        onChange={(date) => setStartDate(date)}
        selectsStart
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        placeholderText="Start date"
        className="form-control"
      />

      <DatePicker
        selected={endDate || undefined}
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        minDate={startDate || undefined}
        placeholderText="End date"
        className="form-control"
      />


      <select
        className="form-select"
        style={{ maxWidth: 160 }}
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
      >
        <option value="All">All Types</option>
        <option value="Credit">Credit</option>
        <option value="Debit">Debit</option>
      </select>

      <button
        className="btn btn-secondary"
        onClick={() => {
          setSearchTerm('');
          setStartDate(null);
          setEndDate(null);
          setTransactionType('All');
        }}
      >
        Reset
      </button>
    </div>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="alert alert-info text-center">
            No transactions found.
          </div>
        ) : (
          <div className="table-responsive shadow rounded-4">
          
            <table className="table table-hover align-middle text-center table-striped border rounded-4 overflow-hidden text-dark fw-medium">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-3 px-2 text-white">Date</th>
                  <th className="py-3 px-2 text-white">Reference No</th>
                  <th className="py-3 px-2 text-white">Description</th>
                  <th className="py-3 px-2 text-white">Type</th>
                  <th className="py-3 px-2 text-white">Sender</th>
                  <th className="py-3 px-2 text-white">Receiver</th>
                  <th className="py-3 px-2 text-white">Debit</th>
                  <th className="py-3 px-2 text-white">Credit</th>
                </tr>
              </thead>
              <tbody className ="bg-white">
                {transactions.filter(tx => {
                    const txDate = new Date(tx.tx_date); // Convert string to real Date object

                    const matchesSearch =
                      tx.description.toLowerCase().includes(searchTerm.toLowerCase());

                    const matchesType =
                      transactionType === 'All' ||
                      tx.type.toLowerCase() === transactionType.toLowerCase();

                    const matchesStart = !startDate || txDate >= startDate;

                    const matchesEnd = !endDate || txDate <= endDate;

                    return matchesSearch && matchesType && matchesStart && matchesEnd;
                  })
                    .map((tx, index) => (
                  <tr key={index}>
                    <td className="py-3 px-2">{tx.tx_date}</td>
                    <td className="py-3 px-2">{tx.reference_no}</td>
                    <td className="py-3 px-2">{tx.description}</td>
                    <td className="py-3 px-2 text-capitalize">{tx.type}</td>
                    <td className="py-3 px-2">{tx.sender}</td>
                    <td className="py-3 px-2">{tx.receiver}</td>
                    <td className="py-3 px-2 text-danger fw-semibold">{Number(tx.debit || 0).toFixed(2)}</td>
                    <td className="py-3 px-2 text-success fw-semibold">{Number(tx.credit || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionTable;
