import React, { useState, ChangeEvent } from 'react';
import DashboardLayout from './DashboardLayout';

const ProfileSection: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: ''
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saved data:', formData);
    console.log('Selected image:', profileImage);
    
  };

  return (
    <DashboardLayout>
        <div className="auth-main">
      
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      
      <div className="auth-wrapper v1">
        <div className="auth-form">
          <div className="position-relative">
            <div className="card login-card animate__animated animate__fadeInDown shadow rounded-4 mb-0">
              <div className="card-body">

                <h4 className="text-center fw-bold mb-3">Personal Details</h4>

                <form onSubmit={handleSubmit}>
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
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>No Photo</span>
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

                  <div className="row">
                    <div className="col-sm-6 mb-3">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        className="form-control"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        className="form-control"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      id="contactNumber"
                      inputMode="numeric"
                      maxLength={11}
                      pattern="\d{11}"
                      className="form-control"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Contact Number"
                      required
                    />
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
