import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { useParams } from 'react-router-dom';

interface PairSummary {
  pair: string;
  count: number;
  totalCredit: number;
  totalDebit: number;
}

const DisplaySummary: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ✅ Get the summary ID from URL
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/summary/${id}/transactions`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id]);

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
                  <h1 className="text-center">Summary Transaction</h1>
                </div>
              </div>
            </div>

            <div className="container my-4">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : summary?.pairSummaries && summary.pairSummaries.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Sender → Receiver</th>
                        <th>Number of Transactions</th>
                        <th>Total Debit</th>
                        <th>Total Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.pairSummaries
                        .sort((a: PairSummary, b: PairSummary) => b.count - a.count)
                        .map((item: PairSummary, index: number) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.pair}</td>
                            <td>{item.count}</td>
                            <td>{item.totalDebit.toLocaleString()}</td>
                            <td>{item.totalCredit.toLocaleString()}</td>
                          </tr>
                        ))}
                      <tr className="table-primary fw-bold">
                        <td>Total</td>
                        <td></td>
                        <td>{summary.transactions.length}</td>
                        <td>{summary.totalDebit.toLocaleString()}</td>
                        <td>{summary.totalCredit.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info text-center">
                  No summary data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DisplaySummary;
