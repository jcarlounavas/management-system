import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

interface Contact {
  id: number;
  name: string;
  phone: string;
  created_at: string;
  avatar: string;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    // Replace this fetch with your actual API endpoint
    fetch('http://localhost:3001/api/all/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(err => console.error('Failed to load contacts:', err));
  }, []);

  return (
    <DashboardLayout>
      <div className="pc-container">
        <div className="pc-content">
          <div className="page-header mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className='text-center'>Contacts</h1>
            </div>
          </div>
          <div className="align-items-center justify-content-center text-center mb-2">
              <Link to="/contacts/new" className="btn btn-primary shadow text-center">
                Add Contact
              </Link>
          </div>

          <div className="row justify-content-center">
            <div className="col-xl-10 col-md-12">
              <div className="card Recent-Users table-card">
                <div className="card-body px-0 py-3">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th></th>
                          <th>Name with Phone No.</th>
                          <th className='text-center'>Action</th>
                        </tr>
                        
                        </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr className="unread" key={contact.id}>
                            <td>
                              {/* <img
                                className="rounded-circle"
                                style={{ width: 40 }}
                                src={`../assets/images/user/${contact.avatar}`}
                                alt="user"
                              /> */}
                            </td>
                            <td>
                              <h6 className="mb-1">{contact.name}</h6>
                              <p className="m-0">{contact.phone}</p>
                            </td>

                            <td className='text-center'>
                              <Link
                                to={`/contacts/${contact.id}/transactions`}
                                className="badge me-2 bg-brand-color-2 text-white f-12"
                                target='_blank'
                              >
                                See All Transactions
                              </Link>
                            </td>
                          </tr>
                        ))}
                        {contacts.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No contacts available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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

export default Contacts;
