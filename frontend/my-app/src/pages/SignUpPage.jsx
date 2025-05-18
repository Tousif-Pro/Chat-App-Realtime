import React, { useState } from 'react';
import { Container, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import './AuthPages.css';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please check all required fields');
      return;
    }

    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Sign up failed. Please try again.';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  return (
    <Container fluid className="auth-container p-0">
      <Row className="h-100 g-0">
        <Col md={5} className="d-flex align-items-center justify-content-center">
          <div className="login-wrapper">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="login-box"
            >
              <div className="login-header text-center mb-4">
                <h2 className="h4 mb-2">Create Account</h2>
                <p className="text-muted small">Join our community today</p>
              </div>

              <Form noValidate onSubmit={handleSubmit} className="login-form">
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    isInvalid={!!errors.fullName}
                    className="custom-input"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    isInvalid={!!errors.email}
                    className="custom-input"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="password-input-group">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      isInvalid={!!errors.password}
                      className="custom-input"
                    />
                    <Button
                      variant="link"
                      className="password-toggle-new"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="login-button w-100"
                  disabled={isSigningUp}
                >
                  {isSigningUp ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="divider">
                  <span>or sign up with</span>
                </div>

                <div className="social-login-buttons">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="social-btn facebook"
                    onClick={() => toast.info('Facebook signup coming soon!')}
                  >
                    <FaFacebook size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="social-btn google"
                    onClick={() => toast.info('Google signup coming soon!')}
                  >
                    <FaGoogle size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="social-btn github"
                    onClick={() => toast.info('GitHub signup coming soon!')}
                  >
                    <FaGithub size={16} />
                  </motion.button>
                </div>

                <p className="text-center mt-4 mb-0">
                  <small className="text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="signup-link">
                      Sign in
                    </Link>
                  </small>
                </p>
              </Form>
            </motion.div>
          </div>
        </Col>

        <Col md={7} className="right-section">
          <motion.div 
            className="feature-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-wrapper">
              <h2 className="feature-title">Welcome to ByteWizster</h2>
              <p className="feature-description">Join our community and experience:</p>
              
              <motion.div 
                className="feature-items"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.15
                    }
                  }
                }}
              >
                <motion.div 
                  className="feature-item"
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="feature-icon">
                    <img src="/icons/rocket.png" alt="Performance" className="feature-img" />
                  </div>
                  <div className="feature-text">
                    <h3>Lightning Fast Performance</h3>
                    <p>Experience seamless and responsive interactions</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="feature-item"
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="feature-icon">
                    <img src="/icons/shield.png" alt="Security" className="feature-img" />
                  </div>
                  <div className="feature-text">
                    <h3>Enhanced Security</h3>
                    <p>Your data is protected with state-of-the-art encryption</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="feature-item"
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="feature-icon">
                    <img src="/icons/target.png" alt="Features" className="feature-img" />
                  </div>
                  <div className="feature-text">
                    <h3>Smart Features</h3>
                    <p>Access to powerful tools and analytics</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
          <div className="animated-background">
            <div className="gradient-circle circle-1"></div>
            <div className="gradient-circle circle-2"></div>
            <div className="gradient-circle circle-3"></div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUpPage;

