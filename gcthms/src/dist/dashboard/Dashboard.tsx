import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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
        const userId = localStorage.getItem('user_id');
        if (!token || !userId) throw new Error('No token or user_id');

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
  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card" style={{ backgroundColor: '#fff', color: 'red' }}>
      <div className="card-body">
        <h6 className="mb-4">Total Debit</h6>
        <div className="row d-flex align-items-center">
          <div className="col-12">
            <h3 className="f-w-300 d-flex align-items-center m-b-0">
              {loading.details ? 'Loading...' : currency.format(totals.total_debit)}
            </h3>
          </div>
        </div>
        <div className="progress m-t-30" style={{ height: 7 }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: '100%'}}
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card" style={{ backgroundColor: '#fff', color: 'red' }}>
      <div className="card-body">
        <h6 className="mb-4">Total Credit</h6>
        <div className="row d-flex align-items-center">
          <div className="col-12">
            <h3 className="f-w-300 d-flex align-items-center m-b-0">
              {loading.details ? 'Loading...' : currency.format(totals.total_credit)}
            </h3>
          </div>
        </div>
        <div className="progress m-t-30 " style={{ height: 7 }}>
          <div
            className="progress-bar bg-danger"
            role="progressbar"
            style={{ width: '100%' }}
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card" style={{ backgroundColor: '#fff', color: 'red' }}>
      <div className="card-body">
        <h6 className="mb-4">Total Transaction</h6>
        <div className="row d-flex align-items-center">
          <div className="col-12">
            <h3 className="f-w-300 d-flex align-items-center m-b-0">
               <CompareArrowsIcon style={{ marginRight: '8px',  fontSize: '32px', color: 'blue' }} />
              {loading.details ? 'Loading...' : totalTransactions}
            </h3>
          </div>
        </div>
        <div className="progress m-t-30" style={{ height: 7 }}>
          <div
            className="progress-bar bg-primary"
            role="progressbar"
            style={{ width: '100%' }}
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card" style={{ backgroundColor: '#fff', color: 'red' }}>
      <div className="card-body">
        <h6 className="mb-4">File Uploaded</h6>
        <div className="row d-flex align-items-center">
          <div className="col-12">
            <h3 className="f-w-300 d-flex align-items-center m-b-0">
              <InsertDriveFileIcon style={{ marginRight: '8px', fontSize: '32px', color: 'blue' }} />
              {loading.details ? 'Loading...' : totalSummaries}
            </h3>
          </div>
        </div>
        <div className="progress m-t-30" style={{ height: 7 }}>
          <div
            className="progress-bar bg-primary"
            role="progressbar"
            style={{ width: '100%' }}
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  </div>

</div>

<div className="row mb-4">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h5 className="mb-0">Top Contacts</h5>
  <button className="badge me-2 bg-brand-color-2 text-white f-1" >See All Contacts</button>
  
</div>

  {/* Contact Card 1 */}
  <div className="col-md-6 col-xl-4">
    <div className="card card-social">
      <div className="card-body border-bottom">
        <div className="row align-items-center justify-content-center">
          <div className="col-auto">
             <AccountCircleIcon style={{ fontSize: 100, color: '#3f51b5' }} />
            <i className="ti ti-user text-primary" style={{ fontSize: 36 }}></i>
          </div>
          <div className="col text-end">
            <h4 className="mb-1">Patrick Cords</h4>
            <span className="text-muted">Acct #: 1234567890</span>
            <h5 className="text-primary mt-2 mb-0">Total Transactions: 1,234</h5>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row align-items-center justify-content-center card-active">
          <div className="col-6">
            <h6 className="text-center mb-2">
              <span className="text-muted me-1">Debit:</span> ₱25,000
            </h6>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: '70%', height: '6px' }}
                aria-valuenow={70}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
          <div className="col-6">
            <h6 className="text-center mb-2">
              <span className="text-muted me-1">Credit:</span> ₱18,500
            </h6>
            <div className="progress">
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: '50%', height: '6px' }}
                aria-valuenow={50}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        </div>
        <div className="card-footer text-center border-top">
  <button className="badge me-2 bg-brand-color-2 text-white f-12">View More</button>
</div>
      </div>
    </div>
  </div>

  {/* Contact Card 2 */}
  <div className="col-md-6 col-xl-4">
    <div className="card card-social">
      <div className="card-body border-bottom">
        <div className="row align-items-center justify-content-center">
          <div className="col-auto">
            <AccountCircleIcon style={{ fontSize: 100, color: '#3f51b5' }} />
            <i className="ti ti-user text-primary" style={{ fontSize: 36 }}></i>
          </div>
          <div className="col text-end">
            <h4 className="mb-1">Kyle D. Vinkoy</h4>
            <span className="text-muted">Acct #: 9876543210</span>
            <h5 className="text-primary mt-2 mb-0">Total Transactions: 980</h5>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row align-items-center justify-content-center card-active">
          <div className="col-6">
            <h6 className="text-center mb-2">
              <span className="text-muted me-1">Debit:</span> ₱15,200
            </h6>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: '55%', height: '6px' }}
                aria-valuenow={55}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
          <div className="col-6">
            <h6 className="text-center mb-2">
              <span className="text-muted me-1">Credit:</span> ₱12,000
            </h6>
            <div className="progress">
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: '40%', height: '6px' }}
                aria-valuenow={40}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        </div>
        <div className="card-footer text-center border-top">
  <button className="badge me-2 bg-brand-color-2 text-white f-12">View More</button>
</div>
      </div>
    </div>
    
  </div>

  {/* Contact Card 3 */}
  <div className="col-md-6 col-xl-4">
    <div className="card card-social">
      <div className="card-body border-bottom">
        <div className="row align-items-center justify-content-center">
          <div className="col-auto">
            <AccountCircleIcon style={{ fontSize: 100, color: '#3f51b5' }} />
            <i className="ti ti-user text-primary" style={{ fontSize: 36 }}></i>
          </div>
          <div className="col text-end">
            <h4 className="mb-1">JC Navas</h4>
            <span className="text-muted">Acct #: 1122334455</span>
            <h5 className="text-primary mt-2 mb-0">Total Transactions: 875</h5>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row align-items-center justify-content-center card-active">
          <div className="col-6">
            <h6 className="text-center mb-2">
              <span className="text-muted me-1">Debit:</span> ₱19,800
            </h6>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: '65%', height: '6px' }}
                aria-valuenow={65}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
          <div className="col-6">
            <h6 className="text-center mb-2">
              <span className="text-muted me-1">Credit:</span> ₱14,600
            </h6>
            <div className="progress">
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: '48%', height: '6px' }}
                aria-valuenow={48}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        </div>
        <div className="card-footer text-center border-top">
    <button className="badge me-2 bg-brand-color-2 text-white f-12">View More</button>
  </div>
      </div>
      
    </div>
  </div>
  
</div>

            </div>
          </div>

      
    </DashboardLayout>
  );
};


export default Dashboard;
