import React from 'react'
import awsLogo from '../../assets/aws.png'
import couchbaseLogo from '../../assets/couchbase.png'
import githubLogo from '../../assets/github.png'

export default function CompanyLogos() {
  const companies = [
    { name: 'Amazon', logo: awsLogo },
    { name: 'Couchbase', logo: couchbaseLogo },
    { name: 'GitHub', logo: githubLogo },
  ]

  return (
    <section className="company-logos-section">
      <p className="logos-label">Places I've shipped code</p>
      <div className="logos-container">
        {companies.map((company) => (
          <div key={company.name} className="logo-item">
            <img src={company.logo} alt={company.name} />
          </div>
        ))}
      </div>
    </section>
  )
}
