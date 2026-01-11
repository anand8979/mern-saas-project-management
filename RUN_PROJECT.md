# How to Run the MERN Project Management Application

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Step-by-Step Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

The `.env` file in the `backend` folder is already created with the following configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-project-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

**Note:** Make sure MongoDB is running on your system. If MongoDB is running on a different host/port, update the `MONGODB_URI` in `backend/.env`.

### 4. Start MongoDB (if not already running)

**Windows:**
- Make sure MongoDB service is running
- Or start it manually: `mongod`

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
mongod
```

### 5. Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### 6. Start the Frontend Server

Open a **new terminal** (keep the backend running) and run:
```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## Summary

You need **2 terminal windows** running:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## First Time Setup (Quick Start)

If you haven't installed dependencies yet, run these commands:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Then follow steps 5 and 6 above
```

## Troubleshooting

1. **MongoDB Connection Error:**
   - Make sure MongoDB is installed and running
   - Check if the MongoDB URI in `.env` is correct
   - Try: `mongod` in a separate terminal

2. **Port Already in Use:**
   - Backend port 5000: Change `PORT` in `backend/.env`
   - Frontend port 3000: React will automatically use the next available port

3. **Module Not Found:**
   - Make sure you ran `npm install` in both `backend` and `frontend` folders
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

4. **CORS Errors:**
   - Make sure the backend is running on port 5000
   - The frontend is configured to proxy to `http://localhost:5000`

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Default User Roles

After registration, users are assigned the 'member' role by default. You can change roles through the User Management page (admin only) or directly in the database.
