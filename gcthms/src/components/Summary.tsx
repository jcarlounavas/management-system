import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

interface Summary {
  summary_id: number;
  created_at: string;
  transaction_count: number;
  totalDebit: number;
  totalCredit: number;
}

const Summary: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/summary/transactions')
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.summaries || []);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  const totalTransactions = summaries.reduce((sum, s) => sum + s.transaction_count, 0);
  const totalDebit = summaries.reduce((sum, s) => sum + s.totalDebit, 0);
  const totalCredit = summaries.reduce((sum, s) => sum + s.totalCredit, 0);

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

            <div className="transaction-summary-ui">
        <h2 className="section-title">Transaction Summary</h2>

        {summaries.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Summary ID</th>
                  <th>Created At</th>
                  <th>Number of Transactions</th>
                  <th>Total Debit</th>
                  <th>Total Credit</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((item, index) => (
                  <tr key={item.summary_id}>
                    <td>{item.summary_id}</td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>{item.transaction_count}</td>
                    <td>{item.totalDebit.toLocaleString()}</td>
                    <td>{item.totalCredit.toLocaleString()}</td>
                  </tr>
                ))}
                {/* <tr className="table-footer">
                  <td colSpan={3}>Total</td>
                  <td>{totalTransactions}</td>
                  <td>{totalDebit.toLocaleString()}</td>
                  <td>{totalCredit.toLocaleString()}</td>
                </tr> */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info text-center">No transactions found.</div>
        )}
      </div>
          </div>
        </div>
      </div>


      
    </DashboardLayout>
  );
};

export default Summary;
