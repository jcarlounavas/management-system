import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from '@mui/material/Link';  
interface Summary {
  id: number;
  file_name: string;
}

interface Totals {
  total_debit: number;
  total_credit: number;
}interface Contacts {
  contact_id: number;
  contact_name: string;
  contact_number: string;
  total_transactions: number;
  total_debit: number;
  total_credit: number;
}



const Dashboard: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [summaryId, setSummaryId] = useState<number | null>(null);
  const [totals, setTotals] = useState<Totals>({ total_debit: 0, total_credit: 0 });
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [loading, setLoading] = useState({ summaries: true, details: false });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contacts[]>([]);
  


  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  });
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

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

        const [summaryRes, countRes,] = await Promise.all([
          fetch(`http://localhost:3001/api/summary?user_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/api/summary/count?user_id=${userId}`, {
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


  //Fetch Top Contacts
useEffect(() => {
  const fetchTopContacts = async () => {
    try {
      if (!token || !userId) return;

      const res = await fetch(`http://localhost:3001/api/summary/top-contacts?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // if your backend validates JWT
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch top contacts');
      }

      const data: Contacts[] = await res.json(); // ensure correct typing
      console.log(data); // helpful for debugging

      setContacts(data);

    const total_debit = data.reduce((sum, contact) => sum + Number(contact.total_debit ?? 0), 0);
    const total_credit = data.reduce((sum, contact) => sum + Number(contact.total_credit ?? 0), 0);


      setTotalDebit(total_debit);
      setTotalCredit(total_credit);
    } catch (error) {
      console.error('Error fetching top contacts:', error);
    }
  };

  fetchTopContacts();
}, [token, userId]); // include dependencies for reliability




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

          <div className="row dashboard-hover-container">
  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card dashboard-hover-card">
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
    <div className="card dashboard-hover-card">
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
    <div className="card dashboard-hover-card">
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
    <div className="card dashboard-hover-card">
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
      </div>
    </div>
  </div>

</div>

<div className="row mb-4">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h5 className="mb-0">Top Contacts</h5>

    <Link href="/contacts" underline="none" className="btn btn-primary text-white">
      View All Contacts
    </Link>


  
</div>

  {/* Contact Card 1 */}
      <div className="contact-card-row">
      {contacts.map((contact, index) => (
        <div className="contact-card card" key={contact.contact_id || index}>
          <div className="card card-social">
            <div className="card-body border-bottom">
              <div className="row align-items-center justify-content-center">
                <div className="col-auto">
                  <AccountCircleIcon style={{ fontSize: 80, color: '#3f51b5' }} />
                </div>
                <div className="col text-end">
                  <h4 className="mb-1">{contact.contact_name}</h4>
                  <span className="text-muted">Account #: {contact.contact_number}</span>
                  <h6 className="text-primary mt-2 mb-0">
                    Total Transactions: {contact.total_transactions?.toLocaleString()}
                  </h6>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="row align-items-center justify-content-center card-active">
                <div className="col-6">
                  <h6 className="text-center mb-2">
                    <span className="text-muted me-1">Total Debit: </span> {currency.format(contact.total_debit)}
                  </h6>
                </div>

                <div className="col-6">
                  <h6 className="text-center mb-2">
                    <span className="text-muted me-1">Total Credit:</span> {currency.format(contact.total_credit)}
                  </h6>
                </div>
              </div>

            </div>
          </div>
        </div>
      ))}

  
              </div>
              </div>
            </div>
          </div>

      
    </DashboardLayout>
  );
};


export default Dashboard;
