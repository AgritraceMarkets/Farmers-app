import React, { useState, useEffect } from 'react';
import './App.css';
import cropImages from './cropImages';
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [newCrop, setNewCrop] = useState({
    name: '',
    plantingDate: '',
    landSize: '',
    location: '',
    cropType: '',
    customName: ''
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
    phone: '',
    region: ''
  });

  // Updated crop types with Swahili names and accurate data
  const cropTypes = {
    coriander: { 
      name: 'Coriander', 
      swahili: 'Dhania',
      growthDays: 45, 
      yieldPerAcre: 800, 
      unit: 'kg',
      season: "All year",
      image: cropImages.coriander,
      description: 'Fast-growing herb used in cooking'
    },
    maize: { 
      name: 'Maize', 
      swahili: 'Mahindi',
      growthDays: 120, 
      yieldPerAcre: 2500, 
      unit: 'kg',
      season: 'Rainy season',
      image: cropImages.maize,
      description: 'Staple food'
    },
    lettuce: { 
      name: 'Lettuce',
      swahili: 'Saladi', 
      growthDays: 60, 
      yieldPerAcre: 4000, 
      unit: 'kg',
      season: 'All year)',
      image: cropImages.lettuce,
      description: 'Leafy vegetable for salads'
    },
    rice: { 
      name: 'Rice', 
      swahili: 'Mchele',
      growthDays: 150, 
      yieldPerAcre: 1800, 
      unit: 'kg',
      season: 'Heavy rainy season',
      image: cropImages.rice,
      description: 'Paddy rice'
    },
    cabbage: { 
      name: 'Cabbage',
      swahili: 'kabeji', 
      growthDays: 90, 
      yieldPerAcre: 6000, 
      unit: 'kg',
      season: 'Dry season',
      image: cropImages.cabbage,
      description: 'Leafy cabbage'
    },
    kale: { 
      name: 'Kale', 
      swahili: 'Sukumawiki',
      growthDays: 55, 
      yieldPerAcre: 3500, 
      unit: 'kg',
      season: 'All year',
      image: cropImages.kale,
      description: 'Popular vegetable'
    },
    beans: { 
      name: 'Beans', 
      swahili: 'Maharage',
      growthDays: 95, 
      yieldPerAcre: 800, 
      unit: 'kg',
      season: 'Rainy season',
      image: cropImages.beans,
      description: 'Legumes used in many dishes'
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.email && loginData.password) {
      setUser({ 
        email: loginData.email, 
        name: 'Juma', 
        farmName: 'Shamba la Ustawi',
        region: 'Mlolongo, Machakos',
        memberSince: '2024'
      });
      setIsLoggedIn(true);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerData.email && registerData.password) {
      setUser({ 
        email: registerData.email, 
        name: registerData.name,
        farmName: registerData.farmName,
        region: registerData.region,
        memberSince: new Date().getFullYear()
      });
      setIsLoggedIn(true);
    }
  };

  const handleCropSubmit = (e) => {
    e.preventDefault();
    const selectedCrop = cropTypes[newCrop.cropType];
    
    const expectedYield = selectedCrop.yieldPerAcre * parseFloat(newCrop.landSize);
    
    const calendar = generateGrowthCalendar(
      newCrop.plantingDate, 
      selectedCrop.growthDays,
      newCrop.cropType
    );

    const cropEntry = {
      ...newCrop,
      id: Date.now(),
      cropName: selectedCrop.name,
      swahiliName: selectedCrop.swahili,
      expectedYield: expectedYield.toFixed(2),
      unit: selectedCrop.unit,
      growthDays: selectedCrop.growthDays,
      calendar: calendar,
      image: selectedCrop.image,
      registrationDate: new Date().toLocaleDateString()
    };

    setCrops([cropEntry, ...crops]);
    setNewCrop({
      name: '',
      plantingDate: '',
      landSize: '',
      location: '',
      cropType: '',
      customName: ''
    });
  };

  const generateGrowthCalendar = (plantingDate, growthDays, cropType) => {
    const calendar = [];
    const startDate = new Date(plantingDate);
    const stages = getGrowthStages(cropType);

    for (let day = 1; day <= growthDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day - 1);
      
      let stage = ' Germination';
      for (const [stageName, stageDays] of Object.entries(stages)) {
        if (day <= stageDays) {
          stage = stageName;
          break;
        }
      }

      calendar.push({
        day,
        date: currentDate.toLocaleDateString('en-GB'),
        stage,
        tasks: getDailyTasks(cropType, day, stage),
        });
    }
    return calendar;
  };

  const getGrowthStages = (cropType) => {
    const stages = {
      coriander: { 'Germination': 7, 'Growth': 20, 'Harvesting': 18 },
      maize: { 'Germination': 10, 'Growth': 50, 'Flowering': 20, 'Head formation': 20, 'Maturity': 20 },
      lettuce: { 'Germination': 8, 'Growth': 30, 'Harvesting': 22 },
      rice: { 'Germination': 15, 'Growth': 60, 'Flowering': 30, 'Maturity': 45 },
      cabbage: { 'Germination': 10, 'Growth': 45, 'Drying': 20, 'Harvesting': 15 },
      kale: { 'Germination': 7, 'Growth': 30, 'Harvesting': 18 },
      beans: { 'Germination': 8, 'Growth': 35, 'Flowering': 20, 'Pod formation': 20, 'Maturity': 12 }
    };
    return stages[cropType] || { 'Germination': 10, 'Growth': 30, 'Harvesting': 20 };
  };

  const getDailyTasks = (cropType, day, stage) => {
    const tasks = {
      'Germination': 'Water regularly, protect from birds',
      'Growth': 'Apply fertilizer, weed control',
      'Flowering': 'Monitor pollination, ensure irrigation',
      'Head formation': 'Support plants, check for pests',
      'Maturity': 'Prepare for harvest, monitor ripeness',
      'Drying': 'Ensure proper spacing, water consistently',
      'Harvesting': 'Harvest carefully, prepare for market'
    };
    return tasks[stage] || 'Regular monitoring and care';
  };

  const handleInputChange = (setter) => (e) => {
    setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCrops([]);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  if (!isLoggedIn) {
    return (
    <div className="app-background">
      <div className="auth-container">
        <div className="auth-overlay"></div>
        <div className="auth-card">
          <div className="auth-header">
            <h1>🌾 AgriTrace Market</h1>
            <p>Soko la Wakulima - Connecting Farmers to Buyers</p>
          </div>
          
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
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="juma@shamba.com"
                  value={loginData.email}
                  onChange={handleInputChange(setLoginData)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleInputChange(setLoginData)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Login</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juma Omary"
                  value={registerData.name}
                  onChange={handleInputChange(setRegisterData)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="juma@shamba.com"
                  value={registerData.email}
                  onChange={handleInputChange(setRegisterData)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={handleInputChange(setRegisterData)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Farm Name</label>
                <input
                  type="text"
                  name="farmName"
                  placeholder="Shamba la Ustawi"
                  value={registerData.farmName}
                  onChange={handleInputChange(setRegisterData)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select
                  name="region"
                  value={registerData.region}
                  onChange={handleInputChange(setRegisterData)}
                  required
                >
                  <option value="">Select Region</option>
                  <option value="">Mlolongo</option>
                  <option value="Laikipia">Laikipia</option>
                  <option value="Meru">Meru</option>
                  <option value="Njoro">Njoro</option>
                  <option value="Molo">Molo</option>
                  <option value="Voi">Voi</option>
                  <option value="Bondo">Bondo</option>
                  <option value="Matayos">Matayos</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0712 345 678"
                  value={registerData.phone}
                  onChange={handleInputChange(setRegisterData)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Register</button>
            </form>
          )}
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🌾 AgriTrace Market</h2>
          <span className="farm-name">{user?.farmName}</span>
        </div>
        
        <div className="profile-section">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {user?.name?.charAt(0)}
            </div>
            <span className="profile-name">{user?.name}</span>
          </button>
          
          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-info">
                <p><strong>{user?.name}</strong></p>
                <p>{user?.farmName}</p>
                <p>Region: {user?.region}</p>
                <p>Member since: {user?.memberSince}</p>
              </div>
              <div className="profile-actions">
                <button onClick={() => {
                  setActiveTab('dashboard');
                  setShowProfileMenu(false);
                }}>📊 Dashboard</button>
                <button onClick={() => {
                  setActiveTab('register-crop');
                  setShowProfileMenu(false);
                }}>🌱 Crop Registration</button>
                <button onClick={() => {
                  setActiveTab('calendar');
                  setShowProfileMenu(false);
                }}>📅 Growth Calendar</button>
                <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="welcome-banner">
              <div className="welcome-content">
                <h1>Karibu tena, {user?.name}! 👨‍🌾</h1>
                <p>Shamba lako la {user?.farmName}, {user?.region}</p>
              </div>
              <div className="welcome-actions">
                <button onClick={() => setActiveTab('register-crop')} className="btn-primary">
                  + New Crop registration
                </button>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🌱</div>
                <div className="stat-content">
                  <h3>Active Crops</h3>
                  <p className="stat-value">{crops.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-content">
                  <h3>Total Land</h3>
                  <p className="stat-value">
                    {crops.reduce((acc, crop) => acc + parseFloat(crop.landSize), 0).toFixed(1)} Acres
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Yield Expectation</h3>
                  <p className="stat-value">
                    {crops.reduce((acc, crop) => acc + parseFloat(crop.expectedYield), 0).toFixed(0)} kg
                  </p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Your Crops</h2>
              {crops.length === 0 ? (
                <div className="empty-state">
                  <img src="/image/Farm.jpeg" alt="Farm" />
                  <p>You haven't registered any crop yet. Register your first crop!</p>
                  <button onClick={() => setActiveTab('register-crop')} className="btn-primary">
                    + Crop Registration
                  </button>
                </div>
              ) : (
                <div className="crop-cards">
                  {crops.map(crop => (
                    <div key={crop.id} className="crop-card">
                      <div className="crop-image">
                        <img src={crop.image} alt={crop.cropName} />
                        <span className="crop-badge">{crop.swahiliName}</span>
                      </div>
                      <div className="crop-details">
                        <h3>{crop.cropName}</h3>
                        <p className="crop-location">📍 {crop.location}, {user?.region}</p>
                        <div className="crop-stats">
                          <div className="stat-item">
                            <span className="stat-label">Acre:</span>
                            <span className="stat-value">{crop.landSize}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Harvest:</span>
                            <span className="stat-value">{crop.expectedYield} {crop.unit}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Planted:</span>
                            <span className="stat-value">{formatDate(crop.plantingDate)}</span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.min(100, (new Date() - new Date(crop.plantingDate)) / (crop.growthDays * 24 * 60 * 60 * 1000) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="growth-status">
                          {Math.min(100, Math.round((new Date() - new Date(crop.plantingDate)) / (crop.growthDays * 24 * 60 * 60 * 1000) * 100))}% Grown
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'register-crop' && (
          <div className="register-crop">
            <h1>New Crop Registration</h1>
            <p className="subtitle">Register a new crop for your farm</p>
            <form onSubmit={handleCropSubmit} className="crop-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Crop Type:</label>
                  <select
                    name="cropType"
                    value={newCrop.cropType}
                    onChange={handleInputChange(setNewCrop)}
                    required
                  >
                    <option value="">Select</option>
                    {Object.entries(cropTypes).map(([key, crop]) => (
                      <option key={key} value={key}>
                        {crop.name} - {crop.swahili}
                      </option>
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Land Size (Acres):</label>
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
                    placeholder="Area"
                    value={newCrop.location}
                    onChange={handleInputChange(setNewCrop)}
                    required
                  />
                </div>
              </div>

              {newCrop.cropType && (
                <div className="crop-preview">
                  <div className="preview-header">
                    <h3>Yield Preview</h3>
                  </div>
                  <div className="preview-content">
                    <img 
                      src={cropTypes[newCrop.cropType].image} 
                      alt={cropTypes[newCrop.cropType].name}
                      className="preview-image"
                    />
                    <div className="preview-details">
                      <h4>{cropTypes[newCrop.cropType].name} ({cropTypes[newCrop.cropType].swahili})</h4>
                      <p>{cropTypes[newCrop.cropType].description}</p>
                      <p><strong>Season:</strong> {cropTypes[newCrop.cropType].season}</p>
                      <p><strong>Growth days:</strong> {cropTypes[newCrop.cropType].growthDays} days</p>
                      <p><strong>Yield Estimation:</strong> 
                        <span className="highlight">
                          {(cropTypes[newCrop.cropType].yieldPerAcre * parseFloat(newCrop.landSize || 0)).toFixed(2)} 
                          {cropTypes[newCrop.cropType].unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary btn-large">
                Save Crop
              </button>
            </form>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="growth-calendar">
            <h1>Growth Calendar</h1>
            <p className="subtitle">Growth calendar and daily tasks</p>
            
            {crops.length === 0 ? (
              <div className="empty-state">
                <img src="/image/growth.jpeg" alt="Calendar" />
                <p>Register a crop to see its growth calendar</p>
                <button onClick={() => setActiveTab('register-crop')} className="btn-primary">
                  + Crop Registration
                </button>
              </div>
            ) : (
              <div className="calendar-container">
                {crops.map(crop => (
                  <div key={crop.id} className="crop-calendar-card">
                    <div className="calendar-header">
                      <img src={crop.image} alt={crop.cropName} className="calendar-crop-image" />
                      <div className="calendar-title">
                        <h2>{crop.cropName} ({crop.swahiliName})</h2>
                        <p>Planted: {formatDate(crop.plantingDate)}</p>
                        <p>Location: {crop.location}</p>
                      </div>
                    </div>
                    
                    <div className="timeline">
                      <h3>Daily Schedule</h3>
                      <div className="timeline-grid">
                        {crop.calendar.filter((_, index) => index % 5 === 0 || index === crop.calendar.length - 1).map(day => (
                          <div key={day.day} className="timeline-card">
                            <div className="timeline-day-header">
                              <span className="day-number">Day {day.day}</span>
                              <span className="day-date">{day.date}</span>
                            </div>
                            <div className="timeline-stage">
                              <span className="stage-badge">{day.stage}</span>
                            </div>
                            <div className="timeline-tasks">
                              <p className="task-english">{day.tasks}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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