import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import api from './services/api';
import authService from './services/auth';
import LoadingSpinner from './components/LoadingSpinner';

// Google Maps API Key - Replace with your own
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

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

  // Data state
  const [cropTypes, setCropTypes] = useState([]);
  const [plantings, setPlantings] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [marketplaceListings, setMarketplaceListings] = useState([]);

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

  // Load Google Maps script
  useEffect(() => {
    if (isLoggedIn && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if (isLoggedIn && window.google) {
      initializeMap();
    }
  }, [isLoggedIn]);

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c8e6c9" }]
          }
        ]
      });

      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      map.addListener('click', (e) => {
        const newLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        updateLocation(newLocation, map);
      });

      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current.getPosition();
        const newLocation = { lat: position.lat(), lng: position.lng() };
        updateLocation(newLocation, map);
      });

      // Initialize autocomplete
      const input = document.getElementById('location-search');
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const newLocation = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            updateLocation(newLocation, map);
            setAddress(place.formatted_address);
          }
        });
      }
    }
  };

  const updateLocation = (newLocation, map) => {
    setLocation(newLocation);
    setNewPlanting(prev => ({
      ...prev,
      latitude: newLocation.lat,
      longitude: newLocation.lng,
      region_name: `${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)}`
    }));
    
    if (markerRef.current) {
      markerRef.current.setPosition(newLocation);
    }
    
    if (map) {
      map.setCenter(newLocation);
    }

    // Reverse geocode to get address
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  // Fetch initial data after login
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCropTypes(),
        fetchMyPlantings(),
        fetchDashboardSummary(),
        fetchMarketplaceListings()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Auth handlers
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
      setShowPanel(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.register(registerData);
      
      authService.setToken(response.token);
      authService.setUser(response.user);
      setUser(response.user);
      setIsLoggedIn(true);
      
      await fetchInitialData();
      setShowPanel(true);
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

  // Planting handlers
  const handlePlantingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const plantingData = {
        ...newPlanting,
        land_size_acres: parseFloat(newPlanting.land_size_acres)
      };

      const response = await api.farmer.savePlanting(plantingData);
      
      // Refresh plantings list
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
    setLoading(true);
    try {
      await api.farmer.updatePlantingStatus(id, status);
      await fetchMyPlantings();
      await fetchMarketplaceListings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const togglePanel = (panelName) => {
    setActivePanel(panelName);
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state for auth
  if (loading && !isLoggedIn) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Auth screen
  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-background"></div>
        
        {/* Error display */}
        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="auth-card animate-fadeIn">
          <div className="auth-header">
            <h1>🌾 AgriTrace Market</h1>
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
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Phone Number</label>
                <input
                  type="tel"
                  placeholder="0712345678"
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({...registerData, phone_number: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Main dashboard for logged in users
  return (
    <div className="app">
      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <h1>🌾 AgriTrace Market</h1>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => togglePanel('profile')}>
              <i className="fas fa-user"></i>
            </button>
            <button className="icon-btn" onClick={() => togglePanel('register')}>
              <i className="fas fa-plus"></i>
            </button>
            <button className="icon-btn" onClick={() => togglePanel('calendar')}>
              <i className="fas fa-calendar"></i>
            </button>
            <button className="icon-btn" onClick={() => togglePanel('marketplace')}>
              <i className="fas fa-store"></i>
            </button>
            <button className="icon-btn logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <LoadingSpinner message="Loading your farm data..." />
        ) : (
          <div className="dashboard animate-fadeIn">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-text">
                <h2>Welcome back, {user?.full_name}! 👨‍🌾</h2>
                <p>Here's what's happening on your farm today</p>
              </div>
            </div>

            {/* Dashboard Summary Stats */}
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
                    <p className="stat-value">{dashboardSummary.summary.total_expected_yield.toFixed(0)} kg</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Events */}
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

            {/* Recent Plantings */}
            <div className="recent-plantings">
              <h3>Your Plantings</h3>
              {plantings.length === 0 ? (
                <div className="empty-state">
                  {/* REPLACE THIS IMAGE: /images/empty-plantings.jpg */}
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
                      {/* REPLACE THIS IMAGE: Find crop image from cropTypes or use default */}
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Marketplace Listings Preview */}
            {marketplaceListings.length > 0 && (
              <div className="marketplace-preview">
                <h3>Your Marketplace Listings</h3>
                <div className="listings-preview">
                  {marketplaceListings.slice(0, 3).map(listing => (
                    <div key={listing.id} className="listing-preview-card">
                      <h4>{listing.crop_name}</h4>
                      <p>{listing.available_quantity_kg} kg available</p>
                      <p className="listing-price">TSh {listing.price_per_kg}/kg</p>
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

      {/* Sliding Panel */}
      <div className={`sliding-panel ${showPanel ? 'open' : ''}`}>
        <div className="panel-header">
          <h2>
            {activePanel === 'profile' && <><i className="fas fa-user"></i> Profile</>}
            {activePanel === 'register' && <><i className="fas fa-seedling"></i> Register Planting</>}
            {activePanel === 'calendar' && <><i className="fas fa-calendar"></i> Growth Calendar</>}
            {activePanel === 'marketplace' && <><i className="fas fa-store"></i> Marketplace</>}
          </h2>
          <button className="close-btn" onClick={closePanel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="panel-content">
          {/* Profile Panel */}
          {activePanel === 'profile' && user && (
            <div className="profile-panel">
              <div className="profile-header">
                {/* REPLACE THIS IMAGE: Use user avatar or default */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.full_name}&background=2e7d32&color=fff`} 
                  alt={user.full_name}
                  className="profile-avatar-large"
                />
                <h3>{user.full_name}</h3>
                <p className="profile-role">{user.role}</p>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <i className="fas fa-envelope"></i>
                  <span>{user.email}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-phone"></i>
                  <span>{user.phone_number}</span>
                </div>
              </div>
            </div>
          )}

          {/* Register Planting Panel */}
          {activePanel === 'register' && (
            <div className="register-panel">
              <form onSubmit={handlePlantingSubmit}>
                <div className="form-group">
                  <label><i className="fas fa-seedling"></i> Select Crop</label>
                  <select
                    value={newPlanting.crop_id}
                    onChange={(e) => setNewPlanting({...newPlanting, crop_id: e.target.value})}
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
                </div>

                {/* Crop Preview when selected */}
                {newPlanting.crop_id && (
                  <div className="crop-preview">
                    {/* REPLACE THIS IMAGE: Use crop.image_url */}
                    <img 
                      src={cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.image_url || '/images/crops/default.jpg'}
                      alt="Crop preview"
                    />
                    <div className="crop-preview-info">
                      <h4>{cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.crop_name}</h4>
                      <p>Maturity: {cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.total_maturity_days} days</p>
                      <p>Baseline Yield: {cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.baseline_yield_per_acre} kg/acre</p>
                      <p>Price: TSh {cropTypes.find(c => c.id === parseInt(newPlanting.crop_id))?.price_per_kg}/kg</p>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label><i className="fas fa-ruler"></i> Land Size (acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newPlanting.land_size_acres}
                    onChange={(e) => setNewPlanting({...newPlanting, land_size_acres: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-calendar"></i> Planting Date</label>
                  <input
                    type="date"
                    value={newPlanting.planting_date}
                    onChange={(e) => setNewPlanting({...newPlanting, planting_date: e.target.value})}
                    required
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-map-marker-alt"></i> Search Location</label>
                  <input
                    id="location-search"
                    type="text"
                    placeholder="Enter farm location"
                    className="location-input"
                    disabled={loading}
                  />
                </div>

                <div className="map-container" ref={mapRef}></div>

                {address && (
                  <div className="selected-location">
                    <i className="fas fa-check-circle"></i>
                    <p>{address}</p>
                  </div>
                )}

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

                {/* Yield Estimate */}
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
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Planting Request'}
                </button>
              </form>
            </div>
          )}

          {/* Calendar Panel */}
          {activePanel === 'calendar' && (
            <div className="calendar-panel">
              {plantings.length === 0 ? (
                <div className="empty-state">
                  {/* REPLACE THIS IMAGE: /images/empty-calendar.jpg */}
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

          {/* Marketplace Panel */}
          {activePanel === 'marketplace' && (
            <div className="marketplace-panel">
              <h3>Your Listings</h3>
              {marketplaceListings.length === 0 ? (
                <div className="empty-state">
                  {/* REPLACE THIS IMAGE: /images/empty-marketplace.jpg */}
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
                      <p><i className="fas fa-tag"></i> TSh {listing.price_per_kg}/kg</p>
                    </div>
                    {listing.listing_status === 'Hidden' && (
                      <button 
                        className="btn-primary btn-small"
                        onClick={() => {
                          // Open listing update modal
                          const newPrice = prompt('Enter price per kg (TSh):', listing.price_per_kg);
                          if (newPrice) {
                            api.marketplace.updateListing(listing.id, {
                              price_per_kg: parseFloat(newPrice),
                              listing_status: 'Active'
                            }).then(() => {
                              fetchMarketplaceListings();
                            }).catch(err => setError(err.message));
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

      {/* Calendar Modal */}
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;