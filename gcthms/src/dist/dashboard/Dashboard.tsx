import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import Card from '../../components/Card';

interface Summary {
  id: number;
  file_name: string;
}

interface Totals {
  total_debit: number;
  total_credit: number;
}

const Dashboard: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [summaryId, setSummaryId] = useState<number | null>(null);
  const [totals, setTotals] = useState<Totals>({ total_debit: 0, total_credit: 0 });
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  });

  // ✅ Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // ✅ Fetch summary list and summary count
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const [summaryRes, countRes] = await Promise.all([
          fetch('http://localhost:3001/api/summary', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3001/api/summary/count', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!summaryRes.ok) throw new Error('Failed to fetch summary list');
        if (!countRes.ok) throw new Error('Failed to fetch summary count');

        const summariesData = await summaryRes.json();
        const countData = await countRes.json();

        const list = Array.isArray(summariesData) ? summariesData : [];
        setSummaries(list);
        if (list.length > 0) setSummaryId(list[0].id);

        setTotalSummaries(countData?.total_transactions ?? 0);
      } catch (err) {
        console.error(err);
        setError('⚠️ Could not load dashboard data. Check API or database.');
      } finally {
        setLoadingSummaries(false);
      }
    };

    fetchInitialData();
  }, []);

  // ✅ Fetch totals and transaction count per selected summary
  useEffect(() => {
    if (!summaryId) return;

    const fetchDetails = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const [totalsRes, txRes] = await Promise.all([
          fetch(`http://localhost:3001/api/summary/${summaryId}/totals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/api/summary/${summaryId}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!totalsRes.ok || !txRes.ok) {
          throw new Error('One or more summary details failed to load');
        }

        const totalsData = await totalsRes.json();
        const txData = await txRes.json();

        setTotals({
          total_debit: totalsData?.total_debit ?? 0,
          total_credit: totalsData?.total_credit ?? 0,
        });

        setTotalTransactions(Array.isArray(txData) ? txData.length : 0);
      } catch (err) {
        console.error(err);
        setError('⚠️ Could not fetch summary totals or transactions.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchDetails();
  }, [summaryId]);

  if (loadingSummaries) return <div className="text-center mt-5">Loading dashboard...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <DashboardLayout>
      <div className="container" style={{ paddingTop: '75px', paddingLeft: '30px', paddingRight: '20px' }}>
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="badge bg-brand-color-2 text-white f-50 mt-4 ms-2 px-3 py-2">Dashboard</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Selector */}
          <div className="mb-4">
            <label htmlFor="summarySelect" className="form-label badge bg-brand-color-2 text-white f-16 mt-4 ms-2 px-3 py-2">
              Select Summary:
            </label>
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

          {/* Cards */}
          <div className="row">
            <div className="col-md-4 col-xl-4">
              <Card
                title="Total Debit"
                body={loadingData ? 'Loading...' : currency.format(totals.total_debit)}
                color="#76d0edff"
              />
            </div>
            <div className="col-md-4 col-xl-4">
              <Card
                title="Total Credit"
                body={loadingData ? 'Loading...' : currency.format(totals.total_credit)}
                color="#76d0edff"
              />
            </div>
            <div className="col-md-4 col-xl-4">
              <Card
                title="Total Transactions"
                body={loadingData ? 'Loading...' : totalTransactions.toString()}
                color="#76d0edff"
              />
            </div>
            <div className="col-md-4 col-xl-4">
              <Card
                title="File Uploaded"
                body={totalSummaries.toString()}
                color="#76d0edff"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
