import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

interface Contact {
  id: number;
  name: string;
  contact_number: string;
  created_at: string;
  avatar: string;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id; // adjust field name

  if (!userId) return;

  fetch(`http://localhost:3001/api/contacts?user_id=${userId}`)
    .then((res) => res.json())
    .then((data) => setContacts(data))
    .catch((err) => console.error('Failed to fetch contacts:', err));
}, []);

  return (
    <DashboardLayout>
      <div className="pc-container">
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="card-header">
                <h2 className="text-center">Contacts</h2>
              </div>
            </div>
          </div>

          <div className="align-items-center justify-content-center text-center mb-2">
            <Link to="/contacts/new" className="btn btn-primary shadow text-center" target="_blank">
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
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr className="unread" key={contact.id}>
                            <td></td>
                            <td>
                              <h6 className="mb-1">{contact.name}</h6>
                              <p className="m-0">{contact.contact_number}</p>
                            </td>
                            <td className="text-center">
                              <Link
                                to={`/contacts/${contact.id}/transactions`}
                                className="badge me-2 bg-brand-color-2 text-white f-12"
                                target="_blank"
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
