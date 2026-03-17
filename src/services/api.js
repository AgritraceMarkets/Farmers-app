// API Service - Handles all backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set this to true for testing without backend
const MOCK_MODE = true;

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Helper for fetch with auth (only used when MOCK_MODE = false)
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ============ MOCK DATA ============

// Mock Users Database
const mockUsers = [
  {
    id: 1,
    full_name: "John Farmer",
    email: "john@farm.com",
    phone_number: "0712345678",
    password: "password123",
    role: "Farmer"
  },
  {
    id: 2,
    full_name: "Mary Grower",
    email: "mary@farm.com",
    phone_number: "0723456789",
    password: "password123",
    role: "Farmer"
  }
];

// Mock Crops
const mockCrops = {
  data: [
    {
      id: 1,
      crop_name: "Maize",
      baseline_yield_per_acre: 2500,
      total_maturity_days: 120,
      price_per_kg: 45.50,
      image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300",
      description: "High yield yellow maize"
    },
    {
      id: 2,
      crop_name: "Rice",
      baseline_yield_per_acre: 1800,
      total_maturity_days: 150,
      price_per_kg: 65.00,
      image_url: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=300",
      description: "Premium quality rice"
    },
    {
      id: 3,
      crop_name: "Beans",
      baseline_yield_per_acre: 800,
      total_maturity_days: 95,
      price_per_kg: 120.00,
      image_url: "https://images.unsplash.com/photo-1461354464878-ad92f492efcf?w=300",
      description: "Nutritious beans"
    },
    {
      id: 4,
      crop_name: "Coriander",
      baseline_yield_per_acre: 800,
      total_maturity_days: 45,
      price_per_kg: 200.00,
      image_url: "https://images.unsplash.com/photo-1596090906397-1f2a5f4c3e9c?w=300",
      description: "Fresh coriander leaves"
    },
    {
      id: 5,
      crop_name: "Lettuce",
      baseline_yield_per_acre: 4000,
      total_maturity_days: 60,
      price_per_kg: 80.00,
      image_url: "https://images.unsplash.com/photo-1622206151226-18ca73c5f5b5?w=300",
      description: "Fresh lettuce"
    },
    {
      id: 6,
      crop_name: "Cabbage",
      baseline_yield_per_acre: 6000,
      total_maturity_days: 90,
      price_per_kg: 50.00,
      image_url: "https://images.unsplash.com/photo-1598030343076-89e6f6c8e6b7?w=300",
      description: "Fresh cabbage"
    },
    {
      id: 7,
      crop_name: "Kale",
      baseline_yield_per_acre: 3500,
      total_maturity_days: 55,
      price_per_kg: 60.00,
      image_url: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=300",
      description: "Fresh kale"
    }
  ]
};

// Mock Dashboard
const mockDashboard = {
  data: {
    summary: {
      total_plantings: 5,
      active_plantings: 3,
      total_expected_yield: 12500
    },
    upcoming_events: [
      {
        stage_name: "Fertilizer Application",
        event_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        crop_name: "Maize",
        planting_id: 1,
        days_remaining: 2
      },
      {
        stage_name: "First Weeding",
        event_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        crop_name: "Rice",
        planting_id: 2,
        days_remaining: 4
      },
      {
        stage_name: "Harvest",
        event_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        crop_name: "Beans",
        planting_id: 3,
        days_remaining: 6
      }
    ]
  }
};

// Mock Plantings
const mockPlantings = {
  data: [
    {
      id: 1,
      crop_name: "Maize",
      crop_id: 1,
      land_size_acres: 2.5,
      expected_yield_kg: 6250,
      status: "Planted",
      planting_date: "2024-02-15",
      expected_harvest_date: "2024-06-15"
    },
    {
      id: 2,
      crop_name: "Rice",
      crop_id: 2,
      land_size_acres: 1.8,
      expected_yield_kg: 3240,
      status: "Active",
      planting_date: "2024-03-01",
      expected_harvest_date: "2024-07-28"
    },
    {
      id: 3,
      crop_name: "Beans",
      crop_id: 3,
      land_size_acres: 1.2,
      expected_yield_kg: 960,
      status: "Pending",
      planting_date: "2024-03-10",
      expected_harvest_date: "2024-06-13"
    }
  ]
};

