import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  return (
    
      <div className="pc-container">
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="card-header">
                <h1 className="text-center">Summary View</h1>
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
            <div className="mb-5">
              <h3 className="mb-3">
                Summary ID: {summary.summary_id} —{' '}
                {new Date(summary.created_at).toLocaleString()}
                <span className="text-muted"> || File: {summary.file_name}</span>
              </h3>

              <table className="data-table">
                <thead>
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
