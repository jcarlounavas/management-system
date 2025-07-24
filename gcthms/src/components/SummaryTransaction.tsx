import React from 'react';
import { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { Link, useLocation } from 'react-router-dom';


interface SummaryTransaction {
  tx_date: string;
  description: string;
  reference_no: string;
  debit: number;
  credit: number;
  type: string;
  sender: string;
  receiver: string;
}

const SummaryTransaction: React.FC = () => {
  const [transactions, setTransactions] = useState<SummaryTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/summarytransactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error('Error fetching transactions:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <h4 className="m-b-10 badge bg-brand-color-2 text-white f-24 mt-4 ms-2 px-3 py-2" >Summary Transactions</h4>

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
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.tx_date}</td>
                    <td>{tx.reference_no}</td>
                    <td>{tx.description}</td>
                    <td>{tx.type}</td>
                    <td>{tx.sender}</td>
                    <td>{tx.receiver}</td>
                    <td>{tx.debit.toFixed(2)}</td>
                    <td>{tx.credit.toFixed(2)}</td>
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

export default SummaryTransaction;
