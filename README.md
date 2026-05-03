# 🌾 AgriTrace Market - Farmer Dashboard

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive farmer dashboard for the agricultural marketplace that connects buyers directly with farmers for future harvests. Built with React, Vite, and integrated with Google Maps for location tracking.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Integration](#api-integration)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication
- User registration with validation
- Secure login with JWT tokens
- Forgot password functionality
- Session persistence

### 🌱 Crop Management
- Register new plantings with crop selection
- Input land size (acres)
- Automatic yield calculation based on crop type
- Track planting history

### 🗺️ Location Services
- Google Maps integration with draggable marker
- Search by place name (Places Autocomplete)
- Manual location entry as backup
- Location presets for common areas
- Reverse geocoding (address from coordinates)

### 📅 Growth Calendar
- Day-by-day growth stage tracking
- Stage-specific task recommendations
- Visual progress indicators
- Expected harvest date calculation

### 📊 Dashboard
- Real-time statistics (active plantings, total land, expected yield)
- Upcoming events (7-day forecast)
- Quick action buttons
- Recent plantings overview

### 🛒 Marketplace
- View your listings
- Activate hidden listings
- Set/update pricing
- Track listing status

### ✅ Input Validation
- Email format validation
- Phone number validation (10-12 digits)
- Password strength indicator
- Name validation (letters/spaces only)
- Land size validation (0.1 - 1000 acres)
- Planting date validation (no future dates)
- Real-time error messages

### 📱 Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts for all screen sizes

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18.2.0 | Frontend framework |
| Vite 4.4.5 | Build tool & dev server |
| Google Maps API | Location services |
| Axios (mock) | API communication |
| CSS3 | Styling & animations |
| Font Awesome 6 | Icons |
| JWT | Authentication |

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone https://github.com/AgritraceMarkets/Farmers-app.git
cd Farmers-app