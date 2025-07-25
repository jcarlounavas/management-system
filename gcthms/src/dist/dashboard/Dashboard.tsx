import React from 'react';
import DashboardLayout from './DashboardLayout';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";

const Dashboard: React.FC = () => {

  const userName = "User";
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" :
    currentHour < 18 ? "Good afternoon" : "Good evening";


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
      <div className="container mt-5">
          <div className="page-header">
            <div className="page-block">
              <div className="row align-items-center">
                <div className="col-md-12">
                  <div className="page-header-title">
                    <h5 className="m-b-10 badge bg-brand-color-2 text-white f-24 mt-4 ms-2 px-3 py-2">Dashboard</h5>
                  </div>
                  <div className="mb-4">
                  <h3>{greeting}, <strong>{userName}</strong> 👋</h3>
                  <p className="text-muted">Here's your financial summary at a glance.</p>
                </div>
                </div>
              </div>
            </div>
          </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-start border-4 border-danger">
              <div className="card-body">
                <h6 className="text-muted">Weekly Debit</h6>
                <h3 className="text-danger fw-semibold">₱4,520.00</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-start border-4 border-success">
              <div className="card-body">
                <h6 className="text-muted">Weekly Credit</h6>
                <h3 className="text-success fw-semibold">₱7,100.00</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-start border-4 border-primary">
              <div className="card-body">
                <h6 className="text-muted">Transactions</h6>
                <h3 className="text-primary fw-semibold">35</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
        <div className="card shadow-sm border-start border-4 border-warning">
          <div className="card-body">
            <h6 className="text-muted">Files Uploaded</h6>
            <h3 className="text-warning fw-semibold">12</h3>
          </div>
        </div>
      </div>
        </div>

<div className="mb-5">
  <h5 className="fw-semibold mb-3">Top 3 Contacts You Transact With:</h5>
  <div className="row g-4">
    {/* User 1 */}
    <Card sx={{ maxWidth: 320, borderRadius: 3, boxShadow: 3 ,margin: 2}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <PersonIcon />
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight="bold">
            Juana jones
          </Typography>
        }
        subheader="40 Transactions"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Most active user this week with consistent transaction history.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          View Transactions
        </Button>
      </CardActions>
    </Card>

    {/* User 2 */}
    <Card sx={{ maxWidth: 320, borderRadius: 3, boxShadow: 3 ,margin: 2}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <PersonIcon />
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight="bold">
            Jake Sinus
          </Typography>
        }
        subheader="98 Transactions"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Most active user this week with consistent transaction history.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          View Transactions
        </Button>
      </CardActions>
    </Card>

    {/* User 3 */}
    <Card sx={{ maxWidth: 320, borderRadius: 3, boxShadow: 3 , margin: 2}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <PersonIcon />
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight="bold">
            Maria Santos
          </Typography>
        }
        subheader="108 Transactions"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Most active user this week with consistent transaction history.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          View Transactions
        </Button>
      </CardActions>
    </Card>






          {/* Example Cards */}
          {/* <div className="row">
            <div className="col-md-6 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h1 className="mb-4">Total Debit</h1>
                  <p className="mb-0">Content goes here</p>
                </div>
              </div>
              
            </div>
            <div className="col-md-6 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h1 className="mb-4">Total Credit</h1>
                  <p className="mb-0">Content goes here</p>
                </div>
              </div>
              
            </div>
</div> */}
      </div>
    </div>
    </div>
    </div>
    </DashboardLayout>

  );
};

export default Dashboard;
