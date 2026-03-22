import React, { useState, useEffect, useReducer } from "react";

const START_DATE = new Date("2026-04-01T00:00:00+05:30");
const HALVING_DATE = new Date("2028-04-17T00:00:00Z");
const PHASE2_START = new Date("2027-04-01T00:00:00+05:30");
const HOLD_START = new Date("2028-04-17T00:00:00Z");
const EXIT_START = new Date("2029-03-01T00:00:00Z");
const TAX_RATE = 0.312;
const TDS_RATE = 0.01;

const C = {
  bg: "#080b12", card: "#0f1420", card2: "#161d2e", border: "#1c2540", borderLight: "#253255",
  green: "#0efa82", greenDim: "#0efa8233", red: "#ff3b5c", redDim: "#ff3b5c22",
  blue: "#3b82f6", blueDim: "#3b82f622", purple: "#a855f7", purpleDim: "#a855f722",
  orange: "#f59e0b", orangeDim: "#f59e0b22", gold: "#fbbf24", goldDim: "#fbbf2422",
  white: "#f1f5f9", muted: "#64748b", mutedLight: "#94a3b8",
  btc: "#f7931a", btcDim: "#f7931a22", sol: "#9945ff", solDim: "#9945ff22"
};

const INITIAL_STATE = {
  holdings: { BTC: { qty: 0.01002, avgCost: 66000 }, SOL: { qty: 2.40249, avgCost: 87 } },
  transactions: [], dipDeployments: [], weeklyLog: [], settings: {
    monthlyBudget: 40000, btcSolSplit: 65, dcaDipSplit: 85, dipReservePool: 0, dipReserveMax: 100000, usdInr: 93.7,
    exitTranches: [{ mult: 2, pct: 20 }, { mult: 3, pct: 20 }, { mult: 5, pct: 20 }, { mult: 8, pct: 20 }, { mult: 0, pct: 20 }],
    dipZones: {
      BTC: [{ dropPct: 15, deployPct: 30 }, { dropPct: 25, deployPct: 50 }, { dropPct: 35, deployPct: 100 }],
      SOL: [{ dropPct: 17, deployPct: 30 }, { dropPct: 33, deployPct: 50 }, { dropPct: 50, deployPct: 100 }]
    }
  },
  prices: { BTC: null, SOL: null }, lastFetch: null, priceError: null
};

function reducer(st, a) {
  switch (a.type) {
    case "SET_PRICES": return { ...st, prices: { BTC: a.payload.BTC, SOL: a.payload.SOL }, settings: { ...st.settings, usdInr: a.payload.usdInr || st.settings.usdInr }, lastFetch: Date.now(), priceError: null };
    case "PRICE_ERROR": return { ...st, priceError: a.payload };
    case "ADD_TX": {
      const tx = a.payload, h = { ...st.holdings }, c = { ...h[tx.coin] };
      if (tx.type === "buy") { const tc = c.qty * c.avgCost + tx.qty * tx.price; c.qty += tx.qty; c.avgCost = c.qty > 0 ? tc / c.qty : 0; }
      else c.qty = Math.max(0, c.qty - tx.qty);
      h[tx.coin] = c;
      return { ...st, holdings: h, transactions: [...st.transactions, { ...tx, id: Date.now(), date: tx.date || new Date().toISOString() }] };
    }
    case "DELETE_TX": {
      const tx = st.transactions.find(t => t.id === a.payload);
      if (!tx) return st;
      const h = { ...st.holdings }, c = { ...h[tx.coin] };
      if (tx.type === "buy") {
        const remQty = c.qty - tx.qty;
        if (remQty > 0.000001) {
          const remCost = c.qty * c.avgCost - tx.qty * tx.price;
          c.avgCost = remCost / remQty;
        } else { c.avgCost = 0; }
        c.qty = Math.max(0, remQty);
      } else {
        c.qty += tx.qty;
      }
      h[tx.coin] = c;
      return { ...st, holdings: h, transactions: st.transactions.filter(t => t.id !== a.payload) };
    }
    case "DELETE_WEEK": {
      const wk = (st.weeklyLog || []).find(w => w.id === a.payload);
      if (!wk) return st;
      let txs = st.transactions;
      const wkDate = wk.date?.split("T")[0];
      const btcTx = txs.find(t => t.coin === "BTC" && t.date?.split("T")[0] === wkDate && Math.abs(t.qty - wk.btcQty) < 0.0001);
      const solTx = txs.find(t => t.coin === "SOL" && t.date?.split("T")[0] === wkDate && Math.abs(t.qty - wk.solQty) < 0.001);
      if (btcTx) txs = txs.filter(t => t.id !== btcTx.id);
      if (solTx) txs = txs.filter(t => t.id !== solTx.id);
      const h = { ...st.holdings };
      if (btcTx) { const bc = { ...h.BTC }; const rq = bc.qty - wk.btcQty; bc.qty = Math.max(0, rq); if (rq > 0.000001) { bc.avgCost = (bc.qty * bc.avgCost) / rq; } h.BTC = bc; }
      if (solTx) { const sc = { ...h.SOL }; const rq = sc.qty - wk.solQty; sc.qty = Math.max(0, rq); if (rq > 0.000001) { sc.avgCost = (sc.qty * sc.avgCost) / rq; } h.SOL = sc; }
      const newPool = Math.max(0, st.settings.dipReservePool - wk.dipINR);
      return { ...st, holdings: h, transactions: txs, weeklyLog: (st.weeklyLog || []).filter(w => w.id !== a.payload), settings: { ...st.settings, dipReservePool: newPool } };
    }
    case "DELETE_DIP_DEPLOY": {
      const dep = (st.dipDeployments || []).find(d => d.id === a.payload);
      if (!dep) return st;
      const newPool = Math.min(st.settings.dipReserveMax, st.settings.dipReservePool + dep.amount);
      const depDate = dep.date?.split("T")[0];
      let txs = st.transactions;
      const tx = txs.find(t => t.coin === dep.coin && t.type === "buy" && t.date?.split("T")[0] === depDate);
      if (tx) {
        txs = txs.filter(t => t.id !== tx.id);
        const h = { ...st.holdings }, c = { ...h[dep.coin] };
        const rq = c.qty - tx.qty;
        c.qty = Math.max(0, rq);
        if (rq > 0.000001) { c.avgCost = ((c.qty + tx.qty) * c.avgCost - tx.qty * tx.price) / rq; }
        h[dep.coin] = c;
        return { ...st, holdings: h, transactions: txs, dipDeployments: (st.dipDeployments || []).filter(d => d.id !== a.payload), settings: { ...st.settings, dipReservePool: newPool } };
      }
      return { ...st, dipDeployments: (st.dipDeployments || []).filter(d => d.id !== a.payload), settings: { ...st.settings, dipReservePool: newPool } };
    }
    case "MARK_WEEK": {
      const existing = (st.weeklyLog || []).find(w => w.weekNum === a.payload.weekNum);
      if (existing) return st;
      return { ...st, weeklyLog: [...(st.weeklyLog || []), { ...a.payload, id: Date.now(), date: new Date().toISOString() }] };
    }
    case "UPDATE_SETTINGS": return { ...st, settings: { ...st.settings, ...a.payload } };
    case "ADD_TO_DIP_POOL": {
      const newPool = Math.min(st.settings.dipReservePool + a.payload, st.settings.dipReserveMax);
      return { ...st, settings: { ...st.settings, dipReservePool: Math.round(newPool) } };
    }
    case "DEPLOY_DIP": {
      const amt = Math.min(a.payload.amount, st.settings.dipReservePool);
      const newPool = Math.max(0, st.settings.dipReservePool - amt);
      return { ...st, settings: { ...st.settings, dipReservePool: Math.round(newPool) }, 
        dipDeployments: [...(st.dipDeployments || []), { date: new Date().toISOString(), amount: amt, coin: a.payload.coin, zone: a.payload.zone, id: Date.now() }] };
    }
    case "LOAD_STATE": return { ...a.payload };
    default: return st;
  }
}

