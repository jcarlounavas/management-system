import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

interface PairSummary {
  pair: string;
  count: number;
  totalDebit: number;
  totalCredit: number;
}

interface GroupedSummary {
  summary_id: number;
  created_at: string;
  file_name: string;
  pairSummaries: PairSummary[];
  totalDebit: number;
  totalCredit: number;
  totalTransactions: number;
}

const Summary: React.FC = () => {
  const [summaries, setSummaries] = useState<GroupedSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/summary/grouped')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched grouped summary:', data);
        setSummaries(data);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

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
                  <h1 className="text-center">All Transaction Summaries</h1>
                </div>
              </div>
            </div>

            <div className="transaction-summary-ui">
              {loading ? (
                <div className="text-center my-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : summaries.length === 0 ? (
                <div className="alert alert-info text-center">No transaction summaries found.</div>
              ) : (
                summaries.map((summary, i) => (
                  <div key={summary.summary_id} className="mb-5">
                    <h3 className="mb-3">
                      Summary ID: {summary.summary_id} —{' '}
                      {new Date(summary.created_at).toLocaleString()}
                      <span className='text-muted'> {' '}|| File: {summary.file_name}</span>
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-bordered table-striped">
                      <thead className='table-primary'>
                        <tr>
                          <th>#</th>
                          <th>Sender → Receiver</th>
                          <th>Number of Transactions</th>
                          <th>Total Debit</th>
                          <th>Total Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.pairSummaries.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.pair}</td>
                            <td>{item.count}</td>
                            <td>{item.totalDebit.toLocaleString()}</td>
                            <td>{item.totalCredit.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="table-footer">
                          <td colSpan={2}>Total</td>
                          <td>{summary.totalTransactions}</td>
                          <td>{summary.totalDebit.toLocaleString()}</td>
                          <td>{summary.totalCredit.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Summary;
