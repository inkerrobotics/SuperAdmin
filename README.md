# Super Admin Dashboard

Multi-tenant SaaS platform for managing Lucky Draw system with separate authentication for Super Admin and Tenants.

---

## 🚀 Quick Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cd backend
cp .env.example .env
# Edit .env with your database credentials

# 3. Apply database schema
npx prisma db push
npx prisma generate

# 4. Build and start
npm run build
npm run dev  # Backend on port 5001

# 5. Start frontend (new terminal)
cd ../frontend
npm run dev  # Frontend on port 5173
```

---

## 🎯 Two Separate Authentication Systems

### Super Admin Dashboard
- **URL**: `http://localhost:5173`
- **Login**: `admin@example.com / Admin@123`
- **API**: `POST /api/auth/super-admin/login`
- **Purpose**: Manage platform, create/manage tenants

### Tenant Login (Lucky Draw System)
- **URL**: Your Lucky Draw frontend
- **Login**: Credentials created by Super Admin
- **API**: `POST /api/tenant-auth/login`
- **Purpose**: Access Lucky Draw features

**⚠️ Important**: Tenant credentials are for Lucky Draw system, NOT Super Admin dashboard!

---

## 📊 Database Schema

### Clean and Optimized Structure

The database schema has been cleaned and optimized for performance:

**Super Admin Tables:**
- `User` - Admin users with role-based access
- `Tenant` - Client organizations with all details in one table
- `TenantPermission` - Lucky Draw module permissions per tenant
- `TenantStatusHistory` - Audit trail for status changes
- `CustomRole` & `RolePermission` - Custom role management
- `SystemSetting` & `SettingHistory` - Platform configuration
- `EmailTemplate` - Email templates with versioning
- `ActivityLog` - Complete audit trail
- `Notification` & `NotificationTemplate` - Notification system
- `Backup` - Backup management
- `EmailLog` - Email delivery tracking
- `Session` - User session management

**Lucky Draw Tables:**
- All Lucky Draw system tables maintained as-is for compatibility
- Includes: contests, prizes, participants, draws, winners, forms, scratch cards, etc.

### Tenant Model Structure
```
Tenant (Single Optimized Table)
├── Core: id, tenantId, name, email, password, status, subscriptionPlan
├── Organization: logo, category, displayName, brandColor
├── Admin Contact: fullName, mobile, designation
├── Operational: timezone, country, region, drawFrequency
├── Compliance: verificationStatus, consents
├── Support: contacts (primary, support, escalation)
└── WhatsApp: 5 encrypted credential fields (AES-256-CBC)
```

**Key Features:**
- 🔒 WhatsApp credentials encrypted with AES-256-CBC
- ⚡ Strategic indexes for fast queries
- 🧹 No redundant fields
- 📈 Optimized for both Super Admin and Lucky Draw systems

---

## 🔐 API Endpoints

### Super Admin
```
POST   /api/auth/super-admin/login    - Login
POST   /api/auth/logout                - Logout
GET    /api/tenants                    - List tenants
POST   /api/tenants/create             - Create tenant
PATCH  /api/tenants/:id/status         - Update status
```

### Tenant (Lucky Draw)
```
POST   /api/tenant-auth/login          - Login
POST   /api/tenant-auth/logout         - Logout
GET    /api/tenant-auth/profile        - Get profile
PATCH  /api/tenant-auth/whatsapp-credentials - Update WhatsApp
```

---

## 🏢 Creating a Tenant

Super Admin creates tenant with comprehensive form:
1. **Basic**: Name, email, password, subscription
2. **Organization**: Logo, business category
3. **Admin Contact**: Full name, mobile, designation
4. **Branding**: Display name, brand color
5. **Operational**: Timezone, country, draw frequency
6. **Permissions**: 6 Lucky Draw modules × 4 levels (View/Create/Edit/Delete)
7. **WhatsApp**: 5 encrypted credential fields
8. **Compliance**: Data consent, privacy acknowledgment (required)
9. **Support**: Primary, support, escalation contacts