async function fetchPricesViaAI() {
  try {
    const [cryptoRes, inrRes] = await Promise.all([
      fetch("<https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd>"),
      fetch("<https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr>")
    ]);
    const cryptoData = await cryptoRes.json();
    const inrData = await inrRes.json();
    const btcPrice = cryptoData?.bitcoin?.usd;
    const solPrice = cryptoData?.solana?.usd;
    const usdInr = inrData?.tether?.inr || 83.5;
    if (btcPrice > 1000 && solPrice > 1) {
      return { BTC: btcPrice, SOL: solPrice, usdInr };
    }
  } catch (e) { console.error(e); }
  return null;
}

const fmt = (n, d = 2) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = n => "$" + fmt(n);
const fmtINR = n => "₹" + fmt(n);
const fmtCoin = (n, d = 5) => Number(n).toFixed(d);

function getWeekInfo(settings) {
  const now = new Date();
  if (now < START_DATE) {
    const daysUntil = Math.ceil((START_DATE - now) / 864e5);
    return { started: false, daysUntil, weekNum: 0, totalWeeks: 104, phase: 1 };
  }
  const msElapsed = now - START_DATE;
  const weekNum = Math.floor(msElapsed / (7 * 864e5)) + 1;
  const phase = now >= PHASE2_START ? 2 : 1;
  const dcaPct = phase === 1 ? 85 : 55;
  const dipPct = phase === 1 ? 15 : 45;
  const weeklyBudget = settings.monthlyBudget / 4;
  const dcaWeekly = weeklyBudget * (dcaPct / 100);
  const dipWeekly = weeklyBudget * (dipPct / 100);
  const btcWeekly = dcaWeekly * (settings.btcSolSplit / 100);
  const solWeekly = dcaWeekly * ((100 - settings.btcSolSplit) / 100);
  return { started: true, weekNum, totalWeeks: 104, phase, dcaPct, dipPct, weeklyBudget, dcaWeekly, dipWeekly, btcWeekly, solWeekly };
}

const TABS = ["Dashboard", "Log Trade", "DCA & Dip", "Exit Plan", "Tax", "Settings"];

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
    background: active ? `linear-gradient(135deg, ${C.green}, #06c167)` : "transparent",
    color: active ? C.bg : C.muted, borderRadius: 8, transition: "all .2s", whiteSpace: "nowrap",
    letterSpacing: active ? 0.5 : 0
  }}>{label}</button>
);

