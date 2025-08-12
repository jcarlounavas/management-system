import React, { useState, ChangeEvent, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

interface Users {
  firstname: string;
  lastname: string;
  email: string;
  contact_number: string;
  profile_image_url?: string;
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

    fetchUserData();
  }, []);

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

      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="auth-main">
        <div className="auth-wrapper v1">
          <div className="auth-form">
            <div className="position-relative">
              <div className="card login-card shadow rounded-4 mb-0">
                <div className="card-body">
                  <h4 className="text-center fw-bold mb-3">Personal Details</h4>

                  <form onSubmit={handleSubmit}>
                    {/* Profile Image */}
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

                    {/* Contact Number */}
                    <div className="mb-3">
                      <label htmlFor="contact_number" className="form-label">Account Number</label>
                      <input
                        type="text"
                        name="contact_number"
                        className="form-control"
                        value={user.contact_number}
                        onChange={handleChange}
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
