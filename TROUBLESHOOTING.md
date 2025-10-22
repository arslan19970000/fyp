# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ⚠️ "nodemon app crashed - waiting for file changes before starting..."

**What you see:**
```
[nodemon] app crashed - waiting for file changes before starting...
Error: listen EADDRINUSE: address already in use :::5000
```

**What's happening:**
This is **NORMAL** nodemon behavior when:
1. You save a file while the server is running
2. Nodemon detects the change and tries to restart
3. The port is still occupied for a brief moment
4. Nodemon waits and retries automatically

**Is it actually broken?**
**NO!** Test with:
```bash
curl http://localhost:5000/health
```

If you get a response, **the server is working fine!**

**Solution:**
- **Do nothing** - nodemon will retry automatically
- Or save the file again to trigger a clean restart
- Or manually restart: Press `Ctrl+C` then `npm run dev`

---

### ❌ Error: Missing MONGODB_URI environment variable

**What you see:**
```
Error: Missing MONGODB_URI environment variable
```

**Cause:**
Environment variables not loaded before database connection.

**Solution:**
✅ Already fixed in `backend/src/index.ts` - dotenv loads first

**If you still see this:**
1. Check `backend/.env` exists
2. Check it has `MONGODB_URI=...`
3. Restart the server

---

### ❌ Error: EADDRINUSE - Port 5000 already in use

**What you see:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Cause:**
Another process is using port 5000.

**Solution:**

**Option 1: Kill the process**
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it (replace XXXX with the PID)
taskkill //PID XXXX //F
```

**Option 2: Use a different port**

Edit `backend/.env`:
```env
PORT=5001
```

Then restart the server.

---

### ❌ MongoDB Connection Failed

**What you see:**
```
❌ MongoDB connection error: MongoServerError...
```

**Causes & Solutions:**

**1. Wrong connection string**
- Check `backend/.env` - MONGODB_URI is correct
- Make sure password is URL-encoded (e.g., `@` = `%40`, `!` = `%21`)

**2. IP not whitelisted (MongoDB Atlas)**
- Go to MongoDB Atlas → Network Access
- Add your IP or use `0.0.0.0/0` (allow all)

**3. Network issues**
- Check internet connection
- Try pinging MongoDB: `ping cluster00.sgiwttw.mongodb.net`

---

### ⚠️ Nodemon keeps restarting

**What's happening:**
Nodemon watches for file changes and restarts automatically.

**If it's restarting too much:**

Check `backend/nodemon.json`:
```json
{
  "watch": ["src"],
  "ignore": ["src/**/*.test.ts", "node_modules"],
  "ext": "ts,js,json"
}
```

Make sure you're not editing files in `src/` constantly.

---

### ❌ Module not found errors

**What you see:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
npm install
```

---

### ❌ TypeScript errors

**What you see:**
```
TS2307: Cannot find module '@/models/User'
```

**Solutions:**

**1. Check tsconfig.json path mapping:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**2. Use relative imports instead:**
```typescript
// Instead of:
import { User } from "@/models/User"

// Use:
import { User } from "../models/User"
```

---

## 🔍 Debugging Tips

### Check if server is actually running

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{"status":"OK","message":"E-commerce Backend API is running"}
```

### Check what's using port 5000

```bash
netstat -ano | findstr :5000
```

### View server logs

If running in background, the logs are in your terminal.

If running with `npm run dev`, you'll see live logs.

### Test specific endpoint

```bash
# Test products
curl http://localhost:5000/api/products

# Test with auth
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 How to Know Everything is Working

### ✅ Success Indicators:

When you run `npm run dev`, you should see:

```
[nodemon] starting `ts-node src/index.ts`
🚀 Express server running on http://localhost:5000
📡 API endpoints available at http://localhost:5000/api
🏥 Health check: http://localhost:5000/health
✅ MongoDB connected: nextuth
✅ MongoDB connected successfully
```

### ✅ Quick Test Checklist:

```bash
# 1. Health check
curl http://localhost:5000/health
# Should return: {"status":"OK",...}

# 2. Products endpoint
curl http://localhost:5000/api/products
# Should return: [] or array of products

# 3. Root endpoint
curl http://localhost:5000/
# Should return: {"message":"E-commerce Backend API",...}
```

If all three work, **your backend is 100% operational!**

---

## 🚨 When to Actually Worry

**Normal (Don't worry):**
- ✅ Nodemon says "app crashed" after file change (it retries)
- ✅ Brief EADDRINUSE after saving file (nodemon restarting)
- ✅ Yellow warnings in npm install
- ✅ MongoDB deprecation warnings

**Problems (Need fixing):**
- ❌ Server won't start at all
- ❌ `curl http://localhost:5000/health` returns error
- ❌ MongoDB connection fails repeatedly
- ❌ API returns 500 errors
- ❌ Missing dependencies errors

---

## 📞 Getting Help

**Before asking for help, provide:**
1. Full error message
2. Output of `curl http://localhost:5000/health`
3. Contents of `backend/.env` (hide sensitive data)
4. Node version: `node --version`
5. What you were doing when error occurred

**Logs location:**
- Server logs: In your terminal where you ran `npm run dev`
- Nodemon logs: Same terminal
- MongoDB errors: Will show in server logs

---

## 🔄 Clean Restart

If things are really broken, do a clean restart:

```bash
# 1. Stop all servers
# Press Ctrl+C in terminal

# 2. Kill any lingering processes
netstat -ano | findstr :5000
taskkill //PID XXXX //F

# 3. Clear and reinstall
cd backend
rm -rf node_modules
npm install

# 4. Start fresh
npm run dev
```

---

**Remember:** If `curl http://localhost:5000/health` works, your server is fine! 🎉