const Card = ({ title, children, accent, glow }) => (
  <div style={{
    background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${accent || C.border}`,
    boxShadow: glow ? `0 0 20px ${glow}` : "none"
  }}>
    {title && <div style={{ fontSize: 10, color: C.mutedLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{title}</div>}
    {children}
  </div>
);

const Stat = ({ label, value, sub, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 17, fontWeight: 800, color: color || C.white }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const ProgressBar = ({ pct, color, h }) => (
  <div style={{ height: h || 8, background: C.card2, borderRadius: 4, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 4, transition: "width .6s ease" }} />
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ fontSize: 11, color: C.mutedLight, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
    <input {...props} style={{ width: "100%", padding: "10px 12px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 14, boxSizing: "border-box", outline: "none", ...(props.style || {}) }} />
  </div>
);

const Btn = ({ children, primary, danger, small, ...props }) => (
  <button {...props} style={{
    padding: small ? "6px 12px" : "10px 18px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700,
    fontSize: small ? 11 : 13, transition: "all .2s",
    background: danger ? C.red : primary ? `linear-gradient(135deg, ${C.green}, #06c167)` : C.card2,
    color: danger ? "#fff" : primary ? C.bg : C.mutedLight, ...(props.style || {})
  }}>{children}</button>
);

function DeleteBtn({ onDelete, label }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button onClick={() => { onDelete(); setConfirming(false); }} style={{
          padding: "3px 8px", fontSize: 10, fontWeight: 700, borderRadius: 5, border: "none",
          background: C.red, color: "#fff", cursor: "pointer"
        }}>Yes</button>
        <button onClick={() => setConfirming(false)} style={{
          padding: "3px 8px", fontSize: 10, fontWeight: 700, borderRadius: 5, border: "none",
          background: C.card2, color: C.muted, cursor: "pointer"
        }}>No</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} style={{
      width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.red}33`, background: C.redDim,
      color: C.red, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0
    }}>✕</button>
  );
}

function MiniCountdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  const diff = HALVING_DATE - now;
  if (diff <= 0) return <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>HALVED</span>;
  const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), m = Math.floor((diff % 36e5) / 6e4), s = Math.floor((diff % 6e4) / 1e3);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 9, color: C.gold, fontWeight: 600 }}>⏳</span>
      {[{ v: d, l: "d" }, { v: h, l: "h" }, { v: m, l: "m" }, { v: s, l: "s" }].map(({ v, l }) => (
        <span key={l} style={{ fontSize: 11, fontWeight: 800, color: C.gold, fontFamily: "monospace" }}>{String(v).padStart(2, "0")}<span style={{ fontSize: 8, color: C.muted, fontWeight: 500 }}>{l}</span></span>
      ))}
    </div>
  );
}

function HalvingCountdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  const diff = HALVING_DATE - now;
  if (diff <= 0) return <span style={{ color: C.green, fontWeight: 700 }}>HALVING COMPLETE</span>;
  const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), m = Math.floor((diff % 36e5) / 6e4), s = Math.floor((diff % 6e4) / 1e3);
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
      {[{ v: d, l: "DAYS" }, { v: h, l: "HRS" }, { v: m, l: "MIN" }, { v: s, l: "SEC" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center", background: C.card2, borderRadius: 10, padding: "10px 14px", minWidth: 50 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.gold, fontFamily: "monospace" }}>{String(v).padStart(2, "0")}</div>
          <div style={{ fontSize: 8, color: C.muted, letterSpacing: 2, marginTop: 2 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function WeeklyBuyCard({ settings, prices }) {
  const w = getWeekInfo(settings);
  const inr = settings.usdInr;
  const btcP = prices.BTC || 0, solP = prices.SOL || 0;

  if (!w.started) {
    return (
      <Card title="Weekly Buy Plan" accent={C.greenDim} glow={C.greenDim}>
        <div style={{ textAlign: "center", padding: 10 }}>
          <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 4 }}>Starts April 1, 2026</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.green }}>{w.daysUntil} days to go</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Get your ₹40K/month ready!</div>
        </div>
      </Card>
    );
  }

  const hasPrices = prices.BTC && prices.SOL;
  const btcQty = (hasPrices && btcP > 0) ? (w.btcWeekly / inr) / btcP : 0;
  const solQty = (hasPrices && solP > 0) ? (w.solWeekly / inr) / solP : 0;

  return (
    <Card title={`Week ${w.weekNum} of 104 — Phase ${w.phase}`} accent={C.green + "44"} glow={C.greenDim}>
      <ProgressBar pct={(w.weekNum / 104) * 100} color={C.green} h={6} />
      <div style={{ fontSize: 10, color: C.muted, textAlign: "right", marginTop: 4, marginBottom: 12 }}>{(104 - w.weekNum)} weeks remaining</div>

      <div style={{ fontSize: 11, color: C.mutedLight, marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>THIS WEEK'S BUY</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: C.btcDim, borderRadius: 10, padding: 12, border: `1px solid ${C.btc}33` }}>
          <div style={{ fontSize: 10, color: C.btc, fontWeight: 600, marginBottom: 4 }}>₿ BUY BTC</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.white }}>{fmtINR(w.btcWeekly)}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>≈ {fmtCoin(btcQty, 6)} BTC</div>
          <div style={{ fontSize: 10, color: C.muted }}>@ {fmtUSD(btcP)}</div>
        </div>
        <div style={{ background: C.solDim, borderRadius: 10, padding: 12, border: `1px solid ${C.sol}33` }}>
          <div style={{ fontSize: 10, color: C.sol, fontWeight: 600, marginBottom: 4 }}>◎ BUY SOL</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.white }}>{fmtINR(w.solWeekly)}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>≈ {fmtCoin(solQty, 3)} SOL</div>
          <div style={{ fontSize: 10, color: C.muted }}>@ {fmtUSD(solP)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: C.greenDim, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.green, fontWeight: 600 }}>DCA ({w.dcaPct}%)</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{fmtINR(w.dcaWeekly)}</div>
        </div>
        <div style={{ flex: 1, background: C.blueDim, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>DIP RESERVE ({w.dipPct}%)</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{fmtINR(w.dipWeekly)}</div>
        </div>
      </div>
    </Card>
  );
}

function WeeklyTracker({ state, dispatch }) {
  const w = getWeekInfo(state.settings);
  const log = state.weeklyLog || [];
  const settings = state.settings;
  const inr = settings.usdInr;
  const prices = state.prices;
  const hasPrices = prices.BTC && prices.SOL;
  const btcP = prices.BTC || 0, solP = prices.SOL || 0;

  if (!w.started) {
    const daysLeft = Math.ceil((START_DATE - new Date()) / 864e5);
    return (
      <Card title={`Weekly Tracker — 0 / 104`} accent={C.gold + "44"} glow={C.goldDim}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.white }}>0<span style={{ fontSize: 14, color: C.muted }}> / 104 weeks</span></div>
          <ProgressBar pct={0} color={C.green} h={10} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 9, color: C.muted }}>Apr 1, 2026</span>
            <span style={{ fontSize: 9, color: C.muted }}>Apr 2028</span>
          </div>
        </div>
        <div style={{ background: C.gold + "11", borderRadius: 10, padding: 16, border: `1px solid ${C.gold}33`, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.gold, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>ACCUMULATION STARTS IN</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.gold }}>{daysLeft} days</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>April 1, 2026 · Week 1 begins</div>
        </div>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.btc, fontWeight: 600 }}>BTC/WEEK</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{fmtINR(Math.round((settings.monthlyBudget / 4) * (settings.dcaDipSplit / 100) * (settings.btcSolSplit / 100)))}</div>
          </div>
          <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.sol, fontWeight: 600 }}>SOL/WEEK</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{fmtINR(Math.round((settings.monthlyBudget / 4) * (settings.dcaDipSplit / 100) * ((100 - settings.btcSolSplit) / 100)))}</div>
          </div>
          <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>DIP/WEEK</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{fmtINR(Math.round((settings.monthlyBudget / 4) * ((100 - settings.dcaDipSplit) / 100)))}</div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: C.muted, textAlign: "center" }}>
          Phase 1: {settings.dcaDipSplit}% DCA · {100 - settings.dcaDipSplit}% Dip Reserve · ₹{fmt(settings.monthlyBudget, 0)}/month
        </div>
      </Card>
    );
  }

  const currentWeekDone = log.find(l => l.weekNum === w.weekNum);
  const totalContributed = log.reduce((s, l) => s + l.totalINR, 0);
  const totalDCADone = log.reduce((s, l) => s + l.dcaINR, 0);
  const totalDipAdded = log.reduce((s, l) => s + l.dipINR, 0);

  const markWeek = () => {
    const dcaINR = Math.round(w.dcaWeekly);
    const dipINR = Math.round(w.dipWeekly);
    const btcBuyINR = Math.round(w.btcWeekly);
    const solBuyINR = Math.round(w.solWeekly);
    const btcQty = (btcBuyINR / inr) / btcP;
    const solQty = (solBuyINR / inr) / solP;

    dispatch({ type: "MARK_WEEK", payload: { weekNum: w.weekNum, phase: w.phase, totalINR: dcaINR + dipINR, dcaINR, dipINR, btcBuyINR, solBuyINR, btcQty, solQty, btcPrice: btcP, solPrice: solP } });
    dispatch({ type: "ADD_TX", payload: { coin: "BTC", type: "buy", qty: btcQty, price: btcP, date: new Date().toISOString() } });
    dispatch({ type: "ADD_TX", payload: { coin: "SOL", type: "buy", qty: solQty, price: solP, date: new Date().toISOString() } });
    dispatch({ type: "ADD_TO_DIP_POOL", payload: dipINR });
  };

  const recentWeeks = [...log].reverse().slice(0, 8);

  return (
    <Card title={`Weekly Tracker — Week ${w.weekNum} / 104`} accent={currentWeekDone ? C.green + "44" : C.gold + "44"} glow={currentWeekDone ? C.greenDim : C.goldDim}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.white }}>{w.weekNum}<span style={{ fontSize: 14, color: C.muted }}> / 104</span></div>
          <div style={{ fontSize: 10, color: C.muted }}>Phase {w.phase} · {104 - w.weekNum} weeks left</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: C.muted }}>Total Contributed</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{fmtINR(totalContributed)}</div>
        </div>
      </div>

      <ProgressBar pct={(w.weekNum / 104) * 100} color={C.green} h={10} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 14 }}>
        <span style={{ fontSize: 9, color: C.muted }}>Apr 2026</span>
        <span style={{ fontSize: 9, color: C.green, fontWeight: 600 }}>{((w.weekNum / 104) * 100).toFixed(1)}%</span>
        <span style={{ fontSize: 9, color: C.muted }}>Apr 2028</span>
      </div>

      {!currentWeekDone ? (
        <div style={{ background: C.gold + "11", borderRadius: 10, padding: 14, border: `1px solid ${C.gold}33`, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.gold, boxShadow: `0 0 8px ${C.gold}` }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>Week {w.weekNum} — Pending</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.btc, fontWeight: 600 }}>BTC BUY</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{fmtINR(w.btcWeekly)}</div>
              <div style={{ fontSize: 9, color: C.muted }}>≈{fmtCoin((w.btcWeekly / inr) / btcP, 6)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.sol, fontWeight: 600 }}>SOL BUY</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{fmtINR(w.solWeekly)}</div>
              <div style={{ fontSize: 9, color: C.muted }}>≈{fmtCoin((w.solWeekly / inr) / solP, 3)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>DIP POOL</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{fmtINR(w.dipWeekly)}</div>
              <div style={{ fontSize: 9, color: C.muted }}>reserve</div>
            </div>
          </div>
          <button onClick={markWeek} style={{
            width: "100%", padding: "12px", fontSize: 14, fontWeight: 800, borderRadius: 10, cursor: "pointer",
            border: "none", background: `linear-gradient(135deg, ${C.green}, #06c167)`, color: C.bg,
            letterSpacing: 0.5
          }}>
            ✓ Mark Week {w.weekNum} as Done ({fmtINR(Math.round(w.weeklyBudget))})
          </button>
        </div>
      ) : (
        <div style={{ background: C.greenDim, borderRadius: 10, padding: 14, border: `1px solid ${C.green}33`, marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.green }}>✓ Week {w.weekNum} Done!</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            BTC: {fmtINR(currentWeekDone.btcBuyINR)} · SOL: {fmtINR(currentWeekDone.solBuyINR)} · Dip: {fmtINR(currentWeekDone.dipINR)}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.green, fontWeight: 600 }}>TOTAL DCA</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>{fmtINR(totalDCADone)}</div>
        </div>
        <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>TOTAL DIP ADDED</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>{fmtINR(totalDipAdded)}</div>
        </div>
        <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>WEEKS DONE</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>{log.length} / 104</div>
        </div>
      </div>

      {recentWeeks.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: C.mutedLight, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>RECENT WEEKS</div>
          {recentWeeks.map(l => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: C.green }}>✓</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>Week {l.weekNum}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>{l.date?.split("T")[0]} · Phase {l.phase}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{fmtINR(l.totalINR)}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>BTC {fmtINR(l.btcBuyINR)} · SOL {fmtINR(l.solBuyINR)}</div>
                </div>
                <DeleteBtn onDelete={() => dispatch({ type: "DELETE_WEEK", payload: l.id })} />
              </div>
            </div>
          ))}
        </>
      )}
    </Card>
  );
}

