import React, { useState, useEffect } from 'react'
import awsLogo from '../../assets/aws.png'
import couchbaseLogo from '../../assets/couchbase.png'
import githubLogo from '../../assets/github.png'

export default function CompanyLogos() {
  const companies = [
    { name: 'Amazon', logo: awsLogo },
    { name: 'Couchbase', logo: couchbaseLogo },
    { name: 'GitHub', logo: githubLogo },
  ]

  // Customer logos using devicons and brand CDNs
  const customers = [
    { name: 'Netflix', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/netflix.svg' },
    { name: 'Apple', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg' },
    { name: 'Google', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
    { name: 'Microsoft', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
    { name: 'Meta', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg' },
    { name: 'LinkedIn', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg' },
    { name: 'Salesforce', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/salesforce/salesforce-original.svg', size: 52 },
    { name: 'Oracle', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg', size: 52 },
    { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png' },
    { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
    { name: 'Cisco', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg' },
    { name: 'Slack', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg' },
  ]

  // Calculate working days since March 1st, 2021 (excluding weekends)
  const calculateWorkingDays = () => {
    const startDate = new Date('2021-03-01')
    const now = new Date()
    let workingDays = 0
    
    const current = new Date(startDate)
    while (current <= now) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return workingDays
  }

  const [workingDays, setWorkingDays] = useState(calculateWorkingDays())
  
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const msUntilMidnight = tomorrow - now

    const timeout = setTimeout(() => {
      setWorkingDays(calculateWorkingDays())
      const interval = setInterval(() => {
        setWorkingDays(calculateWorkingDays())
      }, 24 * 60 * 60 * 1000)
      return () => clearInterval(interval)
    }, msUntilMidnight)

    return () => clearTimeout(timeout)
  }, [])

  const formatNumber = (num) => {
    return num.toLocaleString()
  }

  const metrics = [
    { label: 'Days in Tech', value: formatNumber(workingDays), icon: '💼' },
    { label: 'Companies', value: '4', icon: '🏢' },
    { label: 'Enterprise Clients', value: '100+', icon: '🤝' },
  ]

  return (
    <section className="stats-row-section">
      <div className="stats-row-container">
        {/* Left Box - Company Logos */}
        <div className="stats-box company-box">
          <div className="stats-box-header">
            <span className="stats-box-icon">🚀</span>
            <p className="stats-box-label">Where I've Shipped</p>
            <a
              href="/journey"
              // target removed for same-page navigation
              className="career-arrow-link"
              title="Go to Career Page"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle',marginLeft:'6px'}}>
                <path d="M4 14L14 4" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 4H7M14 4V11" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
          <div className="logos-container">
            {companies.map((company) => (
              <div key={company.name} className="logo-item">
                <img src={company.logo} alt={company.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Box - Profile Metrics */}
        <div className="stats-box metrics-box">
          <div className="stats-box-header">
            <span className="stats-box-icon">📊</span>
            <p className="stats-box-label">Career Snapshot</p>
          </div>
          <div className="metrics-container">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-item">
                <span className="metric-icon">{metric.icon}</span>
                <div className="metric-content">
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Box - Customer Logos */}
      <div className="stats-box customers-box">
        <div className="stats-box-header">
          <span className="stats-box-icon">🏆</span>
          <p className="stats-box-label">Top Customers I've Worked With</p>
        </div>
        <div className="customers-logos-container">
          {customers.map((customer) => (
            <div key={customer.name} className="customer-logo-item">
              <img 
                src={customer.logo} 
                alt={customer.name} 
                style={customer.size ? { height: `${customer.size}px` } : {}}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
