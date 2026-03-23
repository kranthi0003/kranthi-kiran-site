import React, { useState, useEffect } from "react";
// JSONBin.io integration
const BIN_ID = "69c155d6aa77b81da90fac42";
const API_KEY = "$2a$10$iaWyY.ZivRsMx/6DDJsOZOhXwalf4F0RMJDhywTfvzE3m5MJidMY2";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function fetchTransactionsFromCloud() {
  try {
    const res = await fetch(BASE_URL, {
      headers: { "X-Master-Key": API_KEY }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    // Filter out empty objects (from initial bin)
    return (data.record || []).filter(tx => Object.keys(tx).length > 0);
  } catch (err) {
    alert('Error loading transactions from cloud: ' + err.message);
    return [];
  }
}

async function saveTransactionsToCloud(transactions) {
  try {
    // If transactions is empty, save an empty array (jsonbin.io supports this)
    const payload = Array.isArray(transactions) && transactions.length === 0 ? [] : transactions;
    const res = await fetch(BASE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save transactions');
  } catch (err) {
    alert('Error saving transactions to cloud: ' + err.message);
  }
}
// Add Orbitron font from Google Fonts
if (typeof document !== 'undefined') {
  const orbitronFont = document.createElement('link');
  orbitronFont.rel = 'stylesheet';
  orbitronFont.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap';

  document.head.appendChild(orbitronFont);
}

// Add this at the top-level of the file (after imports)
if (typeof document !== 'undefined' && !document.getElementById('wallet-no-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'wallet-no-spinner-style';
  style.innerHTML = `
    /* Chrome, Safari, Edge, Opera */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;
  document.head.appendChild(style);
}

function useLiveBTCPrice() {
  const [btcPrice, setBtcPrice] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function fetchPrice() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        if (mounted) setBtcPrice(data.bitcoin.usd);
      } catch (e) {
        if (mounted) setBtcPrice(null);
      }
    }
    fetchPrice();
    const id = setInterval(fetchPrice, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return btcPrice;
}

async function fetchBTCPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,inr");
    const data = await res.json();
    return { usd: data.bitcoin.usd, inr: data.bitcoin.inr };
  } catch {
    return { usd: null, inr: null };
  }
}

export default function Wallet() {
  // Remove number input spinners (arrows) for all browsers
  const inputNoSpinner = {
    MozAppearance: 'textfield',
    appearance: 'textfield',
    WebkitAppearance: 'none',
  };
  const [holdings, setHoldings] = useState(() => {
    const h = localStorage.getItem('btc_holdings');
    return h ? JSON.parse(h) : { qty: 0, avgCost: 0 };
  });
  const [transactions, setTransactions] = useState([]);
  // Filter state
  const [filter, setFilter] = useState({ month: '', year: '' });
  // Extract unique months/years from transactions
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const transactionDates = transactions.map(tx => tx.date).filter(Boolean);
  const uniqueYears = Array.from(new Set(transactionDates.map(d => d && d.split('-')[0]))).filter(Boolean);
  const uniqueMonths = Array.from(new Set(transactionDates.map(d => d && d.split('-')[1]))).filter(Boolean);
  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    if (!filter.month && !filter.year) return true;
    if (!tx.date) return false;
    const [year, month] = tx.date.split('-');
    return (
      (!filter.year || year === filter.year) &&
      (!filter.month || month === filter.month)
    );
  });
  // Sort transactions so latest is first (by id, which is Date.now())
  const sortedTransactions = [...filteredTransactions].sort((a, b) => (b.id || 0) - (a.id || 0));
  // Pagination state for transaction history
  const [page, setPage] = useState(1);
  const transactionsPerPage = 10;
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (page - 1) * transactionsPerPage,
    page * transactionsPerPage
  );

  // Reset to page 1 if filter changes and current page is out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filter, filteredTransactions.length, totalPages]);
  const [currency, setCurrency] = useState('USD');
  const [btcPrice, setBTCPrice] = useState({ usd: null, inr: null });
  const [form, setForm] = useState({ type: "buy", qty: "", price: "", date: "" });
  const liveBTCPrice = useLiveBTCPrice();

  useEffect(() => { fetchBTCPrice().then(setBTCPrice); }, []);
  useEffect(() => { localStorage.setItem('btc_holdings', JSON.stringify(holdings)); }, [holdings]);
  // Load transactions from jsonbin.io on mount
  useEffect(() => {
    fetchTransactionsFromCloud().then(setTransactions);
  }, []);

  // Use the latest available BTC price for current value
  const btcPriceUSD = liveBTCPrice !== null ? liveBTCPrice : btcPrice.usd;
  const btcPriceINR = btcPrice.inr;
  // Rounded values
  const roundedHoldings = Number(holdings.qty).toFixed(6);
  const currentValueUSD = btcPriceUSD !== null ? +(holdings.qty * btcPriceUSD).toFixed(2) : null;
  const currentValueINR = btcPriceINR !== null ? +(holdings.qty * btcPriceINR).toFixed(2) : null;
  const investedUSD = +(holdings.qty * holdings.avgCost).toFixed(2);
  const investedINR = +(holdings.qty * holdings.avgCost * (btcPrice.inr && btcPrice.usd ? btcPrice.inr / btcPrice.usd : 0)).toFixed(2);
  const plUSD = currentValueUSD !== null ? +(currentValueUSD - investedUSD).toFixed(2) : 0;
  const plINR = currentValueINR !== null ? +(currentValueINR - investedINR).toFixed(2) : 0;

  // Calculate P/L %
  const plPercentUSD = investedUSD !== 0 ? (plUSD / investedUSD) * 100 : 0;
  const plPercentINR = investedINR !== 0 ? (plINR / investedINR) * 100 : 0;

  async function deleteTransaction(id) {
    const newTransactions = transactions.filter(tx => tx.id !== id);
    let qty = 0, avgCost = 0;
    newTransactions.forEach(tx => {
      const txQty = parseFloat(tx.qty);
      const txPrice = parseFloat(tx.price);
      if (tx.type === 'buy') {
        avgCost = (qty * avgCost + txQty * txPrice) / (qty + txQty);
        qty += txQty;
      } else {
        qty -= txQty;
        if (qty < 0) qty = 0;
      }
    });
    setTransactions(newTransactions);
    setHoldings({ qty, avgCost: qty === 0 ? 0 : avgCost });
    await saveTransactionsToCloud(newTransactions);
    // Reload from cloud to ensure UI is in sync
    const latest = await fetchTransactionsFromCloud();
    setTransactions(latest);
  }

  function addTransaction() {
    const qty = parseFloat(form.qty);
    const price = parseFloat(form.price);
    if (!qty || !price) {
      alert('Please enter both quantity and price.');
      return;
    }
    // Date validation
    const now = new Date();
    let txDate = form.date ? new Date(form.date) : now;
    if (isNaN(txDate.getTime())) {
      alert('Invalid date.');
      return;
    }
    const minDate = new Date('2010-01-01');
    if (txDate > now) {
      alert('Transaction date cannot be in the future.');
      return;
    }
    if (txDate < minDate) {
      alert('Transaction date is too far in the past.');
      return;
    }
    let newQty = holdings.qty;
    let newAvg = holdings.avgCost;
    if (form.type === "buy") {
      newAvg = (newQty * newAvg + qty * price) / (newQty + qty);
      newQty += qty;
    } else {
      if (qty > newQty) {
        alert('Sell not possible: Not enough BTC available.');
        return;
      }
      if (newQty === 0) {
        alert('Sell not possible: You have no BTC holdings.');
        return;
      }
      newQty -= qty;
    }
    setHoldings({ qty: newQty, avgCost: newQty === 0 ? 0 : newAvg });
    // Add timestamp to transaction
    const dateStr = form.date ? form.date : now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) + ' IST';
    const newTx = { ...form, qty, price, id: Date.now(), date: dateStr, time: timeStr };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactionsToCloud(updated);
    setForm({ ...form, qty: "", price: "" });
  }

  return (
    <section style={{ width: '100%', margin: '40px 0 0 0', padding: '0', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      {/* Currency Switch Top Right (single instance) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, width: '100%', maxWidth: 1400, margin: '0 auto', position: 'relative', top: 0, right: 0, paddingRight: 32 }}>
        <span style={{ fontSize: 16, color: '#bbb' }}>Currency:</span>
        <button
          onClick={() => setCurrency('USD')}
          style={{
            padding: '8px 22px',
            borderRadius: 20,
            border: '1px solid #23272f',
            background: currency === 'USD' ? '#23272f' : '#181c20',
            color: currency === 'USD' ? '#fff' : '#bbb',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 17,
            marginRight: 2,
            transition: 'background 0.15s',
          }}
          aria-pressed={currency === 'USD'}
        >USD</button>
        <button
          onClick={() => setCurrency('INR')}
          style={{
            padding: '8px 22px',
            borderRadius: 20,
            border: '1px solid #23272f',
            background: currency === 'INR' ? '#23272f' : '#181c20',
            color: currency === 'INR' ? '#fff' : '#bbb',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 17,
            transition: 'background 0.15s',
          }}
          aria-pressed={currency === 'INR'}
        >INR</button>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4, letterSpacing: 0.5, color: '#fff', textAlign: 'center' }}>BTC Wallet</h2>
        <div style={{ fontSize: 16, color: '#93c5fd', marginBottom: 18, textAlign: 'center' }}>
          Live BTC Price: {liveBTCPrice !== null ? (
            currency === 'USD'
              ? <span style={{ color: '#22c55e', fontWeight: 700 }}>${liveBTCPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              : btcPrice.inr !== null
                ? <span style={{ color: '#22c55e', fontWeight: 700 }}>₹{btcPrice.inr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                : 'Loading...'
          ) : 'Loading...'}
        </div>
        <table style={{ width: '100%', maxWidth: 700, margin: '0 auto 18px auto', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={{ fontSize: 16, color: '#bbb', fontWeight: 400, paddingBottom: 2 }}>Holdings</th>
            <th style={{ fontSize: 16, color: '#bbb', fontWeight: 400, paddingBottom: 2 }}>Invested</th>
            <th style={{ fontSize: 16, color: '#bbb', fontWeight: 400, paddingBottom: 2 }}>Current Value</th>
            <th style={{ fontSize: 16, color: '#bbb', fontWeight: 400, paddingBottom: 2 }}>P/L</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontSize: 22, fontWeight: 700 }}>
              {holdings.qty} <span style={{ color: '#93c5fd', fontWeight: 600 }}>BTC</span>
            </td>
            <td style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>
                {currency === 'USD'
                  ? `$${investedUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                  : `₹${investedINR.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            </td>
            <td style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>
              {currency === 'USD'
                ? (currentValueUSD !== null
                    ? `$${currentValueUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                    : 'Loading...')
                : (currentValueINR !== null
                    ? `₹${currentValueINR.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                    : 'Loading...')}
            </td>
            <td style={{ fontSize: 22, fontWeight: 700, color: (currency === 'USD' ? plUSD : plINR) >= 0 ? '#22c55e' : '#ef4444' }}>
              {currency === 'USD'
                ? `${plUSD >= 0 ? '+' : ''}$${plUSD.toFixed(2)} (${plPercentUSD >= 0 ? '+' : ''}${plPercentUSD.toFixed(2)}%)`
                : `${plINR >= 0 ? '+' : ''}₹${plINR.toFixed(2)} (${plPercentINR >= 0 ? '+' : ''}${plPercentINR.toFixed(2)}%)`}
            </td>
          </tr>
        </tbody>
        </table>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #23272f', margin: '24px 0 18px 0' }} />
      <form 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
          gap: 14,
          alignItems: 'end',
          marginBottom: 24,
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 16px',
        }}
        onSubmit={e => { e.preventDefault(); addTransaction(); }}
        aria-label="Add Transaction"
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="type" style={{ fontSize: 13, color: '#bbb', marginBottom: 4 }}>Type</label>
          <select id="type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #23272f', background: '#23272f', color: '#fff', fontWeight: 600, fontSize: 15 }}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="qty" style={{ fontSize: 13, color: '#bbb', marginBottom: 4 }}>Qty (BTC)</label>
          <input 
            id="qty" 
            type="number" 
            placeholder="e.g. 0.01" 
            value={form.qty} 
            onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #23272f', background: '#23272f', color: '#fff', fontSize: 15, ...inputNoSpinner }}
            inputMode="decimal"
            step="any"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="price" style={{ fontSize: 13, color: '#bbb', marginBottom: 4 }}>Price ({currency})</label>
          <input 
            id="price" 
            type="number" 
            placeholder={currency === 'USD' ? 'e.g. 70000' : 'e.g. 6000000'} 
            value={form.price} 
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #23272f', background: '#23272f', color: '#fff', fontSize: 15, ...inputNoSpinner }}
            inputMode="decimal"
            step="any"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="date" style={{ fontSize: 13, color: '#bbb', marginBottom: 4 }}>Date</label>
          <input id="date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #23272f', background: '#23272f', color: '#fff', fontSize: 15 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
          <button type="submit" style={{ padding: '12px 22px', borderRadius: 6, background: '#2563eb', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px 0 #2563eb22', transition: 'background 0.15s' }}>Add</button>
        </div>
      </form>
      <hr style={{ border: 'none', borderTop: '1px solid #23272f', margin: '18px 0' }} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
          <span>Transaction History</span>
          <div style={{ fontWeight: 400, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label htmlFor="filter-month" style={{ color: '#bbb' }}>Month:</label>
            <select id="filter-month" value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #23272f', background: '#23272f', color: '#fff' }}>
              <option value="">All</option>
              {Array.from(new Set(transactionDates.map(d => d && d.split('-')[1]))).filter(Boolean).sort().map(m => (
                <option key={m} value={m}>{monthNames[parseInt(m, 10) - 1]}</option>
              ))}
            </select>
            <label htmlFor="filter-year" style={{ color: '#bbb' }}>Year:</label>
            <select id="filter-year" value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #23272f', background: '#23272f', color: '#fff' }}>
              <option value="">All</option>
              {uniqueYears.sort().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {(filter.month || filter.year) && (
              <button type="button" onClick={() => setFilter({ month: '', year: '' })} style={{ marginLeft: 6, padding: '4px 10px', borderRadius: 4, border: 'none', background: '#444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Clear</button>
            )}
          </div>
        </div>
        {filteredTransactions.length === 0 ? (
          <div style={{ color: '#bbb', fontSize: 14, padding: '12px 0', textAlign: 'center' }}>No transactions found for this period.</div>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: 'none' }}>
              <thead>
                <tr style={{ background: '#23272f' }}>
                  <th style={{ textAlign: 'left', padding: '7px 5px', color: '#93c5fd', fontWeight: 700 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '7px 5px', color: '#93c5fd', fontWeight: 700 }}>Qty</th>
                  <th style={{ textAlign: 'left', padding: '7px 5px', color: '#93c5fd', fontWeight: 700 }}>Price</th>
                  <th style={{ textAlign: 'left', padding: '7px 5px', color: '#93c5fd', fontWeight: 700 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '7px 5px', color: '#93c5fd', fontWeight: 700 }}>Time</th>
                  <th style={{ textAlign: 'center', padding: '7px 5px', color: '#93c5fd', fontWeight: 700 }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #23272f' }}>
                    <td style={{ color: tx.type === 'buy' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{tx.type.toUpperCase()}</td>
                    <td style={{ color: '#fff' }}>{tx.qty}</td>
                    <td style={{ color: '#fff' }}>${tx.price}</td>
                    <td style={{ color: '#bbb' }}>{tx.date}</td>
                    <td style={{ color: '#bbb' }}>{tx.time || ''}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button aria-label="Delete transaction" onClick={() => deleteTransaction(tx.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 16, cursor: 'pointer', padding: 0 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    style={{
                      minWidth: 32,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: 'none',
                      background: num === page ? '#2563eb' : '#23272f',
                      color: num === page ? '#fff' : '#bbb',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: num === page ? '0 2px 8px 0 #2563eb22' : 'none',
                      transition: 'background 0.15s',
                    }}
                    aria-current={num === page ? 'page' : undefined}
                  >{num}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
