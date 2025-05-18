import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
      
      
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: '#f8f9fa',
      padding: '1rem'
    }}>
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7}>
            <Card className="shadow" style={{ borderRadius: '15px', border: 'none' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#2c3e50' }}>Profile</h2>
                  <p className="text-muted" style={{ fontSize: '1rem' }}>Your profile information</p>
                </div>

                {/* Profile Image Section */}
                <div className="text-center mb-5">
                  <div className="position-relative d-inline-block">
                    <img
                      src={selectedImg || authUser?.profilePic || "/avatar.png"}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ 
                        width: '180px', 
                        height: '180px', 
                        objectFit: 'cover', 
                        border: '5px solid #fff',
                        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
                      }}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="position-absolute"
                      style={{
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: '#007bff',
                        padding: '10px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        opacity: isUpdatingProfile ? '0.7' : '1',
                        transition: 'all 0.2s ease',
                        zIndex: 2
                      }}
                    >
                      <Camera className="text-white" size={24} />
                      <Form.Control
                        type="file"
                        id="avatar-upload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUpdatingProfile}
                      />
                    </label>
                  </div>
                  <p className="text-muted small mt-3">
                    {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
                  </p>
                </div>

                {/* Profile Information */}
                <div className="px-lg-5">
                  <Form>
                    <Form.Group className="mb-4">
                      <Form.Label className="text-muted d-flex align-items-center gap-2 mb-2">
                        <User size={18} />
                        <span style={{ fontSize: '0.95rem' }}>Full Name</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={authUser?.fullName}
                        readOnly
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          padding: '0.75rem',
                          borderRadius: '8px'
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-muted d-flex align-items-center gap-2 mb-2">
                        <Mail size={18} />
                        <span style={{ fontSize: '0.95rem' }}>Email Address</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={authUser?.email}
                        readOnly
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          padding: '0.75rem',
                          borderRadius: '8px'
                        }}
                      />
                    </Form.Group>
                  </Form>

                  {/* Account Information */}
                  <Card style={{ 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #dee2e6',
                    borderRadius: '12px',
                    marginTop: '2rem'
                  }}>
                    <Card.Body className="p-4">
                      <h5 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        color: '#2c3e50',
                        marginBottom: '1rem'
                      }}>
                        Account Information
                      </h5>
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted">Member Since</span>
                        <span style={{ color: '#2c3e50' }}>{authUser?.createdAt?.split("T")[0]}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2">
                        <span className="text-muted">Account Status</span>
                        <span style={{ color: '#28a745' }}>Active</span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;