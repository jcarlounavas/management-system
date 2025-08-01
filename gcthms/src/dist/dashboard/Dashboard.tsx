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
  const [loading, setLoading] = useState({ summaries: true, details: false });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  });

  // Redirect to login if no token
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch summaries and summary count
  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(prev => ({ ...prev, summaries: true }));
      setError('');

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

        if (!summaryRes.ok || !countRes.ok) {
          throw new Error('Failed to fetch summary data');
        }

        const summaryData = await summaryRes.json();
        const countData = await countRes.json();

        setSummaries(summaryData);
        setSummaryId(summaryData[0]?.id || null);
        setTotalSummaries(countData?.total_transactions || 0);
      } catch (err) {
        console.error(err);
        setError('⚠️ Could not load dashboard data. Check API or database.');
      } finally {
        setLoading(prev => ({ ...prev, summaries: false }));
      }
    };

    fetchSummaries();
  }, []);

  // Fetch totals and transactions for selected summary
  useEffect(() => {
    if (!summaryId) return;

    const fetchSummaryDetails = async () => {
      setLoading(prev => ({ ...prev, details: true }));
      setError('');

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const [totalsRes, transactionsRes] = await Promise.all([
          fetch(`http://localhost:3001/api/summary/${summaryId}/totals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/api/summary/${summaryId}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!totalsRes.ok || !transactionsRes.ok) {
          throw new Error('Failed to fetch summary totals or transactions');
        }

        const totalsData = await totalsRes.json();
        const transactionsData = await transactionsRes.json();

        setTotals({
          total_debit: totalsData?.total_debit || 0,
          total_credit: totalsData?.total_credit || 0,
        });

        setTotalTransactions(Array.isArray(transactionsData) ? transactionsData.length : 0);
      } catch (err) {
        console.error(err);
        setError('⚠️ Failed to fetch summary totals or transactions.');
      } finally {
        setLoading(prev => ({ ...prev, details: false }));
      }
    };

    fetchSummaryDetails();
  }, [summaryId]);

  if (loading.summaries) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-danger text-center mt-5">{error}</div>;
  }

  return (
    <DashboardLayout>
      <div className="container" style={{ paddingTop: '75px', paddingLeft: '30px', paddingRight: '20px' }}>
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="badge bg-brand-color-3 text-white f-50 mt-4 ms-2 px-3 py-2">Dashboard</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Dropdown */}
          <div className="mb-4">
            <label htmlFor="summarySelect" className="form-label badge bg-brand-color-3 text-white f-16 mt-4 ms-2 px-3 py-2">
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

          {/* Summary Cards */}
          <div className="row">
            <div className="col-md-4 col-xl-4">
              <Card
                title="Total Debit"
                body={loading.details ? 'Loading...' : currency.format(totals.total_debit)}
                color="#007bffc9"
              />
            </div>
            <div className="col-md-4 col-xl-4">
              <Card
                title="Total Credit"
                body={loading.details ? 'Loading...' : currency.format(totals.total_credit)}
                color="#007bffc9"
              />
            </div>
            <div className="col-md-4 col-xl-4">
              <Card
                title="Total Transactions"
                body={loading.details ? 'Loading...' : `${totalTransactions}`}
                color="#007bffc9"
              />
            </div>
            <div className="col-md-4 col-xl-4">
              <Card
                title="Files Uploaded"
                body={loading.details ? 'Loading...' : `${totalSummaries}`}
                color="#007bffc9"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
