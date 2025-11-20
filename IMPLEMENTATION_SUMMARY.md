# Polymarket Dashboard – Full Implementation Summary

This project now includes a complete backend + frontend solution for fetching, categorizing, storing, and displaying Polymarket markets with sentiment analysis, expiry tracking, and win rate statistics.

---

## **What Was Built**

### **Backend (Node.js + Express + MongoDB)**

#### **Database Models**
- **Market Model** (`src/models/market.model.js`)
  - Fields: `marketId`, `title`, `outcomes`, `prices`, `volume`, `liquidity`, `resolution`, `expiry`, `status`, `category`, `sentimentScore`, `bullishPct`, `bearishPct`, `resolvedOutcome`, `resolvedAt`, `removedAt`, `raw`
  - Status transitions: `open` → `closed` (expired) → `resolved` (with outcome)
  - Expiry logic: Markets removed from main list after 48 hours post-resolution/closure

- **Stats Model** (`src/models/stats.model.js`)
  - Stores resolved market history: `marketId`, `title`, `finalOutcome`, `sentimentAtTheTime`, `category`, `resolvedAt`
  - Persists forever (not removed after 48 hours)

- **WinRate Model** (`src/models/winrate.model.js`)
  - Counters: `bullishWins`, `bearishWins`, `total`
  - Computed virtuals: `bullishWinRate`, `bearishWinRate`, `totalWinRate`

#### **Services**
- **marketStore.service.js** – Core service that:
  - Fetches markets from Polymarket Gamma API
  - Categorizes markets using keyword matching
  - Fetches sentiment from Reddit (with fallback)
  - Upserts markets into MongoDB
  - Updates market status (open → closed → resolved)
  - Removes expired markets after 48 hours
  - Creates Stats records and updates WinRate on resolution

- **categorize.js** – Keyword-based helper that classifies markets into:
  - Crypto, Politics, Tech, AI, Sports, Entertainment, Finance, Other

#### **Cron Job** (`src/cron.js`)
- Runs every 10 minutes
- Syncs markets from Polymarket API
- Updates market statuses
- Removes expired markets
- Updates stats and win rates

#### **API Endpoints**
- `GET /markets` – List active markets (filters out removed)
- `GET /markets/category/:category` – List active markets by category
- `POST /sentiment` – Fetch sentiment for a market (body: `{ marketId, query }`)
- `GET /api/stats` – Get resolved market stats + win rates
- `GET /api/markets` – Legacy endpoint (full sentiment, limited to first N markets)

#### **Environment Variables** (`.env`)
- `MONGO_URI` – MongoDB connection string (e.g., `mongodb://localhost:27017/polymarket`)
- `POLYMARKET_API_URL` – Polymarket Gamma API endpoint
- `PORT`, `USE_MOCK_MARKETS`, `CACHE_TTL`, `ALLOWED_ORIGINS`, etc.

---

### **Frontend (React + Next.js + TailwindCSS)**

#### **Components**
- **MarketCard.tsx** – Displays individual market with:
  - Title, Category, Status badge (green=open, yellow=closed, blue=resolved)
  - Leading outcome (or final outcome if resolved)
  - Yes/No prices
  - Volume + Liquidity
  - Expiry timer
  - Sentiment indicator (green=bullish, red=bearish, grey=no sentiment)

- **SentimentIndicator.tsx** – Color-coded sentiment display

- **CategoryTabs.tsx** – Filter markets by category (All, Crypto, Politics, Tech, AI, Sports, Entertainment, Finance, Other)

- **MarketList.tsx** – Fetches and displays markets with category filtering

- **StatsPage.tsx** – Displays:
  - Win rate summary (bullish, bearish, total)
  - Resolved market history with final outcomes and sentiment at time of resolution

#### **Pages**
- `app/page.tsx` – Home page with MarketList
- `app/stats/page.tsx` – Stats page

---

## **How to Run**

### **Backend Setup**

1. **Install dependencies:**
   ```powershell
   cd backEnd
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` → `.env`
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `POLYMARKET_API_URL` to Polymarket Gamma API endpoint

3. **Start MongoDB** (if running locally):
   ```powershell
   mongod
   ```

4. **Run the backend:**
   ```powershell
   npm start
   ```

   The backend will:
   - Connect to MongoDB
   - Start a cron job that syncs markets every 10 minutes
   - Serve API endpoints on `http://localhost:3000`

### **Frontend Setup**

1. **Install dependencies:**
   ```powershell
   cd frontEnd/polymarket-frontEnd
   npm install
   ```

2. **Configure environment:**
   - Create `.env.local` and set:
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
     ```

3. **Run the frontend:**
   ```powershell
   npm run dev
   ```

   The frontend will be available at `http://localhost:3001` (or the port Next.js chooses).