function MarketAdvisor({ prices, holdings, settings }) {
  const hasPrices = prices.BTC && prices.SOL;
  if (!hasPrices) return (
    <Card accent={C.gold + "44"}>
      <div style={{ textAlign: "center", padding: 8, fontSize: 12, color: C.gold }}>⏳ Waiting for live prices to generate signals...</div>
    </Card>
  );

  const btcP = prices.BTC, solP = prices.SOL;
  const btcATH = 126210, solATH = 293;
  const btcDropATH = ((btcATH - btcP) / btcATH) * 100;
  const solDropATH = ((solATH - solP) / solATH) * 100;
  const btcAvg = holdings.BTC.avgCost, solAvg = holdings.SOL.avgCost;
  const btcVsAvg = ((btcP - btcAvg) / btcAvg) * 100;
  const solVsAvg = ((solP - solAvg) / solAvg) * 100;
  const pool = settings.dipReservePool;
  const totalCost = holdings.BTC.qty * btcAvg + holdings.SOL.qty * solAvg;
  const totalVal = holdings.BTC.qty * btcP + holdings.SOL.qty * solP;
  const portfolioMult = totalCost > 0 ? totalVal / totalCost : 1;

  const signals = [];
  let btcScore = 0, solScore = 0;

  if (btcDropATH >= 55) { btcScore += 3; signals.push({ coin: "BTC", type: "CRASH ZONE", msg: `${btcDropATH.toFixed(0)}% below ATH — rare deep discount`, color: C.red, priority: 3 }); }
  else if (btcDropATH >= 45) { btcScore += 1; signals.push({ coin: "BTC", type: "DISCOUNTED", msg: `${btcDropATH.toFixed(0)}% below ATH — decent accumulation zone`, color: C.orange, priority: 1 }); }
  else if (btcDropATH >= 20) { btcScore += 0; signals.push({ coin: "BTC", type: "MID-CYCLE", msg: `${btcDropATH.toFixed(0)}% below ATH — normal consolidation`, color: C.gold, priority: 0 }); }
  else if (btcDropATH < 10) { btcScore -= 2; signals.push({ coin: "BTC", type: "NEAR ATH", msg: `Only ${btcDropATH.toFixed(0)}% from ATH — expensive`, color: C.purple, priority: -2 }); }

  if (btcVsAvg < -30) { btcScore += 3; signals.push({ coin: "BTC", type: "WAY BELOW YOUR AVG", msg: `${Math.abs(btcVsAvg).toFixed(0)}% cheaper than your avg — strong buy`, color: C.green, priority: 3 }); }
  else if (btcVsAvg < -10) { btcScore += 2; signals.push({ coin: "BTC", type: "BELOW YOUR AVG", msg: `${Math.abs(btcVsAvg).toFixed(0)}% below avg — lowers your cost basis`, color: C.green, priority: 2 }); }
  else if (btcVsAvg >= -10 && btcVsAvg <= 15) { btcScore += 0; }
  else if (btcVsAvg > 50) { btcScore -= 1; signals.push({ coin: "BTC", type: "WELL ABOVE AVG", msg: `${btcVsAvg.toFixed(0)}% above your avg — raises cost basis`, color: C.gold, priority: 0 }); }
  else if (btcVsAvg > 100) { btcScore -= 2; signals.push({ coin: "BTC", type: "2X+ PROFIT", msg: `${btcVsAvg.toFixed(0)}% profit — check exit triggers`, color: C.purple, priority: -1 }); }

  if (solDropATH >= 75) { solScore += 3; signals.push({ coin: "SOL", type: "CRASH ZONE", msg: `${solDropATH.toFixed(0)}% below ATH — extreme discount`, color: C.red, priority: 3 }); }
  else if (solDropATH >= 60) { solScore += 1; signals.push({ coin: "SOL", type: "DEEP DISCOUNT", msg: `${solDropATH.toFixed(0)}% below ATH — but normal for altcoins in consolidation`, color: C.orange, priority: 1 }); }
  else if (solDropATH >= 30) { solScore += 0; signals.push({ coin: "SOL", type: "MID-CYCLE", msg: `${solDropATH.toFixed(0)}% below ATH — standard altcoin range`, color: C.gold, priority: 0 }); }
  else if (solDropATH < 15) { solScore -= 2; signals.push({ coin: "SOL", type: "NEAR ATH", msg: `Only ${solDropATH.toFixed(0)}% from ATH — expensive`, color: C.purple, priority: -2 }); }

  if (solVsAvg < -30) { solScore += 3; signals.push({ coin: "SOL", type: "WAY BELOW YOUR AVG", msg: `${Math.abs(solVsAvg).toFixed(0)}% cheaper — strong buy`, color: C.green, priority: 3 }); }
  else if (solVsAvg < -10) { solScore += 2; signals.push({ coin: "SOL", type: "BELOW YOUR AVG", msg: `${Math.abs(solVsAvg).toFixed(0)}% below avg — good DCA`, color: C.green, priority: 2 }); }
  else if (solVsAvg >= -10 && solVsAvg <= 15) { solScore += 0; }
  else if (solVsAvg > 50) { solScore -= 1; signals.push({ coin: "SOL", type: "WELL ABOVE AVG", msg: `${solVsAvg.toFixed(0)}% above avg`, color: C.gold, priority: 0 }); }
  else if (solVsAvg > 100) { solScore -= 2; signals.push({ coin: "SOL", type: "2X+ PROFIT", msg: `${solVsAvg.toFixed(0)}% profit — check exit`, color: C.purple, priority: -1 }); }

  if (portfolioMult >= 2) { signals.push({ coin: "📊", type: "EXIT ZONE", msg: `Portfolio at ${portfolioMult.toFixed(1)}x — first exit tranche`, color: C.purple, priority: -1 }); }

  const totalScore = btcScore + solScore;
  if (pool >= 1000 && totalScore >= 5) {
    signals.push({ coin: "💰", type: "DEPLOY NOW", msg: `Deploy ${fmtINR(pool)} reserve — strong buy signals active`, color: C.blue, priority: 4 });
  } else if (pool >= 1000 && totalScore >= 3) {
    signals.push({ coin: "💰", type: "PARTIAL DEPLOY", msg: `Consider deploying part of ${fmtINR(pool)}`, color: C.blue, priority: 2 });
  } else if (pool < 1000 && totalScore >= 4) {
    signals.push({ coin: "💰", type: "BUILD POOL", msg: `Good dip but pool is low (${fmtINR(pool)}) — keep accumulating reserve`, color: C.gold, priority: 1 });
  }

  let overallAction, overallColor, overallEmoji, overallText, overallSub;

  if (portfolioMult >= 2 && (btcScore + solScore) <= -2) {
    overallAction = "REDUCE / HOLD";
    overallColor = C.purple;
    overallEmoji = "🟣";
    overallText = "Prices elevated — slow down buying";
    overallSub = "Portfolio at " + portfolioMult.toFixed(1) + "x. Shift to 100% dip reserve mode. Review exit plan.";
  } else if (totalScore >= 5) {
    overallAction = "DEPLOY DIP RESERVE";
    overallColor = C.red;
    overallEmoji = "🔴";
    overallText = "Major dip — deploy reserves!";
    overallSub = "Both coins showing heavy discounts. Deploy dip pool aggressively into the deeper dip.";
  } else if (totalScore >= 3) {
    overallAction = "DCA + CONSIDER DIP";
    overallColor = C.orange;
    overallEmoji = "🟠";
    overallText = "Below key levels — DCA and watch for deploy";
    overallSub = "Do weekly DCA. If dip pool has funds and prices drop further, deploy 25-50% into the weaker coin.";
  } else if (totalScore >= 0) {
    overallAction = "CONTINUE DCA";
    overallColor = C.green;
    overallEmoji = "🟢";
    overallText = "Good zone — stick to the weekly plan";
    overallSub = "Normal accumulation conditions. Follow your ₹10K/week schedule.";
  } else {
    overallAction = "REDUCE / HOLD";
    overallColor = C.purple;
    overallEmoji = "🟣";
    overallText = "Prices near highs — slow down";
    overallSub = "Save more into dip reserve. Wait for better entries.";
  }

  return (
    <Card accent={overallColor + "44"} glow={overallColor + "22"}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ fontSize: 28 }}>{overallEmoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: overallColor }}>{overallAction}</div>
          <div style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{overallText}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.mutedLight, marginBottom: 12, padding: "8px 10px", background: overallColor + "11", borderRadius: 8, lineHeight: 1.5 }}>
        💡 {overallSub}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.btcDim, borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.btc }}>₿ BTC</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{fmtUSD(btcP)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 9, color: C.muted }}>from ATH</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>-{btcDropATH.toFixed(1)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 9, color: C.muted }}>vs Avg (${fmt(btcAvg, 0)})</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: btcVsAvg >= 0 ? C.green : C.red }}>{btcVsAvg >= 0 ? "+" : ""}{btcVsAvg.toFixed(1)}%</span>
          </div>
          <div style={{ marginTop: 6, textAlign: "center", padding: "3px 0", borderRadius: 4, fontSize: 9, fontWeight: 700, background: btcScore >= 3 ? C.redDim : btcScore >= 1 ? C.greenDim : C.purpleDim, color: btcScore >= 3 ? C.red : btcScore >= 1 ? C.green : C.purple }}>
            Score: {btcScore > 0 ? "+" : ""}{btcScore} · {btcScore >= 3 ? "HEAVY BUY" : btcScore >= 1 ? "BUY" : btcScore >= 0 ? "NEUTRAL" : "CAUTION"}
          </div>
        </div>
        <div style={{ background: C.solDim, borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.sol }}>◎ SOL</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{fmtUSD(solP)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 9, color: C.muted }}>from ATH</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>-{solDropATH.toFixed(1)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 9, color: C.muted }}>vs Avg (${fmt(solAvg, 0)})</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: solVsAvg >= 0 ? C.green : C.red }}>{solVsAvg >= 0 ? "+" : ""}{solVsAvg.toFixed(1)}%</span>
          </div>
          <div style={{ marginTop: 6, textAlign: "center", padding: "3px 0", borderRadius: 4, fontSize: 9, fontWeight: 700, background: solScore >= 3 ? C.redDim : solScore >= 1 ? C.greenDim : C.purpleDim, color: solScore >= 3 ? C.red : solScore >= 1 ? C.green : C.purple }}>
            Score: {solScore > 0 ? "+" : ""}{solScore} · {solScore >= 3 ? "HEAVY BUY" : solScore >= 1 ? "BUY" : solScore >= 0 ? "NEUTRAL" : "CAUTION"}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: C.mutedLight, fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>SIGNALS ({signals.length})</div>
      {signals.sort((a, b) => b.priority - a.priority).slice(0, 5).map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: s.color }}>{s.coin} · {s.type}</span>
            <span style={{ fontSize: 10, color: C.mutedLight, marginLeft: 6 }}>{s.msg}</span>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 10, fontSize: 9, color: C.muted, textAlign: "center", lineHeight: 1.4 }}>
        Combined Score: {totalScore} (BTC:{btcScore} + SOL:{solScore}) · ≥5 = Deploy · ≥3 = DCA+Dip · ≥0 = DCA · {"<"}0 = Reduce
      </div>
    </Card>
  );
}

