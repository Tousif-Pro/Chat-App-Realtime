import React, { useState } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import './AuthPages.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  return (
    <Container fluid className="auth-container p-0">
      <div className="login-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-box"
        >
          <div className="login-header text-center">
            <h2 className="welcome-text">Welcome Back!</h2>
            <p className="text-muted">Sign in to continue your journey</p>
          </div>

          <Form noValidate onSubmit={handleSubmit} className="login-form">
            <Form.Group className="form-floating mb-4">
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                isInvalid={!!errors.email}
                className="custom-input"
              />
              <Form.Label>Email address</Form.Label>
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="form-floating mb-4">
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
                <Form.Label>Password</Form.Label>
                <Button
                  variant="link"
                  className="password-toggle-new"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <Form.Check
                type="checkbox"
                label="Remember me"
                className="modern-checkbox"
              />
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="login-button w-100"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-login-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="social-btn facebook"
                onClick={() => toast.info('Facebook login coming soon!')}
              >
                <FaFacebook />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="social-btn google"
                onClick={() => toast.info('Google login coming soon!')}
              >
                <FaGoogle />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="social-btn github"
                onClick={() => toast.info('GitHub login coming soon!')}
              >
                <FaGithub />
              </motion.button>
            </div>

            <p className="text-center mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="signup-link">
                Create an account
              </Link>
            </p>
          </Form>
        </motion.div>
      </div>
    </Container>
  );
};

export default LoginPage;
