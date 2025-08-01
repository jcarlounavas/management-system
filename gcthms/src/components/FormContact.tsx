import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FormContact = () => {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!name.trim() || !/^\d{11}$/.test(contactNumber)) {
      alert('Please enter a valid name and an 11-digit contact number.');
      return;
    }

 setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, contactNumber }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save contact');
      }

      alert('Contact saved successfully!');
      setName('');
      setContactNumber('');
      navigate('/contacts');
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-main"
      data-pc-preset="preset-1"
      data-pc-sidebar-caption="true"
      data-pc-direction="ltr"
      data-pc-theme="light"
    >
      {/* Pre-loader */}
      {loading && ( 
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>
      )}

      {/* Auth wrapper */}
      <div className="auth-wrapper v1">
        <div className="auth-form">
          <div className="position-relative">
            <div className="card login-card animate__animated animate__fadeInDown shadow rounded-4 card mb-0">
              <div className="card-body">
                <h4 className="text-center f-w-500 mt-4 mb-3">Add Contact</h4>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Contact Number"
                    maxLength={11}
                    pattern="\d{11}"
                    title="Please enter exactly 11 digits"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>

                <div className="d-flex mt-1 justify-content-between">
                  <div className="form-check">
                    <input
                      className="form-check-input input-primary"
                      type="checkbox"
                      id="customCheckc1"
                      defaultChecked
                    />
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-primary shadow px-sm-4"
                    onClick={handleSave}
                  >
                    Save Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default FormContact;