function Dashboard({ state, onRefresh, fetching, dispatch }) {
  const { holdings, prices, settings } = state;
  const w = getWeekInfo(settings);
  const hasPrices = prices.BTC && prices.SOL;
  const btcP = prices.BTC || 0, solP = prices.SOL || 0;
  const btcVal = holdings.BTC.qty * btcP, solVal = holdings.SOL.qty * solP, total = btcVal + solVal;
  const btcCost = holdings.BTC.qty * holdings.BTC.avgCost, solCost = holdings.SOL.qty * holdings.SOL.avgCost, totalCost = btcCost + solCost;
  const pnl = hasPrices ? total - totalCost : 0, pnlPct = hasPrices && totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const inr = settings.usdInr;
  const now = new Date();
  const phase = now >= EXIT_START ? 4 : now >= HOLD_START ? 3 : now >= PHASE2_START ? 2 : 1;
  const phaseLabels = { 1: "Aggressive Accumulation", 2: "Strategic Accumulation", 3: "Hold & Monitor", 4: "Staged Exit" };
  const phaseColors = { 1: C.green, 2: C.gold, 3: C.blue, 4: C.red };

  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(i); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <MarketAdvisor prices={prices} holdings={holdings} settings={settings} />

      <div style={{ background: phaseColors[phase] + "15", borderRadius: 10, padding: "10px 14px", border: `1px solid ${phaseColors[phase]}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, letterSpacing: 1 }}>CURRENT PHASE</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: phaseColors[phase] }}>Phase {phase}: {phaseLabels[phase]}</div>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: phaseColors[phase], boxShadow: `0 0 10px ${phaseColors[phase]}` }} />
      </div>

      <WeeklyBuyCard settings={settings} prices={prices} />
      <WeeklyTracker state={state} dispatch={dispatch} />

      <Card title="Portfolio Value">
        {hasPrices ? (
          <>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.white, textAlign: "center", letterSpacing: -1 }}>{fmtUSD(total)}</div>
            <div style={{ fontSize: 15, color: C.muted, textAlign: "center", marginTop: 2 }}>{fmtINR(total * inr)}</div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: pnl >= 0 ? C.green : C.red, padding: "4px 12px", background: pnl >= 0 ? C.greenDim : C.redDim, borderRadius: 6 }}>
                {pnl >= 0 ? "▲" : "▼"} {fmtUSD(Math.abs(pnl))} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 18, color: C.gold }}>⏳ Waiting for live prices...</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Tap Refresh below to fetch</div>
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card accent={C.btc + "33"}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.btcDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: C.btc }}>₿</div>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.btc }}>Bitcoin</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.white }}>{fmtCoin(holdings.BTC.qty)}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Value: {hasPrices ? fmtUSD(btcVal) : "—"}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Avg: {fmtUSD(holdings.BTC.avgCost)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: hasPrices ? ((btcVal - btcCost) >= 0 ? C.green : C.red) : C.muted, marginTop: 4 }}>
            {hasPrices ? `${(btcVal - btcCost) >= 0 ? "+" : ""}${fmtUSD(btcVal - btcCost)}` : "—"}
          </div>
        </Card>
        <Card accent={C.sol + "33"}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.solDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: C.sol }}>◎</div>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.sol }}>Solana</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.white }}>{fmtCoin(holdings.SOL.qty, 3)}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Value: {hasPrices ? fmtUSD(solVal) : "—"}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Avg: {fmtUSD(holdings.SOL.avgCost)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: hasPrices ? ((solVal - solCost) >= 0 ? C.green : C.red) : C.muted, marginTop: 4 }}>
            {hasPrices ? `${(solVal - solCost) >= 0 ? "+" : ""}${fmtUSD(solVal - solCost)}` : "—"}
          </div>
        </Card>
      </div>

      <Card title="Live Prices">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Stat label="BTC/USD" value={hasPrices ? fmtUSD(prices.BTC) : "..."} color={hasPrices ? C.white : C.muted} />
          <Stat label="SOL/USD" value={hasPrices ? fmtUSD(prices.SOL) : "..."} color={hasPrices ? C.white : C.muted} />
          <Stat label="USD/INR" value={"₹" + settings.usdInr} />
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          {state.priceError && <div style={{ fontSize: 10, color: C.red, marginBottom: 4 }}>⚠️ {state.priceError}</div>}
          {state.lastFetch ? (
            <div style={{ fontSize: 10, color: C.green }}>✓ Live · {Math.round((Date.now() - state.lastFetch + tick * 0) / 1000)}s ago</div>
          ) : (
            <div style={{ fontSize: 10, color: C.gold }}>{fetching ? "⏳ Fetching..." : "Waiting for prices"}</div>
          )}
          <button onClick={onRefresh} disabled={fetching} style={{ marginTop: 6, padding: "5px 14px", fontSize: 10, fontWeight: 600, background: fetching ? C.card2 : C.greenDim, color: fetching ? C.muted : C.green, border: `1px solid ${C.green}33`, borderRadius: 6, cursor: fetching ? "default" : "pointer" }}>
            {fetching ? "Fetching..." : "🔄 Refresh"}
          </button>
        </div>
      </Card>

      <Card title="Invested vs Current">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Stat label="Invested" value={fmtINR(totalCost * inr)} />
          <Stat label="Current" value={hasPrices ? fmtINR(total * inr) : "—"} color={hasPrices ? (pnl >= 0 ? C.green : C.red) : C.muted} />
          <Stat label="P&L" value={hasPrices ? fmtINR(pnl * inr) : "—"} color={hasPrices ? (pnl >= 0 ? C.green : C.red) : C.muted} />
        </div>
      </Card>

      <Card title="Dip Reserve Pool" accent={C.blue + "33"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{fmtINR(settings.dipReservePool)}</span>
          <span style={{ fontSize: 11, color: C.muted }}>/ {fmtINR(settings.dipReserveMax)}</span>
        </div>
        <ProgressBar pct={(settings.dipReservePool / settings.dipReserveMax) * 100} color={C.blue} />
        {w.started && (
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: C.blueDim, borderRadius: 8, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>WEEKLY ADD</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>{fmtINR(w.dipWeekly)}</div>
            </div>
            <div style={{ background: C.card2, borderRadius: 8, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>DEPLOYED</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.orange }}>{fmtINR((state.dipDeployments || []).reduce((s, d) => s + d.amount, 0))}</div>
            </div>
          </div>
        )}
        {w.started && settings.dipReservePool < settings.dipReserveMax && (
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <button onClick={() => dispatch({ type: "ADD_TO_DIP_POOL", payload: Math.round(w.dipWeekly) })} style={{
              padding: "6px 14px", fontSize: 11, fontWeight: 700, background: C.blueDim, color: C.blue,
              border: `1px solid ${C.blue}33`, borderRadius: 6, cursor: "pointer"
            }}>+ Add This Week's Reserve ({fmtINR(w.dipWeekly)})</button>
          </div>
        )}
        {settings.dipReservePool >= settings.dipReserveMax && (
          <div style={{ marginTop: 8, textAlign: "center", fontSize: 10, color: C.gold, fontWeight: 600 }}>
            🔶 Pool maxed out! Excess flows to DCA
          </div>
        )}
      </Card>
    </div>
  );
}

function LogTrade({ state, dispatch }) {
  const [form, setForm] = useState({ coin: "BTC", type: "buy", qty: "", price: "", date: new Date().toISOString().split("T")[0] });
  const submit = () => {
    if (!form.qty || !form.price) return;
    dispatch({ type: "ADD_TX", payload: { coin: form.coin, type: form.type, qty: parseFloat(form.qty), price: parseFloat(form.price), date: form.date } });
    setForm(f => ({ ...f, qty: "", price: "" }));
  };
  const costINR = form.qty && form.price ? parseFloat(form.qty) * parseFloat(form.price) * state.settings.usdInr : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="New Transaction">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 10, color: C.muted, display: "block", marginBottom: 5, fontWeight: 600 }}>COIN</label>
            <div style={{ display: "flex", gap: 6 }}>{["BTC", "SOL"].map(c => <Btn key={c} primary={form.coin === c} onClick={() => setForm(f => ({ ...f, coin: c }))} small>{c}</Btn>)}</div>
          </div>
          <div>
            <label style={{ fontSize: 10, color: C.muted, display: "block", marginBottom: 5, fontWeight: 600 }}>TYPE</label>
            <div style={{ display: "flex", gap: 6 }}>{["buy", "sell"].map(t => <Btn key={t} primary={form.type === t && t === "buy"} danger={form.type === t && t === "sell"} onClick={() => setForm(f => ({ ...f, type: t }))} small>{t.toUpperCase()}</Btn>)}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="Quantity" type="number" step="any" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="0.001" />
          <Input label="Price (USD)" type="number" step="any" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder={String(state.prices[form.coin] || "")} />
        </div>
        <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        {costINR > 0 && (
          <div style={{ fontSize: 12, color: C.mutedLight, marginBottom: 10, padding: 8, background: C.card2, borderRadius: 8 }}>
            Total: {fmtUSD(parseFloat(form.qty) * parseFloat(form.price))} ({fmtINR(costINR)})
            {form.type === "sell" && <span style={{ color: C.orange }}> · TDS 1%: {fmtINR(costINR * TDS_RATE)}</span>}
          </div>
        )}
        <Btn primary onClick={submit} style={{ width: "100%" }}>Log {form.type === "buy" ? "Buy ▲" : "Sell ▼"}</Btn>
      </Card>
      <Card title={`History (${state.transactions.length})`}>
        {state.transactions.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 20 }}>No transactions yet. Start logging from April 1st!</div>
        ) : (
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {[...state.transactions].reverse().map(tx => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: tx.type === "buy" ? C.green : C.red }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tx.type === "buy" ? C.green : C.red }}>{tx.type.toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: C.white, marginLeft: 6 }}>{fmtCoin(tx.qty)} {tx.coin}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: C.white }}>@ {fmtUSD(tx.price)}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{tx.date?.split("T")[0]}</div>
                  </div>
                  <DeleteBtn onDelete={() => dispatch({ type: "DELETE_TX", payload: tx.id })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function DCADip({ state, dispatch }) {
  const { settings, prices } = state;
  const inr = settings.usdInr;
  const hasPrices = prices.BTC && prices.SOL;
  const btcP = prices.BTC || 0, solP = prices.SOL || 0;
  const btcATH = 126210, solATH = 293;
  const btcDrop = hasPrices ? Math.abs((btcP - btcATH) / btcATH * 100) : 0;
  const solDrop = hasPrices ? Math.abs((solP - solATH) / solATH * 100) : 0;
  const pool = settings.dipReservePool;
  const deployments = state.dipDeployments || [];

  const deployDip = (coin, pct) => {
    const amt = Math.round(pool * (pct / 100));
    if (amt <= 0) return;
    const price = coin === "BTC" ? btcP : solP;
    const qty = (amt / inr) / price;
    dispatch({ type: "DEPLOY_DIP", payload: { amount: amt, coin, zone: pct + "%" } });
    dispatch({ type: "ADD_TX", payload: { coin, type: "buy", qty, price, date: new Date().toISOString() } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="Dip Reserve Pool" accent={C.blue + "33"}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.blue }}>{fmtINR(pool)}</div>
          <div style={{ fontSize: 10, color: C.muted }}>Available to deploy</div>
        </div>
        <ProgressBar pct={(pool / settings.dipReserveMax) * 100} color={C.blue} />
      </Card>

      <Card title="Distance from ATH">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[{ coin: "BTC", drop: btcDrop, ath: btcATH, price: btcP, color: C.btc }, { coin: "SOL", drop: solDrop, ath: solATH, price: solP, color: C.sol }].map(d => (
            <div key={d.coin} style={{ textAlign: "center", padding: 12, background: d.color + "11", borderRadius: 10, border: `1px solid ${d.color}22` }}>
              <div style={{ fontSize: 10, color: d.color, fontWeight: 600 }}>{d.coin} from ATH (${fmt(d.ath, 0)})</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.red, marginTop: 4 }}>-{d.drop.toFixed(1)}%</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Now: {fmtUSD(d.price)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Deploy Dip Reserve">
        {pool <= 0 ? (
          <div style={{ textAlign: "center", padding: 16, color: C.muted, fontSize: 12 }}>No dip reserve to deploy. Add weekly reserves from Dashboard.</div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: C.mutedLight, marginBottom: 10 }}>Tap to deploy from your ₹{fmt(pool, 0)} pool into a coin:</div>
            {["BTC", "SOL"].map(coin => {
              const color = coin === "BTC" ? C.btc : C.sol;
              const drop = coin === "BTC" ? btcDrop : solDrop;
              const zones = settings.dipZones[coin];
              const activeZone = zones.filter(z => drop >= z.dropPct).pop();
              return (
                <div key={coin} style={{ marginBottom: 14, padding: 12, background: color + "11", borderRadius: 10, border: `1px solid ${color}22` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color }}>{coin}</span>
                    {activeZone && <span style={{ fontSize: 10, color: C.red, fontWeight: 700, padding: "2px 8px", background: C.redDim, borderRadius: 4 }}>🔴 -{activeZone.dropPct}% zone active</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[25, 50, 75, 100].map(pct => {
                      const amt = Math.round(pool * (pct / 100));
                      return (
                        <button key={pct} onClick={() => deployDip(coin, pct)} style={{
                          flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: "pointer",
                          border: `1px solid ${color}44`, background: activeZone && activeZone.deployPct >= pct ? color + "33" : C.card2,
                          color: C.white, minWidth: 60
                        }}>
                          <div>{pct}%</div>
                          <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{fmtINR(amt)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Card>

      <Card title="Dip Zones">
        {["BTC", "SOL"].map(coin => {
          const drop = coin === "BTC" ? btcDrop : solDrop;
          const color = coin === "BTC" ? C.btc : C.sol;
          return (
            <div key={coin} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color, marginBottom: 8 }}>{coin} Triggers</div>
              {settings.dipZones[coin].map((z, i) => {
                const active = drop >= z.dropPct;
                return (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 5,
                    borderRadius: 8, background: active ? C.redDim : C.card2, border: `1px solid ${active ? C.red + "66" : "transparent"}`,
                    transition: "all .3s"
                  }}>
                    <span style={{ fontSize: 12, color: active ? C.red : C.muted, fontWeight: 600 }}>-{z.dropPct}% from ATH</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: active ? C.green : C.muted }}>Deploy {z.deployPct}%</span>
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, boxShadow: `0 0 8px ${C.red}` }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>

      <Card title="Deployment History">
        {deployments.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 16 }}>No dip deployments yet</div>
        ) : (
          <div style={{ maxHeight: 200, overflow: "auto" }}>
            {[...deployments].reverse().map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue }} />
                  <span style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>Deployed → {d.coin}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: C.blue, fontWeight: 700 }}>{fmtINR(d.amount)}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{d.date?.split("T")[0]} · {d.zone}</div>
                  </div>
                  <DeleteBtn onDelete={() => dispatch({ type: "DELETE_DIP_DEPLOY", payload: d.id })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Rise Strategy">
        {[{ rise: "+20%", action: "Continue DCA normally", color: C.green }, { rise: "+50%", action: "Shift 60/40 DCA/Dip", color: C.gold }, { rise: "+100%", action: "Pause DCA → dip only", color: C.orange }, { rise: "+150%+", action: "Stop buying → Hold phase", color: C.red }].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: r.color, fontWeight: 800 }}>{r.rise}</span>
            <span style={{ fontSize: 12, color: C.mutedLight }}>{r.action}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ExitPlan({ state }) {
  const { holdings, prices, settings } = state;
  const btcP = prices.BTC || 0, solP = prices.SOL || 0;
  const totalCost = holdings.BTC.qty * holdings.BTC.avgCost + holdings.SOL.qty * holdings.SOL.avgCost;
  const totalVal = holdings.BTC.qty * btcP + holdings.SOL.qty * solP;
  const mult = (totalCost > 0 && prices.BTC) ? totalVal / totalCost : 0;
  const scenarios = [{ l: "Conservative", btc: 150000, sol: 300, e: "🛡️" }, { l: "Moderate", btc: 250000, sol: 500, e: "📈" }, { l: "Bullish", btc: 350000, sol: 750, e: "🚀" }, { l: "Moon", btc: 500000, sol: 1000, e: "🌙" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>CURRENT MULTIPLIER</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: mult >= 2 ? C.green : C.gold }}>{mult.toFixed(2)}x</div>
        </div>
      </Card>

      <Card title="5-Tranche Exit">
        {settings.exitTranches.map((t, i) => {
          const isLast = i === 4;
          const hit = !isLast && mult >= t.mult;
          return (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, marginBottom: 6,
              borderRadius: 10, background: hit ? C.greenDim : C.card2, border: `1px solid ${hit ? C.green + "44" : C.border}`,
              transition: "all .3s"
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: isLast ? C.gold : C.white }}>{isLast ? "🌙 Moonbag" : `#${i + 1} — Sell ${t.pct}%`}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{isLast ? "Hold forever or 10x+" : `At ${t.mult}x`}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: hit ? C.green : C.muted, padding: "4px 10px", background: hit ? C.greenDim : "transparent", borderRadius: 6 }}>
                {hit ? "✓ HIT" : isLast ? "♾️" : "—"}
              </div>
            </div>
          );
        })}
      </Card>

      <Card title="Projections (After 31.2% Tax)">
        {scenarios.map((s, i) => {
          const gross = holdings.BTC.qty * s.btc + holdings.SOL.qty * s.sol;
          const profit = gross - totalCost, tax = Math.max(0, profit) * TAX_RATE, net = profit - tax;
          return (
            <div key={i} style={{ marginBottom: 10, padding: 12, background: C.card2, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{s.e} {s.l}</span>
                <span style={{ fontSize: 10, color: C.muted }}>BTC ${(s.btc / 1000).toFixed(0)}K · SOL ${s.sol}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 9, color: C.muted }}>GROSS</div><div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{fmtUSD(gross)}</div></div>
                <div><div style={{ fontSize: 9, color: C.red }}>TAX</div><div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>-{fmtUSD(tax)}</div></div>
                <div><div style={{ fontSize: 9, color: C.green }}>NET</div><div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{fmtINR(net * state.settings.usdInr)}</div></div>
              </div>
            </div>
          );
        })}
      </Card>

      <Card accent={C.red + "33"} title="⚠️ Tax-Smart Rules">
        {["Spread sells across FY (March vs April)", "NEVER offset BTC gains with SOL losses", "First tranche in late March → cost recovery", "1% TDS claimable in ITR", "Track every tx for Schedule VDA", "Moonbag = zero tax until sold"].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: C.orange, padding: "5px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>{i + 1}. {r}</div>
        ))}
      </Card>
    </div>
  );
}

