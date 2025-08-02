import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { Link } from 'react-router-dom';

interface SummaryEntry {
  created_at: string;
  file_name: string;
  summary_id: number;
  totalDebit: number;
  totalCredit: number;
  totalTransactions: number;
}

const Summary: React.FC = () => {
  const [summaries, setSummaries] = useState<SummaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = () => {
    fetch('http://localhost:3001/api/summary/all')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched summary totals:', data);
        setSummaries(data);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (summary_id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this summary? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/api/summary/${summary_id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Summary deleted successfully.');
        fetchSummaries();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete summary: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete summary.');
    }
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
                  <h3 className="text-center">All Transaction Summary Totals</h3>
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
                <div className="alert alert-info text-center">No summary totals found.</div>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead className="table-primary">
                    <tr>
                      <th className="text-center">Time</th>
                      <th className="text-center">File Name</th>
                      <th className="text-center">Total Transactions</th>
                      <th className="text-center">Total Debit</th>
                      <th className="text-center">Total Credit</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((summary) => (
                      <tr key={summary.summary_id}>
                        <td className="text-center">{new Date(summary.created_at).toLocaleString()}</td>
                        <td className="text-center">{summary.file_name}</td>
                        <td className="text-center">{summary.totalTransactions}</td>
                        <td className="text-end">{summary.totalDebit.toLocaleString()}</td>
                        <td className="text-end">{summary.totalCredit.toLocaleString()}</td>
                        <td className="text-center">
                          <Link
                            to={`/summary/${summary.summary_id}`}
                            target="_blank"
                            className="btn btn-primary me-2"
                          >
                            View Details
                          </Link>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(summary.summary_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Summary;



// import React, { useEffect, useState } from 'react';
// import DashboardLayout from '../dist/dashboard/DashboardLayout';

// interface PairSummary {
//   pair: string;
//   count: number;
//   totalDebit: number;
//   totalCredit: number;
// }

// interface GroupedSummary {
//   summary_id: number;
//   created_at: string;
//   file_name: string;
//   pairSummaries: PairSummary[];
//   totalDebit: number;
//   totalCredit: number;
//   totalTransactions: number;
// }

// const Summary: React.FC = () => {
//   const [summaries, setSummaries] = useState<GroupedSummary[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('http://localhost:3001/api/summary/grouped')
//       .then((res) => res.json())
//       .then((data) => {
//         console.log('Fetched grouped summary:', data);
//         setSummaries(data);
//       })
//       .catch((err) => console.error('Fetch error:', err))
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <DashboardLayout>
//       <div
//         data-pc-preset="preset-1"
//         data-pc-sidebar-caption="false"
//         data-pc-direction="ltr"
//         data-pc-theme="light"
//       >
//         <div className="loader-bg">
//           <div className="loader-track">
//             <div className="loader-fill"></div>
//           </div>
//         </div>

//         <div className="pc-container">
//           <div className="pc-content">
//             <div className="page-header">
//               <div className="page-block">
//                 <div className="card-header">
//                   <h1 className="text-center">All Transaction Summaries</h1>
//                 </div>
//               </div>
//             </div>

//             <div className="transaction-summary-ui">
//               {loading ? (
//                 <div className="text-center my-3">
//                   <div className="spinner-border text-primary" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                 </div>
//               ) : summaries.length === 0 ? (
//                 <div className="alert alert-info text-center">No transaction summaries found.</div>
//               ) : (
//                 summaries.map((summary, i) => (
//                   <div key={summary.summary_id} className="mb-5">
//                     <h3 className="mb-3">
//                       Summary ID: {summary.summary_id} —{' '}
//                       {new Date(summary.created_at).toLocaleString()}
//                       <span className='text-muted'> {' '}|| File: {summary.file_name}</span>
//                     </h3>
//                     <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                     <table className="table table-bordered table-striped">
//                       <thead className='table-primary'>
//                         <tr>
//                           <th>#</th>
//                           <th>Sender → Receiver</th>
//                           <th>Number of Transactions</th>
//                           <th>Total Debit</th>
//                           <th>Total Credit</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {summary.pairSummaries.map((item, index) => (
//                           <tr key={index}>
//                             <td>{index + 1}</td>
//                             <td>{item.pair}</td>
//                             <td>{item.count}</td>
//                             <td>{item.totalDebit.toLocaleString()}</td>
//                             <td>{item.totalCredit.toLocaleString()}</td>
//                           </tr>
//                         ))}
//                         <tr className="table-footer">
//                           <td colSpan={2}>Total</td>
//                           <td>{summary.totalTransactions}</td>
//                           <td>{summary.totalDebit.toLocaleString()}</td>
//                           <td>{summary.totalCredit.toLocaleString()}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Summary;
