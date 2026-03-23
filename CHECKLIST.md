# ✅ FIX CHECKLIST

Run through this step-by-step to get login & restaurants working:

## STEP 1: Start Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

- [ ] See "Uvicorn running on http://127.0.0.1:8000"?
- [ ] No errors in terminal?

---

## STEP 2: Verify .env File
```bash
cat frontend/.env
```

- [ ] Should show: `VITE_API_URL=http://localhost:8000`
- [ ] If not found, create it: `echo "VITE_API_URL=http://localhost:8000" > frontend/.env`

---

## STEP 3: Start Frontend Server (NEW TERMINAL)
```bash
cd frontend
npm install
npm run dev
```

- [ ] See "Local: http://localhost:XXXX"?
- [ ] Note what port shows (3000 or 5173)?
- [ ] Close browser tabs that were showing errors

---

## STEP 4: Check if Port is 5173

**If frontend shows port 5173:**

1. Edit `backend/main.py`
2. Find the `CORSMiddleware` section (around line 24)
3. Add `"http://localhost:5173"` to `allow_origins` list
4. Save file
5. Stop backend (Ctrl+C in backend terminal)
6. Restart backend: `uvicorn main:app --reload --port 8000`

- [ ] Edited CORS?
- [ ] Restarted backend?

---

## STEP 5: Open App & Test Login

1. Open browser: `http://localhost:5173` (or :3000)
2. Click "Login"
3. Enter:
   - Email: `prakhar@demo.com`
   - Password: `password123`
4. Click "Login" button

- [ ] Login successful?
- [ ] See restaurants list?
- [ ] Can click on a restaurant?

---

## STEP 6: Verify Features Work

Try these:
- [ ] Click "Explore" - see restaurant list?
- [ ] Click restaurant - see details?
- [ ] Write a review?
- [ ] Add to favorites?
- [ ] Chat with AI?
- [ ] View profile?

---

## ⚠️ IF SOMETHING FAILS

**In Browser - Open DevTools (Press F12)**
1. Click "Console" tab
2. Try login again
3. Look for red errors
4. Take screenshot

**In Terminal - Run Quick Test:**
```bash
# Should return a valid response:
curl http://localhost:8000/restaurants
```

**Share with me:**
- Screenshot of browser console error (if any)
- Output of curl command above
- Exact port frontend is running on (3000 or 5173)

---

## ✨ YOU'RE DONE IF
- ✅ Login page appears
- ✅ Can login with prakhar@demo.com
- ✅ See list of restaurants
- ✅ Can click restaurant and see details

**Expected time:** 5-10 minutes ⏱️
