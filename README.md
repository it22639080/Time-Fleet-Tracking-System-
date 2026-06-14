# 🚚 Real-Time Fleet Tracking System

A modern **Uber-style real-time fleet tracking system** built for logistics companies, delivery platforms, transportation businesses, and fleet managers. The system enables admins, drivers, and users to track vehicles in real time using GPS, WebSockets, Redis caching, MongoDB trip history, Google Maps, geo-fencing, and a modern animated dashboard.

---

## 📌 Project Overview

The **Real-Time Fleet Tracking System** is a scalable full-stack web application designed to monitor vehicles live on an interactive map. Drivers can send GPS updates, admins can monitor the entire fleet, and users can track their assigned vehicle in real time.

This system is designed with a modern backend architecture using **Node.js, Express.js, MongoDB, Redis, Socket.io**, and a beautiful frontend using **React.js, Tailwind CSS, Framer Motion**, and **Google Maps API**.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* Login and signup system
* JWT-based authentication
* Password encryption using bcrypt
* Role-based access control

### 👥 User Roles

* **Admin**: Manage vehicles, drivers, users, trips, alerts, and fleet dashboard
* **Driver**: Start/stop trips and send live GPS location updates
* **User**: Track assigned vehicle in real time

### 📍 Real-Time Vehicle Tracking

* Live vehicle location updates
* Socket.io-based real-time communication
* Smooth vehicle marker movement on map
* Live speed, heading, and location status

### 🗺️ Google Maps Integration

* Live fleet map
* Vehicle markers
* Route polyline
* Geo-fence overlays
* Route replay for completed trips

### ⚡ Redis Live Location Cache

* Stores latest vehicle locations
* Reduces MongoDB load
* Improves real-time response speed
* Supports scalable location tracking

### 🚗 Trip Management

* Create trips
* Start and stop trips
* Track active trips
* Store route points
* Calculate distance and duration
* View completed trip history

### 🧭 Geo-Fencing Alerts

* Create circular and polygon geo-fences
* Detect vehicle entering/exiting zones
* Generate real-time alerts
* Admin alert dashboard

### 📊 Admin Dashboard

* Total vehicles
* Active trips
* Online drivers
* Offline vehicles
* Recent alerts
* Live fleet map
* Fleet status table

### 👨‍✈️ Driver Dashboard

* Assigned vehicle details
* Start journey
* Stop journey
* Live GPS status
* Location permission handling
* Demo/simulation mode support

### 👤 User Tracking Interface

* Uber-style tracking screen
* Assigned vehicle live location
* Driver and vehicle details
* Live trip status
* Animated bottom tracking panel

### 🔁 Route History & Replay

* View previous trips
* Replay completed trip routes
* Animated marker movement
* Timeline controls

### 🧪 Demo Simulation Mode

* Simulate vehicle movement without real GPS
* Useful for project demos and interviews
* Admin can start/stop demo tracking

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion
* React Router
* Socket.io Client
* Google Maps API
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.io
* Redis
* JWT
* bcrypt
* dotenv

### Database & Cache

* MongoDB Atlas / Local MongoDB
* Redis / Upstash Redis

### Deployment

* Frontend: Vercel / Netlify
* Backend: Render / Railway / Fly.io
* Database: MongoDB Atlas
* Redis: Upstash Redis

---

## 📁 Project Structure

```bash
Real-Time-Fleet-Tracking-System/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── map/
│   │   │   ├── vehicles/
│   │   │   ├── trips/
│   │   │   └── alerts/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── driver/
│   │   │   └── user/
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   ├── vehicleService.js
│   │   │   ├── tripService.js
│   │   │   └── alertService.js
│   │   │
│   │   ├── utils/
│   │   ├── animations/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── tripController.js
│   │   ├── geofenceController.js
│   │   └── alertController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Trip.js
│   │   ├── LocationPoint.js
│   │   ├── GeoFence.js
│   │   └── Alert.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── geofenceRoutes.js
│   │   └── alertRoutes.js
│   │
│   ├── services/
│   │   ├── locationCacheService.js
│   │   ├── geofenceService.js
│   │   └── simulationService.js
│   │
│   ├── sockets/
│   │   └── locationSocket.js
│   │
│   ├── utils/
│   │   ├── calculateDistance.js
│   │   └── apiResponse.js
│   │
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── README.md
└── docker-compose.yml
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173

REDIS_URL=your_redis_url
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/real-time-fleet-tracking-system.git
cd real-time-fleet-tracking-system
```

---

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

### 4. Configure Environment Variables

Create `.env` files inside both `server` and `client` folders.

Use the examples given above.

---

### 5. Run Backend Server

```bash
cd server
npm run dev
```

Backend will run on:

```bash
http://localhost:5000
```

---

### 6. Run Frontend

```bash
cd client
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 🔌 Main API Endpoints

### Auth Routes

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

---

### Vehicle Routes

```http
POST   /api/vehicles
GET    /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id

PATCH  /api/vehicles/:id/assign-driver
PATCH  /api/vehicles/:id/assign-user

GET    /api/vehicles/my-vehicle
GET    /api/vehicles/my-tracking
```

---

### Trip Routes

```http
POST  /api/trips
GET   /api/trips
GET   /api/trips/:id

POST  /api/trips/start
PATCH /api/trips/:id/stop
PATCH /api/trips/:id/cancel

