import React, { useState, ChangeEvent, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

interface Users {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  contact_number: string;
  profile_image_url?: string;
}
interface AccountNumber {
  id: number;
  account_number: string;
}

const ProfileSection: React.FC = () => {
  const [user, setUser] = useState<Users>({

    firstname: '',
    lastname: '',
    email: '',
    contact_number: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [accountNumbers, setAccountNumbers] = useState<AccountNumber[]>([]);
const [newAccount, setNewAccount] = useState("");
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user_id = localStorage.getItem('user_id');
      try {
        const response = await fetch(`http://localhost:3001/api/users/profile?user_id=${user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const userData: Users = await response.json();
        setUser(userData);
        console.log('Fetched user data:', userData);
        if (userData.profile_image_url) {
        setPreviewUrl(userData.profile_image_url);
      }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserAccounts = async () => {
    if (!user.id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/account-numbers?user_id=${user.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch account numbers');

      const data: AccountNumber[] = await response.json();
      setAccountNumbers(data);
    } catch (error) {
      console.error('Error fetching account numbers:', error);
    }
  };

  fetchUserAccounts();

    fetchUserData();
  }, [user.id]);
  

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setProfileImage(null);
      setPreviewUrl(null);
    }
  };

  // Handle form submit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('firstname', user.firstname);
  formData.append('lastname', user.lastname);
  formData.append('email', user.email);
  formData.append('contact_number', user.contact_number);

  if (profileImage) {
    formData.append('image', profileImage);
  }

  try {
    const user_id = localStorage.getItem('user_id');
    const response = await fetch(`http://localhost:3001/api/users/profile?user_id=${user_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to update profile');

    // Update each existing account number
for (const acct of accountNumbers) {
  if (!acct.id) {
    console.error("Missing account ID for:", acct);
    continue;
  }
  await fetch(`http://localhost:3001/api/account-numbers/${acct.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_number: acct.account_number }),
  });
}


    // Re-fetch account numbers to avoid stale duplicates
    const acctRes = await fetch(`http://localhost:3001/api/account-numbers?user_id=${user.id}`);
    if (acctRes.ok) {
      const freshAccounts: AccountNumber[] = await acctRes.json();
      setAccountNumbers(freshAccounts);
    }

    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
      const handleDeleteAccount = async (acctId: number) => {
  const confirmed = window.confirm('Are you sure you want to delete this account number? This action cannot be undone.');
  if (!confirmed) return;

  try {
    const res = await fetch(`http://localhost:3001/api/account-numbers/${acctId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (res.ok) {
      alert('Account number deleted successfully.');
      // Remove from state
      setAccountNumbers(prev => prev.filter(acct => acct.id !== acctId));
    } else {
      const errorData = await res.json();
      alert(`Failed to delete account number: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete account number.');
  }
};


  
    const handleAddAccount =  async (e: React.FormEvent) => {
      e.preventDefault();
       if (!newAccount.trim()) return;

      setAccountNumbers([
    ...accountNumbers,
    { id: 0, account_number: newAccount }
  ]);

        const response = await fetch('http://localhost:3001/api/account-numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ user_id: user.id, account_number: newAccount })
        });
        const data = await response.json();
        if (data.id) {
          setAccountNumbers(prev =>
            prev.map(acct =>
              acct.id === 0 && acct.account_number === newAccount
                ? { ...acct, id: data.id }
                : acct
            )
          );
        }

      setNewAccount(""); // Clear input
        

    };


  return (
    <DashboardLayout>
      <div className="auth-main">
        <div className="auth-wrapper v1 d-flex justify-content-center" style={{ width: '100%', padding: '1rem' }}>
          <div className="auth-form">
            <div className="position-relative">
              <div className="card login-card  profile-card-flex shadow rounded-4 mb-0" style={{ width: '100%', maxWidth: '600px' }}>
                <div className="card-body">
                  <h4 className="text-center fw-bold mb-3">Personal Details</h4>

                  <form onSubmit={handleSubmit} className='w-100'>
                    {/* Profile Image */}
                    <div className="row g-4">
                      <div className="col-md-6">
                    <div className="text-center mb-4">
                      <div
                        className="mx-auto d-flex align-items-center justify-content-center bg-light border rounded-circle overflow-hidden"
                        style={{ width: '100px', height: '100px' }}
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                            No Photo
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <label htmlFor="profileImageInput" className="text-primary small" style={{ cursor: 'pointer' }}>
                          Change photo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          id="profileImageInput"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    {/* First & Last Name */}
                    <div className="row">
                      <div className="col-sm-6 mb-3">
                        <label htmlFor="firstname" className="form-label">First Name</label>
                        <input
                          type="text"
                          name="firstname"
                          className="form-control"
                          value={user.firstname}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-6 mb-3">
                        <label htmlFor="lastname" className="form-label">Last Name</label>
                        <input
                          type="text"
                          name="lastname"
                          className="form-control"
                          value={user.lastname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="text"
                        name="email"
                        className="form-control"
                        value={user.email}
                        onChange={handleChange}
                      />
                    </div>

                    </div>
                    <div className="col-md-6">
  
                    {/* Contact Number */}
                    <div className="mb-3">
                      <label htmlFor="contact_number" className="form-label"> Add Account Number</label>
                      <div className='d-flex gap-2'>
                      <input
                        type="text"
                        name="contact_number"
                        className="form-control"
                        placeholder='Enter account number'
                        value={newAccount}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setNewAccount(onlyNums)}}
                        maxLength={11}
                        pattern="09\d{9}"
                      />
                       <button type="submit" className="btn btn-primary shadow px-sm-4" onClick ={handleAddAccount}>
                        Add
                      </button>
                    </div>    
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contact_number" className="form-label">Account Number</label>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Account Number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountNumbers.map((acct, idx) => (
                        <tr key={`${acct.id}-${idx}`}>
                          <td>
                            <input
                              type="text"
                              name="account_number"
                              className="form-control"
                              value={acct.account_number}
                              onChange={(e) => {
                                const onlyNums = e.target.value.replace(/\D/g, '');
                                const updated = [...accountNumbers];
                                updated[idx].account_number = onlyNums;
                                console.log('Updated account number:', updated[idx]);
                                setAccountNumbers(updated);
                              }}
                              maxLength={11}
                              pattern="09\d{9}"
                            />
                          </td>
                          <td><button
                            className="btn btn-danger"
                            onClick={() => handleDeleteAccount(acct.id)}>
                            Delete
                          </button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                    </div> 
                    </div>
                    </div>
                    <div className="text-center mt-4">
                      <button type="submit" className="btn btn-primary shadow px-sm-4">
                        Save
                      </button>
                    </div>
                    
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSection;