**Tenant Status Flow**: PENDING → ACTIVE → INACTIVE/SUSPENDED

Only ACTIVE tenants can login to Lucky Draw system.

---

## 🔧 Lucky Draw Frontend Integration

Update your Lucky Draw system to use tenant authentication:

### 1. Change Login Endpoint
```javascript
// FROM: POST /api/auth/login
// TO:   POST /api/tenant-auth/login

const response = await axios.post('/api/tenant-auth/login', {
  email,
  password
});
```

### 2. Change Token Storage
```javascript
// FROM: localStorage.setItem('token', ...)
// TO:   localStorage.setItem('tenant_token', ...)

localStorage.setItem('tenant_token', response.data.token);
localStorage.setItem('tenant_info', JSON.stringify(response.data.tenant));
```

### 3. Update Axios Interceptor
```javascript
// FROM: const token = localStorage.getItem('token');
// TO:   const token = localStorage.getItem('tenant_token');

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('tenant_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🧪 Testing

```bash
cd backend

# Test full tenant login flow
node test-tenant-login.js

# Test specific credentials
node test-tenant-auth-quick.js email@example.com password

# Check database users and tenants
node check-users.js
```

---

## 🐛 Troubleshooting

### 401 Unauthorized in Lucky Draw
1. Check endpoint: Should be `/api/tenant-auth/login` (not `/api/auth/login`)
2. Check token key: Should be `tenant_token` (not `token`)
3. Check tenant status: Must be ACTIVE in Super Admin dashboard
4. Check CORS: Backend allows Lucky Draw origin

### Build Errors
```bash
npx prisma generate
npm run build
```

### Database Issues
```bash
# Reset and reapply schema
npx prisma db push --force-reset
npx prisma generate
```

---

## 📁 Project Structure

```
Super Admin/
├── README.md (this file)
├── docker-compose.yml
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma (single Tenant table)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── tenant-auth.controller.ts
│   │   │   └── tenants.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── tenant-auth.service.ts
│   │   │   └── tenants.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── tenant-auth.middleware.ts
│   │   └── routes/
│   ├── test-tenant-login.js
│   ├── test-tenant-auth-quick.js
│   └── check-users.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── SuperAdminLogin.tsx
        │   ├── TenantsManagement.tsx
        │   └── CreateTenant.tsx
        └── services/
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt
- **WhatsApp Encryption**: AES-256-CBC
- **JWT Tokens**: Separate for admin/tenant
- **Activity Logging**: Complete audit trail
- **Session Management**: Track active sessions
- **Role-Based Access**: ADMIN and USER roles

---

## 🚢 Deployment

### Docker
```bash
docker-compose up -d
```

### Render.com
```bash
git push origin main
# Configured in render.yaml
```

### Manual
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx
```

---

## 📦 Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT, bcrypt
- **Encryption**: AES-256-CBC

---

## ✅ Setup Checklist

- [x] Install dependencies
- [x] Configure .env
- [x] Run `npx prisma db push`
- [x] Run `npx prisma generate`
- [x] Run `npm run build`
- [x] Test with `node test-tenant-login.js`
- [x] Start servers
- [ ] Update Lucky Draw frontend endpoints
- [ ] Test tenant login in Lucky Draw

---

## 🎯 Summary

This is a multi-tenant SaaS platform with:
- **Two separate authentication systems** (Super Admin + Tenant)
- **Single Tenant table** with all fields for better performance
- **Comprehensive tenant management** with full creation form
- **Encrypted WhatsApp integration** for each tenant
- **Complete audit trail** and activity logging
- **Ready for production** with Docker configs

**Key Point**: Tenant credentials created by Super Admin are for the Lucky Draw system, NOT the Super Admin dashboard!

---

## 📞 Support

For issues:
1. Check this README
2. Run test scripts (`node test-tenant-login.js`)
3. Check browser console and network tab
4. Verify database schema with `npx prisma studio`

---

**Ready to start!** Follow the Quick Setup section above. 🚀