GET   /api/trips/my-trips
GET   /api/trips/my-history
GET   /api/trips/my-tracking
GET   /api/trips/:id/route
```

---

### Geo-Fence Routes

```http
POST   /api/geofences
GET    /api/geofences
GET    /api/geofences/:id
PUT    /api/geofences/:id
DELETE /api/geofences/:id
```

---

### Alert Routes

```http
GET   /api/alerts
PATCH /api/alerts/:id/read
PATCH /api/alerts/read-all
```

---

### Simulation Routes

```http
POST /api/simulation/start/:vehicleId
POST /api/simulation/stop/:vehicleId
GET  /api/simulation/status
```

---

## 📡 Socket.io Events

### Driver Events

```js
driver:join
location:update
trip:start
trip:stop
```

### Admin Events

```js
admin:join
vehicle:location
vehicle:status
fleet:summary
alert:new
```

### User Events

```js
user:join
assignedVehicle:location
assignedVehicle:status
```

---

## 👥 Role-Based Access

| Role   | Permissions                                                             |
| ------ | ----------------------------------------------------------------------- |
| Admin  | Manage vehicles, drivers, users, trips, geo-fences, alerts, and reports |
| Driver | View assigned vehicle, start/stop trips, send GPS updates               |
| User   | Track assigned vehicle and view trip status                             |

---

## 🧠 System Workflow

```txt
Driver GPS Location
        ↓
Socket.io Location Update
        ↓
Backend Validation
        ↓
Redis Live Location Cache
        ↓
MongoDB Trip Route Storage
        ↓
Geo-Fence Checking
        ↓
Real-Time Emit to Admin/User Dashboard
        ↓
Google Map Marker Updates
```

---

## 🗺️ Real-Time Tracking Flow

1. Driver logs into the system.
2. Driver starts a trip.
3. Browser geolocation captures driver location.
4. Location is sent through Socket.io.
5. Backend validates the driver and assigned vehicle.
6. Redis stores the latest live location.
7. MongoDB stores route history.
8. Admin dashboard receives live location updates.
9. Assigned user tracking page receives live vehicle movement.
10. Geo-fence alerts are generated when needed.

---

## 🧪 Demo Mode

The system includes a demo/simulation mode to show real-time vehicle movement without requiring a physical driver.

Demo mode can:

* Move a vehicle along predefined coordinates
* Emit live location updates
* Update the admin map
* Update the user tracking screen
* Trigger route drawing
* Support project presentation and interview demos

---

## 🎨 UI/UX Highlights

* Premium dashboard interface
* Glassmorphism cards
* Smooth page transitions
* Animated vehicle markers
* Live status badges
* Responsive layouts
* Animated notification alerts
* Uber-style tracking page
* Modern SaaS-style admin dashboard
* Loading skeletons and empty states

---

## 📊 Admin Dashboard Pages

* Dashboard Overview
* Live Tracking
* Vehicle Management
* Driver Management
* Trip Management
* Geo-Fence Management
* Alert Center
* Reports & Analytics
* Settings

---

## 🚗 Driver Dashboard Pages

* Assigned Vehicle
* Trip Controls
* Live GPS Status
* Mini Map
* Trip History

---

## 👤 User Pages

* Live Tracking Page
* Assigned Vehicle Details
* Trip Timeline
* Trip History

---

## 🔒 Security Features

* JWT authentication
* Password hashing using bcrypt
* Role-based route protection
* Protected Socket.io connection
* Request validation
* Secure environment variables
* CORS configuration
* Rate limiting for sensitive routes
* Centralized error handling

---

## 🧮 Distance Calculation

The system uses the **Haversine formula** to calculate approximate distance between GPS coordinates.

This is used for:

* Trip distance calculation
* Route analytics
* Driver movement tracking
* Trip summary reports

---

## 🧪 Testing Checklist

* [ ] Admin can log in
* [ ] Driver can log in
* [ ] User can log in
* [ ] Admin can create vehicle
* [ ] Admin can assign driver
* [ ] Admin can assign user
* [ ] Driver can start trip
* [ ] Driver can stop trip
* [ ] Driver location updates through Socket.io
* [ ] Admin sees vehicle moving live
* [ ] User sees assigned vehicle live
* [ ] Redis stores latest location
* [ ] MongoDB stores trip route points
* [ ] Geo-fence alert triggers correctly
* [ ] Route replay works
* [ ] Demo simulation works
* [ ] App works on mobile and desktop

---

## 🐳 Docker Setup

Run the project with Docker:

```bash
docker-compose up --build
```

Services:

* Backend
* MongoDB
* Redis

---

## 🌍 Deployment Plan

### Frontend

Deploy using:

* Vercel
* Netlify

### Backend

Deploy using:

* Render
* Railway
* Fly.io

### Database

Use:

* MongoDB Atlas

### Redis

Use:

* Upstash Redis
* Railway Redis
* Render Redis

---

## 📌 Future Enhancements

* Driver mobile app using React Native
* Push notifications
* SMS alerts
* AI-based route optimization
* Fuel usage analytics
* Driver behavior analysis
* Overspeed detection
* Maintenance prediction
* Multi-company SaaS support
* Live traffic integration
* ETA calculation
* PDF trip reports

---

## 📸 Screenshots

Add project screenshots here after completing the UI.

```md
![Admin Dashboard](./screenshots/admin-dashboard.png)
![Live Tracking](./screenshots/live-tracking.png)
![Driver Dashboard](./screenshots/driver-dashboard.png)
![User Tracking](./screenshots/user-tracking.png)
```

---

## 👨‍💻 Author

**Kavindu Madhusanka**

Software Engineering / Full Stack Development Project

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Project Status

This project is under active development.

Current focus:

* Real-time tracking
* Admin dashboard
* Driver GPS updates
* User tracking interface
* Geo-fencing
* Demo simulation mode

---