// Mock Planting Details
const mockPlantingDetails = (id) => ({
  data: {
    planting_info: {
      id: id,
      crop_name: id === 1 ? "Maize" : id === 2 ? "Rice" : "Beans",
      crop_id: id,
      land_size_acres: id === 1 ? 2.5 : id === 2 ? 1.8 : 1.2,
      expected_yield_kg: id === 1 ? 6250 : id === 2 ? 3240 : 960,
      status: id === 1 ? "Planted" : id === 2 ? "Active" : "Pending",
      planting_date: id === 1 ? "2024-02-15" : id === 2 ? "2024-03-01" : "2024-03-10",
      expected_harvest_date: id === 1 ? "2024-06-15" : id === 2 ? "2024-07-28" : "2024-06-13"
    },
    calendar: [
      {
        stage_name: "Germination",
        start_day: 0,
        end_day: 7,
        duration_days: 7,
        start_date: id === 1 ? "2024-02-15" : id === 2 ? "2024-03-01" : "2024-03-10",
        end_date: id === 1 ? "2024-02-22" : id === 2 ? "2024-03-08" : "2024-03-17"
      },
      {
        stage_name: "Vegetative Growth",
        start_day: 7,
        end_day: 45,
        duration_days: 38,
        start_date: id === 1 ? "2024-02-22" : id === 2 ? "2024-03-08" : "2024-03-17",
        end_date: id === 1 ? "2024-03-31" : id === 2 ? "2024-04-15" : "2024-04-24"
      },
      {
        stage_name: "Flowering",
        start_day: 45,
        end_day: 65,
        duration_days: 20,
        start_date: id === 1 ? "2024-03-31" : id === 2 ? "2024-04-15" : "2024-04-24",
        end_date: id === 1 ? "2024-04-20" : id === 2 ? "2024-05-05" : "2024-05-14"
      },
      {
        stage_name: "Fruit Development",
        start_day: 65,
        end_day: 85,
        duration_days: 20,
        start_date: id === 1 ? "2024-04-20" : id === 2 ? "2024-05-05" : "2024-05-14",
        end_date: id === 1 ? "2024-05-10" : id === 2 ? "2024-05-25" : "2024-06-03"
      },
      {
        stage_name: "Maturity",
        start_day: 85,
        end_day: id === 1 ? 120 : id === 2 ? 150 : 95,
        duration_days: id === 1 ? 35 : id === 2 ? 65 : 10,
        start_date: id === 1 ? "2024-05-10" : id === 2 ? "2024-05-25" : "2024-06-03",
        end_date: id === 1 ? "2024-06-15" : id === 2 ? "2024-07-28" : "2024-06-13"
      }
    ]
  }
});

// Mock Marketplace
const mockMarketplace = {
  data: [
    {
      id: 1,
      planting_request_id: 1,
      available_quantity_kg: 6250,
      price_per_kg: 45.50,
      listing_status: "Hidden",
      crop_name: "Maize",
      planting_status: "Planted"
    },
    {
      id: 2,
      planting_request_id: 2,
      available_quantity_kg: 3240,
      price_per_kg: 65.00,
      listing_status: "Active",
      crop_name: "Rice",
      planting_status: "Active"
    }
  ]
};

// ============ MOCK API FUNCTIONS ============