function TaxView({ state }) {
  const { transactions, settings, holdings, prices } = state;
  const inr = settings.usdInr;
  const btcP = prices.BTC || 69000, solP = prices.SOL || 90;
  const sells = transactions.filter(t => t.type === "sell");
  const tds = sells.reduce((s, t) => s + t.qty * t.price, 0) * TDS_RATE;
  const calcG = (txs, avg) => txs.reduce((s, t) => s + t.qty * (t.price - avg), 0);
  const btcG = calcG(sells.filter(t => t.coin === "BTC"), holdings.BTC.avgCost);
  const solG = calcG(sells.filter(t => t.coin === "SOL"), holdings.SOL.avgCost);
  const totalTax = (Math.max(0, btcG) + Math.max(0, solG)) * TAX_RATE;
  const uBTC = holdings.BTC.qty * (btcP - holdings.BTC.avgCost);
  const uSOL = holdings.SOL.qty * (solP - holdings.SOL.avgCost);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card accent={C.red + "33"} title="India Crypto Tax">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Stat label="Tax Rate" value="31.2%" sub="30% + 4% cess" color={C.red} />
          <Stat label="TDS" value="1%" sub="every sell" color={C.orange} />
        </div>
        <div style={{ fontSize: 11, color: C.red, background: C.redDim, padding: 10, borderRadius: 8, fontWeight: 600 }}>⚠️ No loss offset allowed between coins</div>
      </Card>
      <Card title="Realized P&L">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ l: "BTC", g: btcG, c: C.btc }, { l: "SOL", g: solG, c: C.sol }].map(d => (
            <div key={d.l} style={{ background: C.card2, padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: d.c, fontWeight: 600 }}>{d.l} Realized</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: d.g >= 0 ? C.green : C.red, marginTop: 4 }}>{fmtUSD(d.g)}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Tax: {fmtINR(Math.max(0, d.g) * TAX_RATE * inr)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Unrealized P&L">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Stat label="BTC" value={fmtUSD(uBTC)} color={uBTC >= 0 ? C.green : C.red} />
          <Stat label="SOL" value={fmtUSD(uSOL)} color={uSOL >= 0 ? C.green : C.red} />
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: C.muted }}>If sold now → Tax: {fmtINR((Math.max(0, uBTC) + Math.max(0, uSOL)) * TAX_RATE * inr)}</div>
      </Card>
      <Card title="TDS Summary">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Stat label="TDS Paid" value={fmtINR(tds * inr)} color={C.gold} />
          <Stat label="Tax Owed" value={fmtINR(totalTax * inr)} color={C.red} />
          <Stat label="Net Due" value={fmtINR(Math.max(0, totalTax - tds) * inr)} color={C.orange} />
        </div>
      </Card>
    </div>
  );
}

