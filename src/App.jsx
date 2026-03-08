import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [newCrop, setNewCrop] = useState({
    name: '',
    plantingDate: '',
    landSize: '',
    location: '',
    cropType: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    farmName: '',
    phone: ''
  });

  // Crop types with their growth days and expected yield per acre
  const cropTypes = {
    maize: { name: 'Maize', growthDays: 120, yieldPerAcre: 1800, unit: 'kg' },
    rice: { name: 'Rice', growthDays: 150, yieldPerAcre: 1200, unit: 'kg' },
    wheat: { name: 'Wheat', growthDays: 110, yieldPerAcre: 1500, unit: 'kg' },
    tomatoes: { name: 'Tomatoes', growthDays: 75, yieldPerAcre: 8000, unit: 'kg' },
    potatoes: { name: 'Potatoes', growthDays: 90, yieldPerAcre: 10000, unit: 'kg' },
    coffee: { name: 'Coffee', growthDays: 240, yieldPerAcre: 800, unit: 'kg' },
    soybeans: { name: 'Soybeans', growthDays: 100, yieldPerAcre: 1200, unit: 'kg' }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login - in real app, this would validate against backend
    if (loginData.email && loginData.password) {
      setUser({ email: loginData.email, name: 'Demo Farmer' });
      setIsLoggedIn(true);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Mock registration
    if (registerData.email && registerData.password) {
      setUser({ email: registerData.email, name: registerData.name });
      setIsLoggedIn(true);
    }
  };

  const handleCropSubmit = (e) => {
    e.preventDefault();
    const selectedCrop = cropTypes[newCrop.cropType];
    
    // Calculate expected yield
    const expectedYield = selectedCrop.yieldPerAcre * parseFloat(newCrop.landSize);
    
    // Generate growth calendar
    const calendar = generateGrowthCalendar(
      newCrop.plantingDate, 
      selectedCrop.growthDays,
      newCrop.cropType
    );

    const cropEntry = {
      ...newCrop,
      id: Date.now(),
      expectedYield: expectedYield.toFixed(2),
      unit: selectedCrop.unit,
      growthDays: selectedCrop.growthDays,
      calendar: calendar
    };

    setCrops([...crops, cropEntry]);
    setNewCrop({
      name: '',
      plantingDate: '',
      landSize: '',
      location: '',
      cropType: ''
    });
  };

  const generateGrowthCalendar = (plantingDate, growthDays, cropType) => {
    const calendar = [];
    const startDate = new Date(plantingDate);
    const stages = getGrowthStages(cropType);

    for (let day = 1; day <= growthDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day - 1);
      
      // Determine growth stage
      let stage = 'Growing';
      for (const [stageName, stageDays] of Object.entries(stages)) {
        if (day <= stageDays) {
          stage = stageName;
          break;
        }
      }

      calendar.push({
        day,
        date: currentDate.toLocaleDateString(),
        stage,
        tasks: getDailyTasks(cropType, day, stage)
      });
    }
    return calendar;
  };

  const getGrowthStages = (cropType) => {
    const stages = {
      maize: { 'Germination': 10, 'Vegetative': 50, 'Tasseling': 20, 'Silking': 15, 'Maturity': 25 },
      tomatoes: { 'Germination': 10, 'Seedling': 15, 'Vegetative': 20, 'Flowering': 15, 'Fruiting': 15 },
      potatoes: { 'Sprouting': 15, 'Vegetative': 30, 'Tuber Initiation': 20, 'Tuber Bulking': 25 },
      default: { 'Early': 30, 'Mid': 40, 'Late': 30 }
    };
    return stages[cropType] || stages.default;
  };

  const getDailyTasks = (cropType, day, stage) => {
    const tasks = {
      'Germination': 'Check soil moisture, protect from pests',
      'Vegetative': 'Apply fertilizer, ensure adequate water',
      'Flowering': 'Monitor pollination, maintain irrigation',
      'Fruiting': 'Support plants, check for diseases',
      'Maturity': 'Prepare for harvest, monitor ripeness',
      'Early': 'Regular watering, weed control',
      'Mid': 'Fertilizer application, pest monitoring',
      'Late': 'Harvest preparation, quality checks'
    };
    return tasks[stage] || 'Regular monitoring and care';
  };

  const handleInputChange = (setter) => (e) => {
    setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🌱 AgriTrace Market</h1>
          <div className="auth-tabs">
            <button 
              className={activeTab === 'login' ? 'active' : ''} 
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={activeTab === 'register' ? 'active' : ''} 
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleInputChange(setLoginData)}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleInputChange(setLoginData)}
                required
              />
              <button type="submit" className="btn-primary">Login</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={registerData.name}
                onChange={handleInputChange(setRegisterData)}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleInputChange(setRegisterData)}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleInputChange(setRegisterData)}
                required
              />
              <input
                type="text"
                name="farmName"
                placeholder="Farm Name"
                value={registerData.farmName}
                onChange={handleInputChange(setRegisterData)}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={registerData.phone}
                onChange={handleInputChange(setRegisterData)}
                required
              />
              <button type="submit" className="btn-primary">Register</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🌱 AgriTrace Market</h2>
        </div>
        <div className="nav-menu">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'register-crop' ? 'active' : ''}
            onClick={() => setActiveTab('register-crop')}
          >
            Register Crop
          </button>
          <button 
            className={activeTab === 'calendar' ? 'active' : ''}
            onClick={() => setActiveTab('calendar')}
          >
            Growth Calendar
          </button>
          <button className="logout" onClick={() => setIsLoggedIn(false)}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h1>Welcome back, {user?.name}! 👨‍🌾</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Active Crops</h3>
                <p className="stat-value">{crops.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Land</h3>
                <p className="stat-value">
                  {crops.reduce((acc, crop) => acc + parseFloat(crop.landSize), 0).toFixed(1)} acres
                </p>
              </div>
              <div className="stat-card">
                <h3>Expected Yield</h3>
                <p className="stat-value">
                  {crops.reduce((acc, crop) => acc + parseFloat(crop.expectedYield), 0).toFixed(0)} kg
                </p>
              </div>
            </div>

            <div className="crops-list">
              <h2>Your Crops</h2>
              {crops.length === 0 ? (
                <p className="no-data">No crops registered yet. Register your first crop!</p>
              ) : (
                <div className="crop-cards">
                  {crops.map(crop => (
                    <div key={crop.id} className="crop-card">
                      <h3>{cropTypes[crop.cropType]?.name || crop.name}</h3>
                      <p>📍 Location: {crop.location}</p>
                      <p>📏 Land Size: {crop.landSize} acres</p>
                      <p>📅 Planted: {new Date(crop.plantingDate).toLocaleDateString()}</p>
                      <p>📊 Expected Yield: {crop.expectedYield} {crop.unit}</p>
                      <p>📈 Growth Days: {crop.growthDays} days</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'register-crop' && (
          <div className="register-crop">
            <h1>Register New Crop</h1>
            <form onSubmit={handleCropSubmit} className="crop-form">
              <div className="form-group">
                <label>Crop Type:</label>
                <select
                  name="cropType"
                  value={newCrop.cropType}
                  onChange={handleInputChange(setNewCrop)}
                  required
                >
                  <option value="">Select a crop</option>
                  {Object.entries(cropTypes).map(([key, crop]) => (
                    <option key={key} value={key}>{crop.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Planting Date:</label>
                <input
                  type="date"
                  name="plantingDate"
                  value={newCrop.plantingDate}
                  onChange={handleInputChange(setNewCrop)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Land Size (acres):</label>
                <input
                  type="number"
                  name="landSize"
                  step="0.1"
                  min="0.1"
                  value={newCrop.landSize}
                  onChange={handleInputChange(setNewCrop)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Farm location"
                  value={newCrop.location}
                  onChange={handleInputChange(setNewCrop)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">Register Crop</button>
            </form>

            {newCrop.cropType && newCrop.landSize && (
              <div className="yield-preview">
                <h3>Expected Yield Preview</h3>
                <p>
                  Based on your inputs, you can expect approximately{' '}
                  <strong>
                    {(cropTypes[newCrop.cropType].yieldPerAcre * parseFloat(newCrop.landSize || 0)).toFixed(2)} 
                    {cropTypes[newCrop.cropType].unit}
                  </strong>{' '}
                  of {cropTypes[newCrop.cropType].name}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="growth-calendar">
            <h1>Growth Calendar</h1>
            {crops.length === 0 ? (
              <p className="no-data">Register a crop to see its growth calendar</p>
            ) : (
              <div className="calendar-container">
                {crops.map(crop => (
                  <div key={crop.id} className="crop-calendar">
                    <h2>{cropTypes[crop.cropType]?.name} - Growth Timeline</h2>
                    <div className="timeline">
                      {crop.calendar.filter((_, index) => index % 10 === 0).map(day => (
                        <div key={day.day} className="timeline-day">
                          <div className="day-marker">
                            <span className="day-number">Day {day.day}</span>
                            <span className="day-stage">{day.stage}</span>
                          </div>
                          <p className="day-task">{day.tasks}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;