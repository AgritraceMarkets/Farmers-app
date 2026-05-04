import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import api from './services/api';
import authService from './services/auth';
import LoadingSpinner from './components/LoadingSpinner';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import notificationService from './services/notificationService';
import { 
  validateEmail, 
  validatePhone, 
  validatePassword,
  validateName,
  validateLandSize,
  validatePlantingDate,
  validateRequired,
  getErrorMessage,
  formatPhoneNumber
} from './utils/validation';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

const App = () => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [activePanel, setActivePanel] = useState('profile');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
// Notification state
const [notificationPermission, setNotificationPermission] = useState(false);
const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  // Data state
  const [cropTypes, setCropTypes] = useState([]);
  const [plantings, setPlantings] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);

  // Location state
  const [location, setLocation] = useState({ lat: -6.7924, lng: 39.2083 });
  const [address, setAddress] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Auth forms state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'Farmer'
  });

  // New planting form
  const [newPlanting, setNewPlanting] = useState({
    crop_id: '',
    land_size_acres: '',
    planting_date: '',
    latitude: '',
    longitude: '',
    region_name: '',
    notes: ''
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      setIsLoggedIn(true);
      fetchInitialData();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [isLoggedIn]);
// Request notification permission when logged in
useEffect(() => {
  if (isLoggedIn) {
    // Check current permission status
    const currentPermission = notificationService.getPermissionStatus();
    setNotificationPermission(currentPermission === 'granted');
    
    // Only show banner if not granted and not denied
    if (currentPermission === 'default') {
      setShowNotificationBanner(true);
    }
  }
}, [isLoggedIn]);

// Check for upcoming events and send notifications
useEffect(() => {
  if (isLoggedIn && dashboardSummary?.upcoming_events?.length > 0 && notificationPermission) {
    console.log('Checking for upcoming events...', dashboardSummary.upcoming_events);
    notificationService.checkUpcomingEvents(dashboardSummary.upcoming_events);
    notificationService.clearOldNotifications();
  }
}, [dashboardSummary, notificationPermission, isLoggedIn]);
  // Validation functions
  const validateRegistrationField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!validateRequired(value)) return 'required';
        if (!validateName(value)) return 'invalid';
        break;
      case 'email':
        if (!validateRequired(value)) return 'required';
        if (!validateEmail(value)) return 'invalid';
        break;
      case 'phone_number':
        if (!validateRequired(value)) return 'required';
        if (!validatePhone(value)) return 'invalid';
        break;
      case 'password':
        if (!validateRequired(value)) return 'required';
        if (!validatePassword(value)) return 'weak';
        break;
      default:
        return null;
    }
    return null;
  };

  const validatePlantingField = (name, value, allValues = {}) => {
    switch (name) {
      case 'crop_id':
        if (!validateRequired(value)) return 'required';
        break;
      case 'land_size_acres':
        if (!validateRequired(value)) return 'required';
        if (!validateLandSize(value)) return 'invalid';
        break;
      case 'planting_date':
        if (!validateRequired(value)) return 'required';
        if (!validatePlantingDate(value)) return 'invalid';
        break;
      case 'latitude':
        if (!value && !allValues.latitude) return 'required';
        break;
      default:
        return null;
    }
    return null;
  };

  const handleBlur = (field, value, formType = 'register') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    let error = null;
    if (formType === 'register') {
      error = validateRegistrationField(field, value);
    } else if (formType === 'planting') {
      error = validatePlantingField(field, value, newPlanting);
    }
    
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: getErrorMessage(
          field === 'full_name' ? 'name' : 
          field === 'phone_number' ? 'phone' : 
          field === 'land_size_acres' ? 'landSize' :
          field === 'planting_date' ? 'plantingDate' :
          field === 'crop_id' ? 'cropType' : field,
          error
        )
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          const currentMap = markerRef.current ? markerRef.current.getMap() : null;
          updateLocation(newLocation, currentMap);
          
          if (!window.google) {
            setAddress(`${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)}`);
          }
          setLoading(false);
        },
        (err) => {
          setError('Failed to get current location: ' + err.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };


  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    setNewPlanting(prev => ({
      ...prev,
      latitude: newLocation.lat,
      longitude: newLocation.lng
    }));
    
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
          setNewPlanting(prev => ({
            ...prev,
            region_name: results[0].formatted_address
          }));
        }
      });
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCropTypes(),
        fetchMyPlantings(),
        fetchDashboardSummary(),
        fetchMarketplaceListings(),
        fetchFarmerOrders()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerOrders = async () => {
    try {
      const response = await api.farmer.getOrders();
      setFarmerOrders(response.data || []);
    } catch (err) {
      throw err;
    }
  };

  const fetchCropTypes = async () => {
    try {
      const response = await api.crops.getAllCrops();
      setCropTypes(response.data);
    } catch (err) {
      throw err;
    }
  };

  const fetchMyPlantings = async () => {
    try {
      const response = await api.farmer.getPlantingHistory();
      setPlantings(response.data || []);
    } catch (err) {
      throw err;
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const response = await api.farmer.getDashboard();
      setDashboardSummary(response.data);
    } catch (err) {
      throw err;
    }
  };

  const fetchMarketplaceListings = async () => {
    try {
      const response = await api.marketplace.getMyListings();
      setMarketplaceListings(response.data || []);
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const response = await api.auth.login(loginData);
    
    authService.setToken(response.token);
    authService.setUser(response.user);
    setUser(response.user);
    setIsLoggedIn(true);
    
    await fetchInitialData();
    
    // Make sure we set the correct panel and show it
    setActivePanel('profile');  // Set to profile
    setShowPanel(true);         // Show the panel
    
    // Reset any validation errors
    setValidationErrors({});
    setTouchedFields({});
    
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e) => {
  e.preventDefault();
  
  // Validate all fields before submission
  const errors = {};
  Object.keys(registerData).forEach(key => {
    if (key !== 'role') {
      const error = validateRegistrationField(key, registerData[key]);
      if (error) {
        errors[key] = getErrorMessage(
          key === 'full_name' ? 'name' : 
          key === 'phone_number' ? 'phone' : key,
          error
        );
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await api.auth.register(registerData);
    
    // Store the token and user data
    authService.setToken(response.token);
    authService.setUser(response.user);
    
    // Show success message
    setError(null); // Clear any previous errors
    
    // Reset registration form
    setRegisterData({
      full_name: '',
      email: '',
      phone_number: '',
      password: '',
      role: 'Farmer'
    });
    
    // Reset validation
    setValidationErrors({});
    setTouchedFields({});
    
    // Switch to login panel
    setActivePanel('login');
    
    // Show success message (optional)
    setSuccessMessage('Registration successful! Please login with your credentials.');
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setPlantings([]);
    setCropTypes([]);
    setDashboardSummary(null);
    setMarketplaceListings([]);
    setShowPanel(false);
  };

  // ===== UPDATED FUNCTION: handlePlantingSubmit =====
  const handlePlantingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const errors = {};
    Object.keys(newPlanting).forEach(key => {
      if (key !== 'notes' && key !== 'region_name' && key !== 'latitude' && key !== 'longitude') {
        const error = validatePlantingField(key, newPlanting[key], newPlanting);
        if (error) {
          errors[key] = getErrorMessage(
            key === 'land_size_acres' ? 'landSize' : 
            key === 'planting_date' ? 'plantingDate' :
            key === 'crop_id' ? 'cropType' : key,
            error
          );
        }
      }
    });

    // Check if location is provided (either through map or manual)
    const useManual = document.getElementById('useManualLocation')?.checked;
    
    if (useManual) {
      // Validate manual location
      if (!newPlanting.region_name && !address) {
        errors.location = 'Please enter your farm location';
      }
    } else {
      // Validate map location
      if (!address && !newPlanting.latitude) {
        errors.location = 'Please select a location on the map or switch to manual entry';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plantingData = {
        crop_id: parseInt(newPlanting.crop_id),
        land_size_acres: parseFloat(newPlanting.land_size_acres),
        planting_date: newPlanting.planting_date,
        notes: newPlanting.notes || ''
      };

      // Add location data based on which method was used
      if (useManual) {
        plantingData.region_name = newPlanting.region_name || address;
        if (newPlanting.latitude && newPlanting.longitude) {
          plantingData.latitude = parseFloat(newPlanting.latitude);
          plantingData.longitude = parseFloat(newPlanting.longitude);
        }
      } else {
        plantingData.latitude = location.lat;
        plantingData.longitude = location.lng;
        plantingData.region_name = address || 'Location selected on map';
      }

      const response = await api.farmer.savePlanting(plantingData);
      
      await fetchMyPlantings();
      
      // Reset form
      setNewPlanting({
        crop_id: '',
        land_size_acres: '',
        planting_date: '',
        latitude: '',
        longitude: '',
        region_name: '',
        notes: ''
      });
      setAddress('');
      setValidationErrors({});
      setTouchedFields({});
      
      // Reset location toggle to map view
      const manualSection = document.getElementById('manual-location-section');
      const mapSection = document.getElementById('map-location-section');
      if (manualSection && mapSection) {
        manualSection.style.display = 'none';
        mapSection.style.display = 'block';
        const checkbox = document.getElementById('useManualLocation');
        if (checkbox) checkbox.checked = false;
      }
      
      setShowPanel(false);
      setActivePanel('profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPlantingDetails = async (id) => {
    setLoading(true);
    try {
      const response = await api.farmer.getPlantingDetails(id);
      setSelectedCrop(response.data);
      setShowCalendar(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePlantingStatus = async (id, status) => {
    let extraData = {};
    if (status === 'Harvested') {
      const actualYield = prompt('Enter actual harvested quantity (kg):');
      if (actualYield === null) return; // Cancelled
      extraData.actual_yield_kg = parseFloat(actualYield);
    }

    setLoading(true);
    try {
      await api.farmer.updatePlantingStatus(id, status, extraData);
      await fetchMyPlantings();
      await fetchMarketplaceListings();
      await fetchFarmerOrders(); // Refresh orders too
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = (panelName) => {
    setActivePanel(panelName);
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setValidationErrors({});
    setTouchedFields({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !isLoggedIn) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-background"></div>
        {successMessage && (
  <div className="success-banner">
    <i className="fas fa-check-circle"></i>
    <p>{successMessage}</p>
  </div>
)}
        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
{/* Notification Permission Banner */}
{showNotificationBanner && !notificationPermission && (
  <div className="notification-banner">
    <i className="fas fa-bell"></i>
    <div className="notification-banner-content">
      <h4>Get Task Reminders</h4>
      <p>Enable notifications to never miss a farming task</p>
    </div>
    <button onClick={async () => {
      const granted = await notificationService.requestPermission();
      setNotificationPermission(granted);
      setShowNotificationBanner(false);
    }}>
      Enable
    </button>
  </div>
)}
        <div className="auth-card animate-fadeIn">
          <div className="auth-header">
            <h1>🌾 AgriTrace Farmers App</h1>
            <p>Connect directly with farmers for future harvests</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={activePanel === 'login' ? 'active' : ''}
              onClick={() => setActivePanel('login')}
            >
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
            <button 
              className={activePanel === 'register' ? 'active' : ''}
              onClick={() => setActivePanel('register')}
            >
              <i className="fas fa-user-plus"></i> Register
            </button>
          </div>

          {activePanel === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input
                  type="email"
                  placeholder="farmer@agritrace.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="forgot-password-link">
                <button 
                  type="button"
                  className="link-btn"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label><i className="fas fa-user"></i> Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={registerData.full_name}
                  onChange={(e) => setRegisterData({...registerData, full_name: e.target.value})}
                  onBlur={(e) => handleBlur('full_name', e.target.value, 'register')}
                  className={touchedFields.full_name && validationErrors.full_name ? 'error' : ''}
                  required
                  disabled={loading}
                />
                {touchedFields.full_name && validationErrors.full_name && (
                  <span className="error-text">{validationErrors.full_name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  onBlur={(e) => handleBlur('email', e.target.value, 'register')}
                  className={touchedFields.email && validationErrors.email ? 'error' : ''}
                  required
                  disabled={loading}
                />
                {touchedFields.email && validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Phone Number</label>
                <input
                  type="tel"
                  placeholder="0712345678"
                  value={registerData.phone_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setRegisterData({...registerData, phone_number: value});
                  }}
                  onBlur={(e) => handleBlur('phone_number', e.target.value, 'register')}
                  className={touchedFields.phone_number && validationErrors.phone_number ? 'error' : ''}
                  required
                  disabled={loading}
                  maxLength="12"
                />
                {touchedFields.phone_number && validationErrors.phone_number ? (
                  <span className="error-text">{validationErrors.phone_number}</span>
                ) : registerData.phone_number && validatePhone(registerData.phone_number) && (
                  <span className="hint-text">Formatted: {formatPhoneNumber(registerData.phone_number)}</span>
                )}
              </div>
              
              {/* Replace the password field section with this simpler version */}
<div className="form-group">
  <label><i className="fas fa-lock"></i> Password</label>
  <input
    type="password"
    placeholder="••••••••"
    value={registerData.password}
    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
    onBlur={(e) => handleBlur('password', e.target.value, 'register')}
    className={touchedFields.password && validationErrors.password ? 'error' : ''}
    required
    disabled={loading}
    minLength="6"
  />
  {touchedFields.password && validationErrors.password ? (
    <span className="error-text">{validationErrors.password}</span>
  ) : registerData.password && (
    <div className="password-requirements">
      <span className={`req ${registerData.password.length >= 6 ? 'met' : ''}`}>
        <i className="fas fa-check-circle"></i> {registerData.password.length}/6+ chars
      </span>
      <span className={`req ${registerData.password.length >= 8 ? 'met' : ''}`}>
        <i className="fas fa-check-circle"></i> Strong password
      </span>
    </div>
  )}
</div>
              <button 
                type="submit" 
                className="btn-primary btn-block"
                disabled={loading || Object.keys(validationErrors).length > 0}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>

        <ForgotPasswordModal 
          isOpen={showForgotPassword}
          onClose={() => {
            setShowForgotPassword(false);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <header className="main-header">
        <div className="header-content">
          <h1>🌾 AgriTrace Farmers App</h1>
          <div className="header-actions">
            <button className="icon-btn-text" onClick={() => togglePanel('profile')}>
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
            <button className="icon-btn-text" onClick={() => togglePanel('register')}>
              <i className="fas fa-plus-circle"></i>
              <span>New Planting</span>
            </button>
            <button className="icon-btn-text" onClick={() => togglePanel('calendar')}>
              <i className="fas fa-calendar-alt"></i>
              <span>Calendar</span>
            </button>
            <button className="icon-btn-text" onClick={() => togglePanel('marketplace')}>
              <i className="fas fa-store"></i>
              <span>My Market</span>
            </button>
            <button className="icon-btn-text" onClick={() => togglePanel('orders')}>
              <i className="fas fa-shopping-basket"></i>
              <span>Orders</span>
              {farmerOrders.length > 0 && (
                <span className="notification-badge">{farmerOrders.length}</span>
              )}
            </button>
            <button className="icon-btn-text help-btn" onClick={() => togglePanel('help')}>
              <i className="fas fa-question-circle"></i>
              <span>Help</span>
            </button>
            <button className="icon-btn logout" onClick={handleLogout} title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading ? (
          <LoadingSpinner message="Loading your farm data..." />
        ) : (
          <div className="dashboard animate-fadeIn">
            <div className="welcome-section">
              <div className="welcome-text">
                <h2>Welcome back, {user?.full_name}! 👨‍🌾</h2>
                <p>Here's what's happening on your farm today</p>
              </div>
            </div>

            {dashboardSummary && (
              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-seedling stat-icon"></i>
                  <div className="stat-info">
                    <h3>Total Plantings</h3>
                    <p className="stat-value">{dashboardSummary.summary.total_plantings}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-sprout stat-icon"></i>
                  <div className="stat-info">
                    <h3>Active Plantings</h3>
                    <p className="stat-value">{dashboardSummary.summary.active_plantings}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-weight-hanging stat-icon"></i>
                  <div className="stat-info">
                    <h3>Expected Yield</h3>
                    <p className="stat-value">{Number(dashboardSummary.summary.total_expected_yield || 0).toFixed(0)} kg</p>
                  </div>
                </div>
              </div>
            )}

            {dashboardSummary?.upcoming_events?.length > 0 && (
              <div className="upcoming-events">
                <h3>Upcoming Events (Next 7 Days)</h3>
                <div className="events-list">
                  {dashboardSummary.upcoming_events.map((event, index) => (
                    <div key={index} className="event-card">
                      <div className="event-icon">
                        <i className="fas fa-calendar-check"></i>
                      </div>
                      <div className="event-details">
                        <h4>{event.stage_name}</h4>
                        <p>{event.crop_name}</p>
                        <div className="event-meta">
                          <span><i className="fas fa-clock"></i> {event.days_remaining} days left</span>
                          <span><i className="fas fa-calendar"></i> {formatDate(event.event_date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="recent-plantings">
              <h3>Your Plantings</h3>
              {plantings.length === 0 ? (
                <div className="empty-state">
                  <img src="/images/empty-plantings.jpg" alt="No plantings" />
                  <p>You haven't registered any plantings yet</p>
                  <button className="btn-primary" onClick={() => togglePanel('register')}>
                    Register Your First Planting
                  </button>
                </div>
              ) : (
                <div className="plantings-grid">
                  {plantings.map(planting => (
                    <div key={planting.id} className="planting-card">
                      <img 
                        src={cropTypes.find(c => c.id === planting.crop_id)?.image_url || '/images/crops/default.jpg'} 
                        alt={planting.crop_name}
                        onError={(e) => e.target.src = '/images/crops/default.jpg'}
                      />
                      <div className="planting-info">
                        <h4>{planting.crop_name}</h4>
                        <div className="planting-meta">
                          <span><i className="fas fa-ruler"></i> {planting.land_size_acres} acres</span>
                          <span><i className="fas fa-weight"></i> {planting.expected_yield_kg} kg</span>
                          <span className={`status-badge status-${planting.status?.toLowerCase()}`}>
                            {planting.status}
                          </span>
                        </div>
                        <p className="planting-date">
                          <i className="fas fa-calendar"></i> Planted: {formatDate(planting.planting_date)}
                        </p>
                        <div className="planting-actions">
                          <button 
                            className="btn-secondary btn-small"
                            onClick={() => viewPlantingDetails(planting.id)}
                          >
                            View Calendar
                          </button>
                          {planting.status === 'Pending' && (
                            <button 
                              className="btn-primary btn-small"
                              onClick={() => updatePlantingStatus(planting.id, 'Planted')}
                            >
                              Mark as Planted
                            </button>
                          )}
                          {planting.status === 'Growing' && (
                            <button 
                              className="btn-primary btn-small"
                              onClick={() => updatePlantingStatus(planting.id, 'Harvested')}
                            >
                              Mark as Harvested
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {marketplaceListings.length > 0 && (
              <div className="marketplace-preview">
                <h3>Your Marketplace Listings</h3>
                <div className="listings-preview">
                  {marketplaceListings.slice(0, 3).map(listing => (
                    <div key={listing.id} className="listing-preview-card">
                      <h4>{listing.crop_name}</h4>
                      <p>{listing.available_quantity_kg} kg available</p>
                      <p className="listing-price">kSh {listing.price_per_kg}/kg</p>
                      <span className={`status-badge status-${listing.listing_status?.toLowerCase()}`}>
                        {listing.listing_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <div className={`sliding-panel ${showPanel ? 'open' : ''}`}>
        <div className="panel-header">
          <h2>
            {activePanel === 'profile' && <><i className="fas fa-user"></i> Profile</>}
            {activePanel === 'register' && <><i className="fas fa-seedling"></i> Register Planting</>}
            {activePanel === 'calendar' && <><i className="fas fa-calendar"></i> Growth Calendar</>}
            {activePanel === 'marketplace' && <><i className="fas fa-store"></i> Marketplace</>}
            {activePanel === 'orders' && <><i className="fas fa-shopping-basket"></i> Received Orders</>}
            {activePanel === 'help' && <><i className="fas fa-question-circle"></i> Help & Support</>}
          </h2>
          <button className="close-btn" onClick={closePanel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="panel-content">
          {activePanel === 'orders' && (
            <div className="orders-panel">
              <h3>Customer Orders</h3>
              {farmerOrders.length === 0 ? (
                <div className="empty-state">
                  <img src="/images/empty-orders.jpg" alt="No orders" />
                  <p>No orders received yet</p>
                </div>
              ) : (
                <div className="orders-list">
                  {farmerOrders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h4>Order #{order.id}</h4>
                        <span className={`status-badge status-${order.escrow_status?.toLowerCase()}`}>
                          {order.escrow_status}
                        </span>
                      </div>
                      <div className="order-details">
                        <p><strong>Crop:</strong> {order.crop_name}</p>
                        <p><strong>Quantity:</strong> {order.quantity_ordered_kg} kg</p>
                        <p><strong>Total Price:</strong> kSh {order.total_price}</p>
                        <p><strong>Harvest Date:</strong> {new Date(order.expected_harvest_date).toLocaleDateString()}</p>
                        <p><strong>Farm Region:</strong> {order.region_name}</p>
                        <hr />
                        <p><strong>Customer:</strong> {order.buyer_name}</p>
                        <p><strong>Phone:</strong> {order.buyer_phone}</p>
                        <p><strong>Delivery:</strong> {order.delivery_address || 'Not provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activePanel === 'help' && (
            <div className="help-panel">
              <div className="help-section">
                <h3><i className="fas fa-rocket"></i> Getting Started</h3>
                <div className="help-item">
                  <h4>How do I add a new crop?</h4>
                  <p>Click the <strong>"+" (New Planting)</strong> button in the top menu. Select your crop, enter the land size in acres, and select your farm location using the Google Map.</p>
                </div>
              </div>

              <div className="help-section">
                <h3><i className="fas fa-seedling"></i> Farming Lifecycle</h3>
                <div className="help-item">
                  <h4>How is harvest date projected?</h4>
                  <p>Our system uses the standard maturity days for each crop. Once you enter the planting date, we automatically calculate the expected harvest date.</p>
                </div>
                <div className="help-item">
                  <h4>What do the statuses mean?</h4>
                  <ul>
                    <li><strong>Planted:</strong> The crop is in the ground.</li>
                    <li><strong>Growing:</strong> The crop is developing (Automatic).</li>
                    <li><strong>Harvested:</strong> The crop is ready for delivery.</li>
                  </ul>
                </div>
              </div>

              <div className="help-section">
                <h3><i className="fas fa-wallet"></i> Payments & Escrow</h3>
                <div className="help-item">
                  <h4>How do I get paid?</h4>
                  <p>When a buyer purchases your crop, the money is held in a <strong>Secure Escrow</strong>. Once the buyer receives the goods and clicks "Confirm Delivery", the funds are instantly sent to your M-Pesa number.</p>
                </div>
                <div className="help-item">
                  <h4>Steps to complete a sale:</h4>
                  <ol>
                    <li>Buyer places an order and pays.</li>
                    <li>You receive an "Order Received" notification.</li>
                    <li>Deliver the produce to the buyer.</li>
                    <li>Buyer confirms delivery on their app.</li>
                    <li>Funds are released to you.</li>
                  </ol>
                </div>
              </div>

              <div className="help-section contact-support">
                <p>Need more help? Contact our field agents:</p>
                <a href="tel:0800123456" className="support-link"><i className="fas fa-phone"></i> 0800 123 456</a>
              </div>
            </div>
          )}
         {activePanel === 'profile' && user && (
  <div className="profile-panel">
    <div className="profile-header">
      <img 
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.name)}&background=2e7d32&color=fff`} 
        alt={user.full_name || user.name}
        className="profile-avatar-large"
      />
      <h3>{user.full_name || user.name}</h3>
      <p className="profile-role">{user.role || 'Farmer'}</p>
    </div>
    <div className="profile-details">
      <div className="detail-item">
        <i className="fas fa-envelope"></i>
        <span>{user.email}</span>
      </div>
      <div className="detail-item">
        <i className="fas fa-phone"></i>
        <span>{user.phone_number || 'Not provided'}</span>
      </div>
      <div className="detail-item">
        <i className="fas fa-calendar-alt"></i>
        <span>Member since {user.memberSince || new Date().getFullYear()}</span>
      </div>
    </div>
  </div>
)}
 {/* Fallback if user is not loaded yet */}
    {activePanel === 'profile' && !user && (
      <div className="profile-panel">
        <div className="loading-profile">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )}{activePanel === 'notifications' && (
  <div className="notifications-panel">
    <h3><i className="fas fa-bell"></i> Notification Settings</h3>
    
    <div className="notification-status">
      <div className="status-icon">
        {notificationPermission ? (
          <i className="fas fa-check-circle" style={{ color: '#388e3c', fontSize: '2rem' }}></i>
        ) : (
          <i className="fas fa-bell-slash" style={{ color: '#d32f2f', fontSize: '2rem' }}></i>
        )}
      </div>
      <div className="status-text">
        <h4>
          {notificationPermission ? 'Notifications Enabled' : 'Notifications Disabled'}
        </h4>
        <p>
          {notificationPermission 
            ? 'You will receive reminders for upcoming farming tasks' 
            : 'Enable notifications to get reminders about your crops'}
        </p>
      </div>
    </div>
    
    {!notificationPermission && (
      <div className="notification-prompt">
        <div className="benefits-list">
          <h4>With notifications you'll get:</h4>
          <ul>
            <li><i className="fas fa-check-circle"></i> Upcoming farming tasks</li>
            <li><i className="fas fa-check-circle"></i> Fertilizer application dates</li>
            <li><i className="fas fa-check-circle"></i> Harvest reminders</li>
            <li><i className="fas fa-check-circle"></i> Weather alerts</li>
          </ul>
        </div>
        <button 
          className="btn-primary btn-block"
          onClick={async () => {
            const granted = await notificationService.requestPermission();
            setNotificationPermission(granted);
            if (granted) {
              setShowNotificationBanner(false);
              // Refresh to show updated status
              setActivePanel('profile');
              setTimeout(() => setActivePanel('notifications'), 100);
            }
          }}
        >
          <i className="fas fa-bell"></i> Enable Notifications
        </button>
      </div>
    )}
    
    {notificationPermission && (
      <>
        <div className="upcoming-events-preview">
          <h4><i className="fas fa-calendar-alt"></i> Upcoming Events</h4>
          {dashboardSummary?.upcoming_events?.length > 0 ? (
            <div className="events-list">
              {dashboardSummary.upcoming_events.map((event, idx) => (
                <div key={idx} className="event-item">
                  <div className="event-urgency">
                    {event.days_remaining <= 1 ? '🔴' : event.days_remaining <= 2 ? '🟡' : '🟢'}
                  </div>
                  <div className="event-details">
                    <strong>{event.stage_name}</strong>
                    <span>{event.crop_name}</span>
                    <small>{event.days_remaining} days remaining</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No upcoming events scheduled</p>
          )}
        </div>
        
        <div className="test-notification-section">
          <button 
            className="btn-secondary btn-block"
            onClick={() => {
              const success = notificationService.testNotification();
              if (!success && !notificationPermission) {
                alert('Please enable notifications first');
              }
            }}
          >
            <i className="fas fa-flask"></i> Send Test Notification
          </button>
        </div>
      </>
    )}
  </div>
)}
          {/* ===== UPDATED: Register Planting Panel with Both Location Options ===== */}
          {activePanel === 'register' && (
            <div className="register-panel">
              <form onSubmit={handlePlantingSubmit}>
                <div className="form-group">
                  <label><i className="fas fa-seedling"></i> Select Crop</label>
                  <select
                    value={newPlanting.crop_id}
                    onChange={(e) => setNewPlanting({...newPlanting, crop_id: e.target.value})}
                    onBlur={(e) => handleBlur('crop_id', e.target.value, 'planting')}
                    className={touchedFields.crop_id && validationErrors.crop_id ? 'error' : ''}
                    required
                    disabled={loading}
                  >
                    <option value="">Choose a crop</option>
                    {cropTypes.map(crop => (
                      <option key={crop.id} value={crop.id}>
                        {crop.crop_name} - {crop.total_maturity_days} days
                      </option>
                    ))}
                  </select>
                  {touchedFields.crop_id && validationErrors.crop_id && (
                    <span className="error-text">{validationErrors.crop_id}</span>
                  )}
                </div>

                {newPlanting.crop_id && (
                  <div className="crop-preview">
                    <img 
                      src={cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.image_url || '/images/crops/default.jpg'}
                      alt="Crop preview"
                    />
                    <div className="crop-preview-info">
                      <h4>{cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.crop_name}</h4>
                      <p>Maturity: {cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.total_maturity_days} days</p>
                      <p>Baseline Yield: {cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.baseline_yield_per_acre} kg/acre</p>
                      <p>Price: kSh {cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.price_per_kg}/kg</p>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label><i className="fas fa-ruler"></i> Land Size (acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={newPlanting.land_size_acres}
                    onChange={(e) => setNewPlanting({...newPlanting, land_size_acres: e.target.value})}
                    onBlur={(e) => handleBlur('land_size_acres', e.target.value, 'planting')}
                    className={touchedFields.land_size_acres && validationErrors.land_size_acres ? 'error' : ''}
                    required
                    disabled={loading}
                  />
                  {touchedFields.land_size_acres && validationErrors.land_size_acres && (
                    <span className="error-text">{validationErrors.land_size_acres}</span>
                  )}
                </div>

                <div className="form-group">
                  <label><i className="fas fa-calendar"></i> Planting Date</label>
                  <input
                    type="date"
                    value={newPlanting.planting_date}
                    onChange={(e) => setNewPlanting({...newPlanting, planting_date: e.target.value})}
                    onBlur={(e) => handleBlur('planting_date', e.target.value, 'planting')}
                    className={touchedFields.planting_date && validationErrors.planting_date ? 'error' : ''}
                    required
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {touchedFields.planting_date && validationErrors.planting_date && (
                    <span className="error-text">{validationErrors.planting_date}</span>
                  )}
                </div>

                {/* Location Section */}
                <div className="location-section">
                  <div className="form-group">
                    <label><i className="fas fa-map-marker-alt"></i> Farm Location</label>
                    <div className="location-actions">
                      <button 
                        type="button" 
                        className="btn-location-current" 
                        onClick={handleCurrentLocation}
                        disabled={loading}
                      >
                        <i className="fas fa-location-arrow"></i> Use My Current Location
                      </button>
                    </div>
                  </div>

                  {address && (
                    <div className="selected-location">
                      <i className="fas fa-check-circle"></i>
                      <p>{address}</p>
                    </div>
                  )}

                  <div className="manual-location-section">
                    <div className="form-group">
                      <label><i className="fas fa-edit"></i> Or Enter Location Manually</label>
                      <input
                        type="text"
                        placeholder="e.g., Njoro, Nakuru County"
                        value={newPlanting.region_name}
                        onChange={(e) => {
                          setNewPlanting({...newPlanting, region_name: e.target.value});
                          setAddress(e.target.value);
                        }}
                      />
                      <small className="hint-text">Village, city, or region name</small>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Latitude</label>
                        <input
                          type="text"
                          placeholder="-6.7924"
                          value={newPlanting.latitude}
                          onChange={(e) => setNewPlanting({...newPlanting, latitude: e.target.value})}
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label>Longitude</label>
                        <input
                          type="text"
                          placeholder="39.2083"
                          value={newPlanting.longitude}
                          onChange={(e) => setNewPlanting({...newPlanting, longitude: e.target.value})}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>


                <div className="form-group">
                  <label><i className="fas fa-sticky-note"></i> Notes (Optional)</label>
                  <textarea
                    value={newPlanting.notes}
                    onChange={(e) => setNewPlanting({...newPlanting, notes: e.target.value})}
                    placeholder="Any additional notes about this planting"
                    rows="3"
                    disabled={loading}
                  />
                </div>

                {newPlanting.crop_id && newPlanting.land_size_acres && (
                  <div className="yield-estimate">
                    <h4>Estimated Yield</h4>
                    <p className="estimate-value">
                      {(
                        (cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.baseline_yield_per_acre || 0) * 
                        parseFloat(newPlanting.land_size_acres || 0)
                      ).toFixed(2)} kg
                    </p>
                    <p className="estimate-note">This is an estimate. Actual yield may vary.</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-primary btn-block"
                  disabled={loading || Object.keys(validationErrors).length > 0}
                >
                  {loading ? 'Submitting...' : 'Submit Planting Request'}
                </button>
              </form>
            </div>
          )}

          {activePanel === 'calendar' && (
            <div className="calendar-panel">
              {plantings.length === 0 ? (
                <div className="empty-state">
                  <img src="/images/empty-calendar.jpg" alt="No plantings" />
                  <p>No plantings to show calendar</p>
                </div>
              ) : (
                plantings.map(planting => (
                  <div key={planting.id} className="calendar-item">
                    <h4>{planting.crop_name}</h4>
                    <p>Planted: {formatDate(planting.planting_date)}</p>
                    <button 
                      className="btn-secondary btn-small"
                      onClick={() => viewPlantingDetails(planting.id)}
                    >
                      View Full Calendar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activePanel === 'marketplace' && (
            <div className="marketplace-panel">
              <h3>Your Listings</h3>
              {marketplaceListings.length === 0 ? (
                <div className="empty-state">
                  <img src="/images/empty-marketplace.jpg" alt="No listings" />
                  <p>No marketplace listings yet</p>
                  <p className="hint">Plantings marked as "Planted" automatically create hidden listings</p>
                </div>
              ) : (
                marketplaceListings.map(listing => (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-header">
                      <h4>{listing.crop_name}</h4>
                      <span className={`status-badge status-${listing.listing_status?.toLowerCase()}`}>
                        {listing.listing_status}
                      </span>
                    </div>
                    <div className="listing-details">
                      <p><i className="fas fa-weight"></i> {listing.available_quantity_kg} kg available</p>
                      <p><i className="fas fa-tag"></i> kSh {listing.price_per_kg}/kg</p>
                    </div>
                    {listing.listing_status === 'Hidden' && (
                      <button 
                        className="btn-primary btn-small"
                        onClick={async () => {
                          const newPrice = prompt('Enter price per kg (kSh):', listing.price_per_kg);
                          if (newPrice) {
                            try {
                              await api.marketplace.updateListing(listing.id, {
                                price_per_kg: parseFloat(newPrice),
                                listing_status: 'Active'
                              });
                              await fetchMarketplaceListings();
                            } catch (err) {
                              setError(err.message);
                            }
                          }
                        }}
                      >
                        Activate Listing
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showCalendar && selectedCrop && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCrop.planting_info?.crop_name} Growth Calendar</h2>
              <button className="close-btn" onClick={() => setShowCalendar(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="planting-info-summary">
                <p><strong>Planted:</strong> {formatDate(selectedCrop.planting_info?.planting_date)}</p>
                <p><strong>Expected Harvest:</strong> {formatDate(selectedCrop.planting_info?.expected_harvest_date)}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${selectedCrop.planting_info?.status?.toLowerCase()}`}>
                  {selectedCrop.planting_info?.status}
                </span></p>
              </div>
              
              <div className="calendar-timeline">
                {selectedCrop.calendar?.map((stage, index) => (
                  <div key={index} className="timeline-stage">
                    <div className="stage-header">
                      <span className="stage-name">{stage.stage_name}</span>
                      <span className="stage-duration">{stage.duration_days} days</span>
                    </div>
                    <div className="stage-dates">
                      <span>{formatDate(stage.start_date)} - {formatDate(stage.end_date)}</span>
                    </div>
                    <div className="stage-progress">
                      <div 
                        className="stage-progress-bar"
                        style={{ 
                          width: `${Math.min(100, ((new Date() - new Date(stage.start_date)) / (new Date(stage.end_date) - new Date(stage.start_date))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    {stage.instructions && (
                      <div className="stage-instructions">
                        <p><i className="fas fa-info-circle"></i> {stage.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => togglePanel('profile')}>
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
        <button className="nav-item" onClick={() => togglePanel('register')}>
          <i className="fas fa-plus-circle"></i>
          <span>New</span>
        </button>
        <button className="nav-item" onClick={() => togglePanel('calendar')}>
          <i className="fas fa-calendar-alt"></i>
          <span>Calendar</span>
        </button>
        <button className="nav-item" onClick={() => togglePanel('marketplace')}>
          <i className="fas fa-store"></i>
          <span>Market</span>
        </button>
        <button className="nav-item" onClick={() => togglePanel('orders')}>
          <i className="fas fa-shopping-basket"></i>
          <span>Orders</span>
          {farmerOrders.length > 0 && (
            <span className="notification-badge">{farmerOrders.length}</span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default App;