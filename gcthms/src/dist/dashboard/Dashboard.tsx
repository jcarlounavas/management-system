import React, { useState, useEffect }from 'react';
import DashboardLayout from './DashboardLayout';
import Card from '../../components/Card';


interface Summary {
  id: number;
  file_name: string;
  transaction_count: number;
}

const Dashboard: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [summaryId, setSummaryId] = useState<number | null>(null);
  const [totals, setTotals] = useState({ total_debit: 0, total_credit: 0 });
const [totalTransactions, setTotalTransactions] = useState(0);
const [totalSummaries, setTotalSummaries] = useState(0);

//summary Dropdown
  useEffect(() => {
    fetch('http://localhost:3001/api/summary')
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data);
        if (data.length > 0) setSummaryId(data[0].id); // default: first summary
      });
  }, []);

  useEffect(() => {
    if (!summaryId) return;

    fetch(`http://localhost:3001/api/summary/${summaryId}/totals`)
      .then((res) => res.json())
      .then((data) => {
        setTotals({
          total_debit: data.total_debit || 0,
          total_credit: data.total_credit || 0,
        });
      })
      .catch((err) => console.error('Failed to fetch totals:', err));

    fetch(`http://localhost:3001/api/summary/${summaryId}/transactions`)
        .then((res) => res.json())
        .then((data) => setTotalTransactions(data.length));

fetch('http://localhost:3001/api/summary/count')
    .then((res) => res.json())
    .then((data) => setTotalSummaries(data.total_summaries || 0));
  }, [summaryId]);


  return (
    <DashboardLayout >
          <div
      data-pc-preset="preset-1"
      data-pc-sidebar-caption="false"
      data-pc-direction="ltr"
      data-pc-theme="light"
    >
      {/* Loader */}
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container" style={{ paddingTop: "75px", paddingLeft : "30px", paddingRight: "20px" }}>
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="page-header-title">
                    <h5 className="m-b-10 badge bg-brand-color-2 text-white f-50 mt-4 ms-2 px-3 py-2">Dashboard</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Cards */}
          <div className="mb-4">
          <label htmlFor="summarySelect" className="form-label badge bg-brand-color-2 text-white f-16 mt-4 ms-2 px-3 py-2">Select Summary:</label>
          <select
            id="summarySelect"
            className="form-select"
            value={summaryId ?? ''}
            onChange={(e) => setSummaryId(parseInt(e.target.value))}
          >
            {summaries.map((summary) => (
              <option key={summary.id} value={summary.id}>
                {summary.file_name} (ID: {summary.id})
              </option>
            ))}
          </select>
        </div>

        {/* Totals */}
        <div className="row">
          <div className="col-md-4 col-xl-4">
            <Card title="Total Debit" body={`₱${totals.total_debit.toLocaleString()}`} color="#3f4d67"  />
          </div>
          <div className="col-md-4 col-xl-4">
            <Card title="Total Credit" body={`₱${totals.total_credit.toLocaleString()}`} color="#3f4d67" />
          </div>
          <div className="col-md-4 col-xl-4">
            <Card title="Total Transactions" body={`${totalTransactions}`} color="#3f4d67" />
        </div>
         <div className="col-md-4 col-xl-4">
            <Card title="File Uploaded" body={`${totalSummaries}`} color="#3f4d67" />
        </div>
      </div>
      </div>
      </div>
      </div>
    </DashboardLayout>

  );
};

export default Dashboard;
