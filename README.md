# 🐛 BugSquash CI — Professional QA Test Management Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-MEAN-red)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![Angular](https://img.shields.io/badge/angular-17-dd0031)

## 📋 Overview

**BugSquash CI** is a production-ready, full-stack QA Test Management Platform built with the **MEAN stack** (MongoDB, Express.js, Angular 17, Node.js). It provides comprehensive test case management, execution tracking, real-time metrics dashboards, and role-based access control for QA teams.

### 🎯 Key Features

- **JWT Authentication** — Secure login with bcrypt hashing and account lockout protection
- **Role-Based Access Control** — Admin, QA Engineer, Developer, and Viewer roles
- **Test Case Management** — Full CRUD with filtering, sorting, search, and pagination
- **Execution Tracking** — Record test results with pass/fail analytics and history
- **Metrics Dashboard** — Real-time stats, charts, and test type distribution
- **Security Features** — Helmet.js, CORS, input validation, account lockout after 5 failed attempts
- **Responsive Design** — Premium UI with Tailwind CSS, glassmorphism, and micro-animations
- **Deployment Ready** — Docker, PM2, Nginx, and AWS EC2 configurations included

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 17, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT + bcrypt |
| **Testing** | Postman Collections with test scripts |
| **DevOps** | Docker, PM2, Nginx, AWS EC2 |

---

## 📁 Project Structure

```
bug-squash-ci/
├── server/                    # Node.js/Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── testCaseController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT & role middleware
│   │   ├── validation.js      # Input validation
│   │   └── errorHandler.js    # Centralized error handling
│   ├── models/
│   │   ├── User.js            # User schema with auth methods
│   │   ├── TestCase.js        # Test case with execution history
│   │   ├── Project.js         # Project organization
│   │   └── TestSuite.js       # Test suite grouping
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── testCaseRoutes.js
│   ├── app.js                 # Express server entry
│   ├── seed.js                # Database seeder
│   └── ecosystem.config.js    # PM2 configuration
├── client/                    # Angular 17 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services, guards, interceptors
│   │   │   ├── features/      # Components (auth, dashboard, test-cases, profile)
│   │   │   └── shared/        # Layout component
│   │   ├── environments/
│   │   └── styles.css         # Tailwind design system
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── tests/
│   └── postman/               # Postman API test collection
├── scripts/
│   └── deploy.sh              # Deployment automation
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** 7+ (local or Atlas)
- **Angular CLI** 17+ (`npm install -g @angular/cli@17`)
- **Postman** (for API testing)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bug-squash-ci.git
cd bug-squash-ci
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env    # Configure your environment variables
npm run dev             # Starts on http://localhost:5000
```

### 3. Seed Demo Data

```bash
cd server
npm run seed
```

This creates demo users and 12 sample test cases.

### 4. Frontend Setup

```bash
cd client
npm install
ng serve                # Starts on http://localhost:4200
```

### 5. Access the Application

| URL | Description |
|-----|-------------|
| `http://localhost:4200` | Angular Frontend |
| `http://localhost:5000` | Express API |
| `http://localhost:5000/api/health` | Health Check |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@bugsquash.com | Admin123 |
| **QA Engineer** | sarah@bugsquash.com | Sarah123 |
| **Developer** | mike@bugsquash.com | Mike1234 |
| **Viewer** | emily@bugsquash.com | Emily123 |

> Run `npm run seed` in the server directory to create these accounts.

---

## 📊 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login | Public |
| `GET` | `/api/auth/me` | Get current user | Private |
| `PUT` | `/api/auth/profile` | Update profile | Private |
| `PUT` | `/api/auth/change-password` | Change password | Private |
| `POST` | `/api/auth/logout` | Logout | Private |

### Test Cases

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/testcases` | Get all (with filters & pagination) | Private |
| `POST` | `/api/testcases` | Create test case | Admin, QA |
| `GET` | `/api/testcases/:id` | Get single test case | Private |
| `PUT` | `/api/testcases/:id` | Update test case | Admin, QA |
| `DELETE` | `/api/testcases/:id` | Delete test case | Admin |
| `POST` | `/api/testcases/:id/execute` | Add execution record | Admin, QA, Dev |
| `GET` | `/api/testcases/metrics/summary` | Get QA metrics | Private |

### Query Parameters

```
GET /api/testcases?page=1&limit=10&sort=-createdAt&status=Active&priority=Critical&search=login
```

---

## 🧪 Testing with Postman

1. Import `tests/postman/BugSquash_CI_Collection.json` into Postman
2. Run the collection in order (Register → Login → CRUD operations)
3. Tests automatically validate responses and store tokens

```bash
# Run via Newman (CLI)
npx newman run tests/postman/BugSquash_CI_Collection.json
```

---

## 🚢 Deployment

### Docker Deployment

```bash
docker-compose up -d
```

### AWS EC2 Deployment

```bash
# 1. Launch Ubuntu 22.04 LTS instance
# 2. SSH into the instance
# 3. Install dependencies
sudo apt update && sudo apt install -y nginx nodejs npm
sudo npm install -g pm2 @angular/cli@17

# 4. Clone and deploy
git clone https://github.com/yourusername/bug-squash-ci.git
cd bug-squash-ci
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 📈 Performance Optimizations

- **MongoDB Indexes** on frequently queried fields (testId, status, priority, tags)
- **Gzip Compression** for API responses via `compression` middleware
- **Helmet.js** security headers
- **PM2 Cluster Mode** for Node.js load balancing
- **Nginx Static Asset Caching** with 1-year expiry
- **Angular Production Build** with AOT compilation and tree-shaking

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt (10 salt rounds) |
| JWT Authentication | 7-day expiration |
| Account Lockout | 5 failed attempts → 30-min lock |
| RBAC | 4 roles with endpoint-level authorization |
| Security Headers | Helmet.js |
| CORS | Configurable origin |
| Input Validation | Server-side middleware |
| Error Handling | Centralized, env-aware stack traces |

---

## 👤 Author

**Sohaib Akhlaq**  
Full-Stack Developer | MEAN Stack | QA Engineering

- GitHub: [yourusername](https://github.com/yourusername)
- LinkedIn: [yourprofile](https://linkedin.com/in/yourprofile)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