---

## **Key Features**

### **Market Categorization**
- Keyword-based classification into 8 categories
- Uses word boundaries to avoid false matches (e.g., "ai" in "rain")

### **Sentiment System**
- Fetches Reddit posts for each market title
- Computes bullish/bearish percentages
- Fallback: "No sentiment available" if Reddit fails
- Color indicators:
  - Green = Bullish
  - Red = Bearish
  - Grey = No sentiment

### **Market Status Logic**
- **Open** – Market is active and not expired
- **Closed** – Market expired but outcome not yet resolved
- **Resolved** – Market expired and outcome known
- Final outcome shown on card when resolved

### **Expiry Removal**
- Resolved/closed markets remain visible for 48 hours
- After 48 hours, automatically removed from main list
- Final results moved to stats page permanently

### **Stats Page**
- **Resolved Markets**: Shows all resolved markets with:
  - Title, final outcome, category, resolution date
  - Sentiment at the time the market was live
- **Win Rates**: Tracks:
  - Bullish win rate (% times bullish sentiment was correct)
  - Bearish win rate (% times bearish sentiment was correct)
  - Total win rate (overall accuracy)

### **Cron Job**
- Every 10 minutes:
  - Fetches new markets from Polymarket
  - Updates market statuses
  - Removes expired markets after 48 hours
  - Updates stats and win rates

---

## **Testing**

Run tests:
```powershell
cd backEnd
npm test
```

Tests include:
- `categorize.test.js` – Validates keyword-based categorization
- `odds.service.test.js` – Tests odds calculation
- `sentiment.service.test.js` – Tests sentiment analysis

---

## **Project Structure**

```
backEnd/
  src/
    models/
      market.model.js       # Market schema
      stats.model.js        # Stats schema
      winrate.model.js      # WinRate schema
    services/
      marketStore.service.js  # Core market sync logic
      polymarket.service.js   # Polymarket API fetcher
      reddit.service.js       # Reddit sentiment fetcher
    utils/
      categorize.js           # Keyword-based categorization
    controllers/
      marketDb.controller.js  # DB-backed endpoints
    routes/
      market.routes.js        # Market routes
      stats.routes.js         # Stats routes
    config/
      db.js                   # MongoDB connection
      env.js                  # Environment config
    cron.js                   # Cron job scheduler
    app.js                    # Express app
  index.js                    # Entry point
  __tests__/
    categorize.test.js        # Categorize tests

frontEnd/polymarket-frontEnd/
  components/
    MarketCard.tsx            # Market card component
    SentimentIndicator.tsx    # Sentiment color indicator
    CategoryTabs.tsx          # Category filter tabs
    MarketList.tsx            # Market list with filtering
    StatsPage.tsx             # Stats page component
  app/
    page.tsx                  # Home page
    stats/page.tsx            # Stats page route
```

---

## **Next Steps**

1. **Run MongoDB** locally or use MongoDB Atlas
2. **Start the backend** (`npm start` in `backEnd/`)
3. **Start the frontend** (`npm run dev` in `frontEnd/polymarket-frontEnd/`)
4. **Test the flow**:
   - Visit `http://localhost:3001` to see markets
   - Filter by category using tabs
   - Wait for cron to sync markets (or trigger manually)
   - Check `/stats` page for resolved market history and win rates

---

## **Environment Variables Cheat Sheet**

### Backend (`.env`)
```
POLYMARKET_API_URL=https://gamma-api.polymarket.com/markets?limit=200&active=true
MONGO_URI=mongodb://localhost:27017/polymarket
PORT=3000
USE_MOCK_MARKETS=false
CACHE_TTL=60
ALLOWED_ORIGINS=*
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## **Deployment Notes**

- **Backend**: Deploy to any Node.js host (Heroku, Railway, Render, etc.) with MongoDB connection
- **Frontend**: Deploy to Vercel, Netlify, or any Next.js host
- **Environment**: Ensure `MONGO_URI` and `POLYMARKET_API_URL` are set in production
- **CORS**: Lock down `ALLOWED_ORIGINS` in production to your frontend domain

---

## **Troubleshooting**

- **Markets not showing**: Check MongoDB connection and ensure `MONGO_URI` is correct
- **Sentiment not loading**: Reddit API may be rate-limited; fallback will show "No sentiment available"
- **Cron not running**: Ensure backend is running and check console logs for errors
- **Categories wrong**: Update keywords in `src/utils/categorize.js` and re-sync markets

---

## **Credits**

- **Polymarket Gamma API** for market data
- **Reddit public JSON API** for sentiment analysis
- **MongoDB** for data persistence
- **Next.js + TailwindCSS** for frontend

---

**Project Status**: ✅ Complete and ready to run!