// Mock Auth Functions
const mockAuth = {
  login: (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === credentials.email);
        
        if (user && user.password === credentials.password) {
          const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
          resolve({
            message: "Login successful",
            token: token,
            user: {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              phone_number: user.phone_number,
              role: user.role
            }
          });
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 500);
    });
  },

  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(u => u.email === userData.email);
        
        if (existingUser) {
          reject(new Error("User with this email already exists"));
        } else {
          const newUser = {
            id: mockUsers.length + 1,
            full_name: userData.full_name,
            email: userData.email,
            phone_number: userData.phone_number,
            password: userData.password,
            role: userData.role || "Farmer"
          };
          
          mockUsers.push(newUser);
          
          const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email }));
          
          resolve({
            message: "Registration successful",
            token: token,
            user: {
              id: newUser.id,
              full_name: newUser.full_name,
              email: newUser.email,
              phone_number: newUser.phone_number,
              role: newUser.role
            }
          });
        }
      }, 500);
    });
  },

  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        
        if (user) {
          console.log(`Password reset email sent to: ${email}`);
          resolve({ 
            message: "Password reset instructions sent to your email" 
          });
        } else {
          reject(new Error("Email not found"));
        }
      }, 500);
    });
  },

  resetPassword: (token, newPassword) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token && newPassword) {
          resolve({ 
            message: "Password reset successful" 
          });
        } else {
          reject(new Error("Invalid or expired token"));
        }
      }, 500);
    });
  },

  verifyResetToken: (token) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token) {
          resolve({ 
            valid: true,
            message: "Token is valid" 
          });
        } else {
          reject(new Error("Invalid token"));
        }
      }, 500);
    });
  }
};

// Mock Crops Functions
const mockCropsAPI = {
  getAllCrops: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCrops), 300);
    });
  }
};

// Mock Farmer Functions
const mockFarmerAPI = {
  getDashboard: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDashboard), 300);
    });
  },
  
  getPlantingHistory: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPlantings), 300);
    });
  },
  
  getPlantingDetails: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPlantingDetails(id)), 300);
    });
  },
  
  savePlanting: (plantingData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPlanting = {
          id: mockPlantings.data.length + 1,
          ...plantingData,
          status: "Pending",
          expected_harvest_date: new Date(new Date(plantingData.planting_date).getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        mockPlantings.data.push(newPlanting);
        
        resolve({
          message: "Planting request submitted successfully",
          data: newPlanting
        });
      }, 500);
    });
  },
  
  updatePlantingStatus: (id, statusData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const planting = mockPlantings.data.find(p => p.id === parseInt(id));
        if (planting) {
          planting.status = statusData.status;
        }
        resolve({ message: "Status updated successfully" });
      }, 300);
    });
  }
};

// Mock Marketplace Functions
const mockMarketplaceAPI = {
  getMyListings: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMarketplace), 300);
    });
  },
  
  updateListing: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const listing = mockMarketplace.data.find(l => l.id === parseInt(id));
        if (listing) {
          if (data.price_per_kg) listing.price_per_kg = data.price_per_kg;
          if (data.listing_status) listing.listing_status = data.listing_status;
        }
        resolve({ message: "Listing updated successfully" });
      }, 300);
    });
  }
};

// ============ EXPORT API ============

export const authAPI = MOCK_MODE ? mockAuth : {
  login: (credentials) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  forgotPassword: (email) => fetchWithAuth('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  resetPassword: (token, newPassword) => fetchWithAuth('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  }),
  verifyResetToken: (token) => fetchWithAuth(`/auth/verify-token/${token}`)
};

export const cropsAPI = MOCK_MODE ? mockCropsAPI : {
  getAllCrops: () => fetchWithAuth('/crops/all')
};

export const farmerAPI = MOCK_MODE ? mockFarmerAPI : {
  getDashboard: () => fetchWithAuth('/farmer/dashboard'),
  getPlantingHistory: () => fetchWithAuth('/planting/my-plantings'),
  getPlantingDetails: (id) => fetchWithAuth(`/planting/details/${id}`),
  savePlanting: (plantingData) => fetchWithAuth('/planting/save', {
    method: 'POST',
    body: JSON.stringify(plantingData)
  }),
  updatePlantingStatus: (id, status) => fetchWithAuth(`/planting/update-status/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
};

export const marketplaceAPI = MOCK_MODE ? mockMarketplaceAPI : {
  getMyListings: () => fetchWithAuth('/marketplace/my-listings'),
  updateListing: (id, data) => fetchWithAuth(`/marketplace/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

export default {
  auth: authAPI,
  farmer: farmerAPI,
  crops: cropsAPI,
  marketplace: marketplaceAPI
};