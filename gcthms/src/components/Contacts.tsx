import React from 'react';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

const Contacts: React.FC = () => {
    return (
        <>
<DashboardLayout>
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
        <div className="pc-container">
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="row align-items-center">
                <div className="col-md-12">

                </div>
              </div>
            </div>
          </div>
<div className="container">
        <div className="row justify-content-center" >
                  <div className="col-xl-8 col-md-6">
      <div className="card Recent-Users table-card">
        <div className="card-header">
          <h1 className='text-center'>Contacts</h1>
        </div>
        <div className="card-body px-0 py-3">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <tbody>
                {[
                  {
                    name: 'Isabella Christensen',
                    desc: 'Lorem Ipsum is simply dummy',
                    time: '11 MAY 12:56',
                    status: 'text-success',
                    avatar: 'avatar-1.png',
                  },
                  {
                    name: 'Mathilde Andersen',
                    desc: 'Lorem Ipsum is simply',
                    time: '11 MAY 10:35',
                    status: 'text-danger',
                    avatar: 'avatar-2.png',
                  },
                  {
                    name: 'Karla Sorensen',
                    desc: 'Lorem Ipsum is simply dummy',
                    time: '9 MAY 17:38',
                    status: 'text-success',
                    avatar: 'avatar-3.png',
                  },
                  {
                    name: 'Ida Jorgensen',
                    desc: 'Lorem Ipsum is simply',
                    time: '19 MAY 12:56',
                    status: 'text-danger',
                    avatar: 'avatar-1.png',
                  },
                  {
                    name: 'Albert Andersen',
                    desc: 'Lorem Ipsum is',
                    time: '21 July 12:56',
                    status: 'text-success',
                    avatar: 'avatar-2.png',
                  },
                ].map((user, index) => (
                  <tr className="unread" key={index}>
                    <td>
                      <img
                        className="rounded-circle"
                        style={{ width: 40 }}
                        src={`../assets/images/user/${user.avatar}`}
                        alt="activity-user"
                      />
                    </td>
                    <td>
                      <h6 className="mb-1">{user.name}</h6>
                      <p className="m-0">{user.desc}</p>
                    </td>
                    <td>
                      <h6 className="text-muted">
                        <i className={`ti ti-circle-filled ${user.status} f-10 m-r-15`}></i>
                        {user.time}
                      </h6>
                    </td>
                    <td>
                      <a href="#!" className="badge me-2 bg-brand-color-2 text-white f-12">
                        See All Transactions
                      </a>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
        </div>
      </div>
        
        </div>
      </div>
    
    
    </div>

      

</DashboardLayout>
        </>
    
    );
};

export default Contacts;