function Settings({ state, dispatch }) {
  const s = state.settings;
  const up = (k, v) => dispatch({ type: "UPDATE_SETTINGS", payload: { [k]: v } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="Budget">
        <Input label="Monthly (₹)" type="number" value={s.monthlyBudget} onChange={e => up("monthlyBudget", Number(e.target.value))} />
        <Input label="BTC Split (%)" type="number" min="0" max="100" value={s.btcSolSplit} onChange={e => up("btcSolSplit", Number(e.target.value))} />
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>BTC {s.btcSolSplit}% · SOL {100 - s.btcSolSplit}%</div>
        <Input label="DCA Split (%)" type="number" min="0" max="100" value={s.dcaDipSplit} onChange={e => up("dcaDipSplit", Number(e.target.value))} />
        <div style={{ fontSize: 11, color: C.muted }}>DCA {s.dcaDipSplit}% · Dip {100 - s.dcaDipSplit}%</div>
      </Card>
      <Card title="Dip Pool">
        <Input label="Current (₹)" type="number" value={s.dipReservePool} onChange={e => up("dipReservePool", Number(e.target.value))} />
        <Input label="Max Cap (₹)" type="number" value={s.dipReserveMax} onChange={e => up("dipReserveMax", Number(e.target.value))} />
      </Card>
      <Card title="USD/INR">
        <Input label="Rate (auto-updates)" type="number" step="0.01" value={s.usdInr} onChange={e => up("usdInr", Number(e.target.value))} />
      </Card>
      <Card title="Holdings">
        <Input label="BTC Qty" type="number" step="any" value={state.holdings.BTC.qty} onChange={e => {
          const d = Number(e.target.value) - state.holdings.BTC.qty;
          if (d !== 0) dispatch({ type: "ADD_TX", payload: { coin: "BTC", type: d > 0 ? "buy" : "sell", qty: Math.abs(d), price: state.holdings.BTC.avgCost, date: new Date().toISOString() } });
        }} />
        <Input label="BTC Avg ($)" type="number" step="any" value={state.holdings.BTC.avgCost} onChange={e => dispatch({ type: "LOAD_STATE", payload: { ...state, holdings: { ...state.holdings, BTC: { ...state.holdings.BTC, avgCost: Number(e.target.value) } } } })} />
        <Input label="SOL Qty" type="number" step="any" value={state.holdings.SOL.qty} onChange={e => {
          const d = Number(e.target.value) - state.holdings.SOL.qty;
          if (d !== 0) dispatch({ type: "ADD_TX", payload: { coin: "SOL", type: d > 0 ? "buy" : "sell", qty: Math.abs(d), price: state.holdings.SOL.avgCost, date: new Date().toISOString() } });
        }} />
        <Input label="SOL Avg ($)" type="number" step="any" value={state.holdings.SOL.avgCost} onChange={e => dispatch({ type: "LOAD_STATE", payload: { ...state, holdings: { ...state.holdings, SOL: { ...state.holdings.SOL, avgCost: Number(e.target.value) } } } })} />
      </Card>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const doFetch = async () => {
    setFetching(true);
    try {
      const p = await fetchPricesViaAI();
      if (p) dispatch({ type: "SET_PRICES", payload: p });
      else dispatch({ type: "PRICE_ERROR", payload: "Retrying..." });
    } catch (e) { dispatch({ type: "PRICE_ERROR", payload: "Failed" }); }
    setFetching(false);
  };

  useEffect(() => {
    const init = async () => {
      try { const s = localStorage.getItem("crypto-tracker-v4"); if (s) dispatch({ type: "LOAD_STATE", payload: JSON.parse(s) }); } catch (e) { /* noop */ }
      await doFetch();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { if (!loading) { try { localStorage.setItem("crypto-tracker-v4", JSON.stringify(state)); } catch (e) { /* noop */ } } }, [state, loading]);
  useEffect(() => { const i = setInterval(doFetch, 60000); return () => clearInterval(i); }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.green, letterSpacing: 2 }}>₿ HALVING TRACKER</div>
      <div style={{ fontSize: 12, color: C.muted }}>Loading portfolio...</div>
      <div style={{ width: 40, height: 4, background: C.card2, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: "60%", height: "100%", background: C.green, borderRadius: 2, animation: "none" }} />
      </div>
    </div>
  );

  const pages = [
    <Dashboard state={state} onRefresh={doFetch} fetching={fetching} dispatch={dispatch} />,
    <LogTrade state={state} dispatch={dispatch} />,
    <DCADip state={state} dispatch={dispatch} />,
    <ExitPlan state={state} />,
    <TaxView state={state} />,
    <Settings state={state} dispatch={dispatch} />
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.white, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", width: "100%", boxSizing: "border-box" }}>
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: C.green, letterSpacing: 1 }}>2028 Halving Tracker</div>
        <MiniCountdown />
      </div>
      <div style={{ display: "flex", gap: 4, padding: "10px 14px", overflowX: "auto", borderBottom: `1px solid ${C.border}` }}>
        {TABS.map((t, i) => <Tab key={t} label={t} active={tab === i} onClick={() => setTab(i)} />)}
      </div>
      <div style={{ padding: 14, paddingBottom: 50 }}>{pages[tab]}</div>
    </div>
  );
}
