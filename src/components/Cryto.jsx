import React, { useEffect, useState } from 'react'

const COINS = ['bitcoin','ethereum','cardano','solana','ripple','tether']

const MARKETS_API = (vs='usd', ids=COINS) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&ids=${ids.join(',')}&sparkline=true&price_change_percentage=24h,30d,1y&order=market_cap_desc`

const SIMPLE_PRICE_API = (vs='inr', ids=COINS) =>
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

  useEffect(() => {
    let mounted = true
    // robust fetch with proxy fallback
    async function fetchJson(url) {
      // try direct
      try {
        const res = await fetch(url)
        if (res.ok) return await res.json()
      } catch (e) {
        // fall through
      }
      // try AllOrigins raw proxy
      try {
        const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url)
        const res2 = await fetch(proxy)
        if (res2.ok) return await res2.json()
      } catch (e) {}
      // try codetabs proxy
      try {
        const proxy2 = 'https://api.codetabs.cn/v1/proxy?quest=' + encodeURIComponent(url)
        const res3 = await fetch(proxy2)
        if (res3.ok) return await res3.json()
      } catch (e) {}
      throw new Error('fetch failed')
    }

    async function fetchAll(){
      let marketsData = null
      let attempts = 0
      let backoff = 500
      while (attempts < 3) {
        try {
          marketsData = await fetchJson(MARKETS_API('usd', COINS))
          break
        } catch (err) {
          attempts += 1
          await new Promise(r => setTimeout(r, backoff))
          backoff *= 2
        }
      }

      try {
        const p = await fetchJson(SIMPLE_PRICE_API('inr,usd', COINS).replace('vs_currencies=inr', 'vs_currencies=inr,usd'))
        if (!mounted) return
        setInrPrices(p)
        if (marketsData) {
          setMarkets(marketsData)
          setError('')
        } else {
          // Fallback: synthesize lightweight entries using simple price (attempt inr then usd)
          const fallback = COINS.map(id => {
            const vals = p[id] || {}
            return {
              id,
              name: id,
              symbol: id.slice(0,3),
              current_price: vals.usd || vals.inr || null,
              sparkline_in_7d: { price: [] },
              price_change_percentage_24h: 0,
              image: `https://assets.coingecko.com/coins/images/1/large/${id}.png`
            }
          })
          setMarkets(fallback)
          setError('Partial data: showing current prices (no sparklines).')
        }
        setLastUpdated(Date.now())
      } catch (e) {
        if (!mounted) return
        setError('Failed to load price data.')
      }
    }

    fetchAll()
    const id = setInterval(fetchAll, 600_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Fetch 5-year change when coin is selected
  
  return (
    <>
    <div className="cryto-page" style={{ padding: 24, minHeight: '80vh' }}>
      <h1 style={{ fontSize: 48, marginBottom: 12 }}>Cryto Dashboard</h1>
      <h2 style={{ fontSize: 28, marginTop: 8 }}>Top coins</h2>
      {lastUpdated && <div style={{ color: '#888', marginBottom: 12 }}>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

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
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} />
          <div style={{ position:'relative', background:'#0b0f12', padding:20, borderRadius:12, width: 'min(920px, 96%)', maxHeight: '90vh', overflow: 'auto' }}>
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
      <h2 style={{ fontSize: 28, marginBottom: 20, fontWeight: 700 }}>Calculators</h2>
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
    </div>
    </>
  )
}
