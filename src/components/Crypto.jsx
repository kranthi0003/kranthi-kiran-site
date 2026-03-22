
import React, { useEffect, useState } from 'react'

const COINS = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'litecoin']

const MARKETS_API = (vs='usd', page=1, perPage=9) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h,30d,1y`

const SIMPLE_PRICE_API = (vs='inr,usd', ids=COINS) =>
  `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vs}`

function Sparkline({ prices = [], w = 140, h = 40, small=false }){
  if (!prices || prices.length === 0) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const len = prices.length
  const coords = prices.map((p, i) => {
    const x = (i / (len - 1)) * w
    const y = h - ((p - min) / ((max - min) || 1)) * h
    return { x, y }
  })
  const points = coords.map(c => `${c.x},${c.y}`).join(' ')
  const color = prices[len-1] >= prices[0] ? '#22c55e' : '#ef4444'
  const areaPoints = `0,${h} ` + points + ` ${w},${h}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: 'block' }}>
      <polygon points={areaPoints} fill={color} opacity={0.06} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={small?1.6:2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function Cryto(){
  const [markets, setMarkets] = useState(null)
  const [inrPrices, setInrPrices] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selected, setSelected] = useState(null)
  const [fearGreedIndex, setFearGreedIndex] = useState(null)
  // calculators state
  const [convCoin, setConvCoin] = useState(COINS[0])
  const [convAmount, setConvAmount] = useState('')
  const [convRes, setConvRes] = useState('')

  const [roiCoin, setRoiCoin] = useState(COINS[0])
  const [roiBuyPrice, setRoiBuyPrice] = useState('')
  const [roiAmount, setRoiAmount] = useState('')
  const [roiRes, setRoiRes] = useState('')

  const [dcaInvested, setDcaInvested] = useState('')
  const [dcaCoins, setDcaCoins] = useState('')
  const [dcaRes, setDcaRes] = useState('')

  // Portfolio analyzer state
  const [portfolioInputs, setPortfolioInputs] = useState({})
  const [portfolioShown, setPortfolioShown] = useState(false)

  // Calculators dropdown state
  const [calcExpanded, setCalcExpanded] = useState(true)

  // Portfolio Analysis dropdown state
  const [portfolioAnalysisExpanded, setPortfolioAnalysisExpanded] = useState(true)

  useEffect(() => {
    let mounted = true
    
    async function fetchJson(url) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (res.ok) return await res.json()
      } catch (e) {
        clearTimeout(timeoutId)
      }
      throw new Error('fetch failed')
    }

    async function fetchAll(){
      try {
        const marketsData = await fetchJson(MARKETS_API('usd', 1, 9))
        if (!mounted) return
        if (marketsData && Array.isArray(marketsData) && marketsData.length > 0) {
          setMarkets(marketsData)
          setError('')
          setLastUpdated(Date.now())
          
          // Fetch INR prices in background
          try {
            const p = await fetchJson(SIMPLE_PRICE_API('inr,usd', marketsData.map(m => m.id)))
            if (!mounted) return
            setInrPrices(p)
          } catch (e) {
            // Prices failed but markets is OK
          }
          
          // Fetch Fear & Greed Index
          try {
            const fgiData = await fetchJson('https://api.alternative.me/fng/?limit=1')
            if (fgiData?.data?.[0]) {
              if (!mounted) return
              setFearGreedIndex(fgiData.data[0])
            }
          } catch (e) {
            // Fear & Greed failed but continue
          }
          return
        }
      } catch (err) {
        console.log('Markets fetch failed:', err.message)
      }
      
      // Fallback: try price data only
      if (!mounted) return
      try {
        const priceUrl = SIMPLE_PRICE_API('inr,usd', COINS)
        const p = await fetchJson(priceUrl)
        if (!mounted) return
        
        const fallback = COINS.map(id => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          symbol: id.slice(0, 3),
          current_price: p[id]?.usd || 0,
          sparkline_in_7d: { price: [] },
          price_change_percentage_24h: 0,
          price_change_percentage_30d_in_currency: 0,
          price_change_percentage_1y_in_currency: 0,
          image: `https://assets.coingecko.com/coins/images/1/large/${id}.png`
        }))
        
        setMarkets(fallback)
        setInrPrices(p)
        setError('Showing prices only (no price history available)')
        setLastUpdated(Date.now())
      } catch (e) {
        if (!mounted) return
        // Complete fallback with no data
        const emptyData = COINS.map(id => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          symbol: id.slice(0, 3),
          current_price: 0,
          sparkline_in_7d: { price: [] },
          price_change_percentage_24h: 0,
          price_change_percentage_30d_in_currency: 0,
          price_change_percentage_1y_in_currency: 0,
          image: `https://assets.coingecko.com/coins/images/1/large/${id}.png`
        }))
        setMarkets(emptyData)
        setError('Unable to load data. Please refresh.')
        setLastUpdated(Date.now())
      }
    }

    fetchAll()
    const id = setInterval(fetchAll, 600_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Calculate sentiment & metrics
  const sentiment = markets && fearGreedIndex ? (() => {
    const fgi = parseInt(fearGreedIndex.value)
    let sentimentColor = '#fbbf24', sentiment = 'Neutral'
    if (fgi < 25) { sentimentColor = '#ef4444'; sentiment = 'Fear' }
    else if (fgi < 45) { sentimentColor = '#f97316'; sentiment = 'Fear' }
    else if (fgi < 55) { sentimentColor = '#fbbf24'; sentiment = 'Neutral' }
    else if (fgi < 75) { sentimentColor = '#84cc16'; sentiment = 'Greed' }
    else { sentimentColor = '#22c55e'; sentiment = 'Extreme Greed' }
    
    const avgChange = (markets.reduce((sum, m) => sum + (m.price_change_percentage_24h || 0), 0) / markets.length).toFixed(2)
    const topMomentum = markets.reduce((a, b) => (b.price_change_percentage_24h || 0) > (a.price_change_percentage_24h || 0) ? b : a)
    
    // Market Strength: percentage of coins with positive 24h change
    const gainersCount = markets.filter(m => (m.price_change_percentage_24h || 0) > 0).length
    const marketStrength = ((gainersCount / markets.length) * 100).toFixed(0)
    const strengthColor = marketStrength >= 60 ? '#22c55e' : marketStrength >= 40 ? '#fbbf24' : '#ef4444'
    
    return {
      sentiment,
      sentimentColor,
      fearGreedValue: fgi,
      avgChange,
      topMomentum,
      marketStrength,
      strengthColor,
      gainersCount
    }
  })() : null

  const [showHalvingTracker, setShowHalvingTracker] = useState(false)
  // Accept navigate prop for routing
  return (
    <>
    <div className="cryto-page" style={{ padding: 24, minHeight: '80vh' }}>
      {/* Wallet Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0, marginBottom: 24 }}>
        <button
          className="wallet-btn"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e42)',
            color: '#222',
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onClick={() => (typeof window !== 'undefined' && window.navigate ? window.navigate('/halvingtracker') : window.location.assign('/halvingtracker'))}
          aria-label="Open 2028 Halving Strategy Wallet"
        >
          <i className="fa-solid fa-wallet"></i> Wallet
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 48, marginBottom: 12 }}>Cryto Dashboard</h1>
          <h2 style={{ fontSize: 28, marginTop: 8 }}>Top coins</h2>
          {lastUpdated && <div style={{ color: '#888', marginBottom: 12 }}>Last updated: {new Date(lastUpdated).toLocaleTimeString()} {new Date(lastUpdated).toLocaleString('en-US', { timeZoneName: 'short' }).split(' ').pop()}</div>}
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        </div>

        {sentiment && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 380
          }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Sentiment</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: sentiment.sentimentColor, lineHeight: 1.2 }}>{sentiment.sentiment}</div>
                {sentiment.fearGreedValue && <div style={{ fontSize: 11, color: '#888', marginTop: 6, fontWeight: 500 }}>Index: {sentiment.fearGreedValue}</div>}
              </div>

              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 110 }}>
                <div style={{ fontSize: 9, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Market Avg 24h</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: parseFloat(sentiment.avgChange) >= 0 ? '#22c55e' : '#ef4444', lineHeight: 1.2 }}>
                  {parseFloat(sentiment.avgChange) >= 0 ? '+' : ''}{sentiment.avgChange}%
                </div>
              </div>

              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Hot Momentum</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={sentiment.topMomentum.image} alt="" width={32} height={32} style={{ borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sentiment.topMomentum.name}</div>
                    <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginTop: 2 }}>+{(sentiment.topMomentum.price_change_percentage_24h || 0).toFixed(2)}%</div>
                  </div>
                </div>
              </div>

              <div style={{ height: 40, width: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ flex: '1', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Market Strength</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: sentiment.strengthColor }}>{sentiment.marketStrength}%</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{sentiment.gainersCount} of 9 up</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

  {/* calculators will be rendered below the grid for better flow */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        {markets ? markets.map(item => {
          const up = (item.price_change_percentage_24h||0) >= 0
          return (
          <div key={item.id}
            role="button"
            onClick={() => setSelected(item)}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
              padding: 14,
              borderRadius: 12,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              cursor: 'pointer',
              transform: 'translateZ(0)',
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              boxShadow: '0 1px 0 rgba(255,255,255,0.02)'
            }}
            onMouseEnter={(e)=> e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseLeave={(e)=> e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img src={item.image} alt="" width={48} height={48} style={{ borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'capitalize' }}>{item.name}</div>
                  <div style={{ color: '#bbb', fontSize: 12 }}>{item.symbol.toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(item.current_price)}</div>
                  <div style={{ color: '#bbb', fontSize: 13 }}>{inrPrices && inrPrices[item.id] ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(inrPrices[item.id].inr)}` : '—'}</div>
                </div>
              </div>

                  <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 160, height: 44 }}>
                      <Sparkline prices={item.sparkline_in_7d?.price?.slice(-40)} small />
                    </div>
                    <div style={{ minWidth: 80 }}>
                      <div style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 999, background: up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.08)', color: up ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{(item.price_change_percentage_24h || 0).toFixed(2)}%</div>
                      <div style={{ color: '#999', fontSize: 12 }}>24h</div>
                    </div>
                  </div>
            </div>
          </div>
        )}) : (
          <div style={{ gridColumn: '1/-1', color: '#999' }}>Loading coins...</div>
        )}
  </div>
  {/* Modal for selected coin */}
      {selected && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div onClick={() => setSelected(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex: 59 }} />
          <div style={{ position:'relative', background:'#0b0f12', padding:20, borderRadius:12, width: 'min(920px, 96%)', maxHeight: '90vh', overflow: 'auto', zIndex: 61 }}>
            <button onClick={() => setSelected(null)} style={{ position:'absolute', right:12, top:12, background:'transparent', border:'none', color:'#bbb', fontSize:18, cursor:'pointer' }}>✕</button>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <img src={selected.image} width={56} height={56} style={{ borderRadius:12 }} alt="" />
              <div>
                <div style={{ fontSize:22, fontWeight:800, textTransform:'capitalize' }}>{selected.name} <small style={{ color:'#888', fontSize:12 }}>{selected.symbol.toUpperCase()}</small></div>
                <div style={{ color:'#bbb', marginTop:6 }}>${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(selected.current_price)}</div>
              </div>
            </div>

            <div style={{ marginTop:16 }}>
              <div style={{ height:220 }}>
                <Sparkline prices={selected.sparkline_in_7d?.price || []} w={860} h={220} />
              </div>
            </div>

            {/* Change percentages for selected time period */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>24h</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: (selected.price_change_percentage_24h||0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {(selected.price_change_percentage_24h||0).toFixed(2)}%
                </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>30 Days</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: (selected.price_change_percentage_30d_in_currency||0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {(selected.price_change_percentage_30d_in_currency||0).toFixed(2)}%
                </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>1 Year</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: (selected.price_change_percentage_1y_in_currency||0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {(selected.price_change_percentage_1y_in_currency||0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Calculators block below the grid (improved UI) */}
    <div style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div onClick={() => setCalcExpanded(!calcExpanded)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 20, padding: '12px 0', borderRadius: 8, transition: 'all 160ms ease' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
        <span style={{ fontSize: 28, fontWeight: 700, flex: 1 }}>🛠️ Tools & Calculators</span>
        <span style={{ fontSize: 24, transition: 'transform 200ms ease', transform: calcExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
      </div>
      {calcExpanded && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {/* Convert Calculator */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(59,130,246,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(59,130,246,0.1)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#3b82f6' }}>💱 Convert</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={convCoin} onChange={e=>setConvCoin(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14, fontWeight: 500 }}>
              {COINS.map(c=> <option key={c} value={c} style={{background:'#1a1f26'}}>{c.toUpperCase()}</option>)}
            </select>
            <input value={convAmount} onChange={e=>setConvAmount(e.target.value)} type="number" placeholder="Amount" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }} />
            <button onClick={()=>{
              const amt = Number(convAmount)||0
              const m = markets?.find(x=>x.id===convCoin)
              const usd = m ? m.current_price * amt : null
              const inr = inrPrices?.[convCoin] ? inrPrices[convCoin].inr * amt : (usd ? usd * 82.5 : null)
              const usdStr = usd!=null? new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(usd) : '—'
              const inrStr = inr!=null? new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(inr) : '—'
              setConvRes('USD: ' + usdStr + ' | INR: ' + inrStr)
            }} style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #1e40af)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 160ms ease' }} onMouseEnter={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #60a5fa, #2563eb)'} onMouseLeave={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #3b82f6, #1e40af)'}>Calculate</button>
          </div>
          {convRes && <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontSize: 13, fontWeight: 500 }}>{convRes}</div>}
        </div>

        {/* ROI Calculator */}
        <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.04), rgba(239,68,68,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(239,68,68,0.1)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#ef4444' }}>📊 ROI / P&L</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={roiCoin} onChange={e=>setRoiCoin(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14, fontWeight: 500 }}>
              {COINS.map(c=> <option key={c} value={c} style={{background:'#1a1f26'}}>{c.toUpperCase()}</option>)}
            </select>
            <input value={roiBuyPrice} onChange={e=>setRoiBuyPrice(e.target.value)} type="number" placeholder="Buy price (USD)" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }} />
            <input value={roiAmount} onChange={e=>setRoiAmount(e.target.value)} type="number" placeholder="Amount held" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }} />
            <button onClick={()=>{
              const buy = Number(roiBuyPrice)||0; const amt = Number(roiAmount)||0
              const m = markets?.find(x=>x.id===roiCoin)
              const now = m ? m.current_price : (inrPrices?.[roiCoin]? inrPrices[roiCoin].inr/82.5 : 0)
              const currentValue = now * amt
              const invested = buy * amt
              const pnl = currentValue - invested
              const pct = invested ? (pnl / invested) * 100 : 0
              setRoiRes('Current: $' + new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(currentValue) + ' | P/L: $' + new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(pnl) + ' (' + (pct>=0?'+':'') + pct.toFixed(2) + '%)')
            }} style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 160ms ease' }} onMouseEnter={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #f87171, #ef4444)'} onMouseLeave={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #ef4444, #dc2626)'}>Calculate</button>
          </div>
          {roiRes && <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontSize: 13, fontWeight: 500 }}>{roiRes}</div>}
        </div>

        {/* DCA Calculator */}
        <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.04), rgba(34,197,94,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(34,197,94,0.1)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#22c55e' }}>📈 DCA / Avg Cost</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={dcaInvested} onChange={e=>setDcaInvested(e.target.value)} type="number" placeholder="Total invested (INR)" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }} />
            <input value={dcaCoins} onChange={e=>setDcaCoins(e.target.value)} type="number" placeholder="Total coins held" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }} />
            <button onClick={()=>{
              const invested = Number(dcaInvested)||0; const coins = Number(dcaCoins)||0
              const avg = coins ? (invested/coins) : 0
              setDcaRes('Avg cost: ₹' + new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(avg) + ' per coin')
            }} style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 160ms ease' }} onMouseEnter={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #4ade80, #22c55e)'} onMouseLeave={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #22c55e, #16a34a)'}>Calculate</button>
          </div>
          {dcaRes && <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(34,197,94,0.08)', color: '#86efac', fontSize: 13, fontWeight: 500 }}>{dcaRes}</div>}
        </div>
      </div>
      )}

      {/* Additional Creative Sections */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: 28, marginBottom: 24, color: '#fff' }}>📊 Portfolio Analysis</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Portfolio Analyzer - User Input */}
          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.04), rgba(168,85,247,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(168,85,247,0.1)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#a855f7' }}>💼 Your Portfolio Analysis</div>
            {!portfolioShown ? (
              <button onClick={() => setPortfolioShown(true)} style={{ width: '100%', padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #a855f7, #9333ea)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 160ms ease' }} onMouseEnter={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #c084fc, #a855f7)'} onMouseLeave={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #a855f7, #9333ea)'}>
                + Add Your Holdings
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {COINS.map(coin => (
                  <div key={coin} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{ fontSize: 12, color: '#999', minWidth: 80, textTransform: 'capitalize' }}>{coin}</label>
                    <input 
                      type="number" 
                      placeholder="Amount held" 
                      value={portfolioInputs[coin] || ''}
                      onChange={(e) => setPortfolioInputs({...portfolioInputs, [coin]: e.target.value})}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 12 }} 
                    />
                  </div>
                ))}
                <button onClick={() => setPortfolioShown(false)} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                  ✓ Done
                </button>
              </div>
            )}
            {!portfolioShown && Object.values(portfolioInputs).some(v => v) && markets && (() => {
              const totalValue = Object.entries(portfolioInputs)
                .filter(([, amt]) => amt)
                .reduce((sum, [coinId, amt]) => {
                  const m = markets.find(x => x.id === coinId)
                  return sum + (m ? m.current_price * Number(amt) : 0)
                }, 0)
              
              const portfolioVolatility = Object.entries(portfolioInputs)
                .filter(([, amt]) => amt)
                .reduce((sum, [coinId, amt]) => {
                  const m = markets.find(x => x.id === coinId)
                  const weight = totalValue ? (m ? m.current_price * Number(amt) : 0) / totalValue : 0
                  return sum + weight * Math.pow((m?.price_change_percentage_24h || 0), 2)
                }, 0)
              const portfolioVol = Math.sqrt(portfolioVolatility)
              const riskColor = portfolioVol > 5 ? '#ef4444' : portfolioVol > 2 ? '#fbbf24' : '#22c55e'
              const riskLabel = portfolioVol > 5 ? '🔴 High Risk' : portfolioVol > 2 ? '🟡 Medium Risk' : '🟢 Low Risk'
              
              return (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(168,85,247,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Total Value</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#e9d5ff' }}>${totalValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Portfolio Volatility</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: riskColor }}>{portfolioVol.toFixed(2)}% {riskLabel}</div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Actual Diversification Analysis */}
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(59,130,246,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(59,130,246,0.1)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#3b82f6' }}>📊 Your Allocation</div>
            {Object.values(portfolioInputs).some(v => v) && markets ? (() => {
              const totalValue = Object.entries(portfolioInputs)
                .filter(([, amt]) => amt)
                .reduce((sum, [coinId, amt]) => {
                  const m = markets.find(x => x.id === coinId)
                  return sum + (m ? m.current_price * Number(amt) : 0)
                }, 0)
              
              const allocation = Object.entries(portfolioInputs)
                .filter(([, amt]) => amt)
                .map(([coinId, amt]) => {
                  const m = markets.find(x => x.id === coinId)
                  const value = m ? m.current_price * Number(amt) : 0
                  return {
                    name: coinId,
                    value,
                    percent: totalValue ? (value / totalValue) * 100 : 0,
                    change: m?.price_change_percentage_24h || 0
                  }
                })
                .sort((a, b) => b.percent - a.percent)
              
              const largeCapAlloc = allocation.filter(a => ['bitcoin', 'ethereum'].includes(a.name)).reduce((s, a) => s + a.percent, 0)
              const midCapAlloc = allocation.filter(a => ['binancecoin', 'solana', 'ripple'].includes(a.name)).reduce((s, a) => s + a.percent, 0)
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allocation.map((coin, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4, display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize' }}>
                        <span>{coin.name}</span>
                        <span style={{ color: coin.change >= 0 ? '#22c55e' : '#ef4444' }}>
                          ${coin.value.toFixed(2)} ({coin.percent.toFixed(1)}%) {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: coin.percent + '%', background: coin.change >= 0 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: 'rgba(59,130,246,0.08)', fontSize: 12, color: '#93c5fd' }}>
                    📌 Large Cap: {largeCapAlloc.toFixed(1)}% | Mid Cap: {midCapAlloc.toFixed(1)}%
                  </div>
                </div>
              )
            })() : (
              <div style={{ padding: 12, borderRadius: 6, background: 'rgba(59,130,246,0.05)', fontSize: 12, color: '#93c5fd' }}>
                Add your holdings to see detailed allocation breakdown
              </div>
            )}
          </div>

          {/* Target Price Calculator */}
          <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.04), rgba(34,197,94,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(34,197,94,0.1)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#22c55e' }}>🎪 Target Price Alert</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select id="targetCoin" onChange={(e) => {
                const m = markets?.find(x => x.id === e.target.value)
                if (m) document.getElementById('currentPriceDisplay').textContent = '$' + m.current_price.toFixed(2)
              }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }}>
                <option value="">Select coin...</option>
                {COINS.map(c => <option key={c} value={c} style={{background:'#1a1f26'}}>{c.toUpperCase()}</option>)}
              </select>
              <div style={{ fontSize: 12, color: '#999' }}>Current: <span id="currentPriceDisplay" style={{ color: '#86efac', fontWeight: 600 }}>—</span></div>
              <input id="targetPrice" type="number" placeholder="Your target price ($)" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: 14 }} />
              <button onClick={() => {
                const targetCoin = document.getElementById('targetCoin').value
                const targetPrice = Number(document.getElementById('targetPrice').value) || 0
                const m = markets?.find(x => x.id === targetCoin)
                if (m && targetPrice > 0) {
                  const current = m.current_price
                  const gain = ((targetPrice - current) / current * 100).toFixed(2)
                  const gainColor = gain >= 0 ? '#22c55e' : '#ef4444'
                  document.getElementById('targetRes').innerHTML = `
                    <div style="display:flex; gap:16px; fontSize:13px">
                      <div>Target: <span style="fontWeight:700; color:#86efac">$${targetPrice.toFixed(2)}</span></div>
                      <div>Gain: <span style="fontWeight:700; color:${gainColor}">${gain > 0 ? '+' : ''}${gain}%</span></div>
                    </div>
                  `
                }
              }} style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 160ms ease' }} onMouseEnter={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #4ade80, #22c55e)'} onMouseLeave={(e)=>e.currentTarget.style.background='linear-gradient(135deg, #22c55e, #16a34a)'}>Calculate</button>
              <div id="targetRes" />
            </div>
          </div>
        </div>

        {/* Market Cycle Insights */}
        {markets && (
          <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.04), rgba(236,72,153,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(236,72,153,0.1)', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#ec4899' }}>📈 Market Cycle Insights</div>
            {fearGreedIndex && (() => {
              const fgi = parseInt(fearGreedIndex.value)
              const changes30d = markets.filter(m => (m.price_change_percentage_30d || 0) > 5).length
              const changes1y = markets.filter(m => (m.price_change_percentage_1y || 0) > 50).length
              const trend = changes30d >= 6 ? '📈 Strong Uptrend' : changes30d >= 3 ? '→ Consolidating' : '📉 Downtrend'
              const trendColor = changes30d >= 6 ? '#22c55e' : changes30d >= 3 ? '#fbbf24' : '#ef4444'
              
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(236,72,153,0.05)' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>30-Day Trend</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: trendColor }}>{trend}</div>
                    <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 4 }}>{changes30d}/9 coins up</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(236,72,153,0.05)' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>1-Year Performance</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: changes1y >= 7 ? '#22c55e' : changes1y >= 4 ? '#fbbf24' : '#ef4444' }}>
                      {changes1y}/9 coins up 50%+
                    </div>
                    <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 4 }}>Long-term winners</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(236,72,153,0.05)' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Sentiment Signal</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: fgi > 55 ? '#22c55e' : fgi < 45 ? '#ef4444' : '#fbbf24' }}>
                      {fgi > 75 ? '🚀 All-in' : fgi > 55 ? '📈 Bullish' : fgi < 25 ? '💀 Panic' : fgi < 45 ? '📉 Bearish' : '⚖️ Balanced'}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Pro Tips */}
        <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.04), rgba(249,115,22,0.01))', padding: 20, borderRadius: 14, border: '1px solid rgba(249,115,22,0.1)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#f97316' }}>� Trading Tips</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 13 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(249,115,22,0.05)', color: '#fed7aa' }}>
              <strong>📊 DCA Strategy</strong>
              <p style={{ marginTop: 6, lineHeight: '1.4', fontSize: 12 }}>Invest fixed amounts regularly to reduce average cost regardless of price volatility.</p>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(249,115,22,0.05)', color: '#fed7aa' }}>
              <strong>🛑 Risk Management</strong>
              <p style={{ marginTop: 6, lineHeight: '1.4', fontSize: 12 }}>Set stop losses at 10-15% below entry. Diversify across market caps and sectors.</p>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(249,115,22,0.05)', color: '#fed7aa' }}>
              <strong>⏰ Time Horizon</strong>
              <p style={{ marginTop: 6, lineHeight: '1.4', fontSize: 12 }}>Short-term = volatile. Long-term (1+ year) typically rewards patience with higher gains.</p>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(249,115,22,0.05)', color: '#fed7aa' }}>
              <strong>🎯 Take Profits</strong>
              <p style={{ marginTop: 6, lineHeight: '1.4', fontSize: 12 }}>Lock in gains at predetermined targets (25%, 50%, 100%+). Don't be greedy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
