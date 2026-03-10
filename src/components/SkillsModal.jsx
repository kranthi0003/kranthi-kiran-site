import React from 'react'

export default function SkillsModal({ onClose }) {
  const skillsData = [
    {
      category: 'Languages',
      accent: 'accent-1',
      skills: ['Python', 'Go', 'Java', 'C++', 'Bash']
    },
    {
      category: 'Cloud & Infrastructure',
      accent: 'accent-2',
      skills: ['AWS', 'Lambda', 'S3', 'ECS', 'EC2', 'DynamoDB', 'Kubernetes', 'Docker']
    },
    {
      category: 'Databases & Data',
      accent: 'accent-1',
      skills: ['MySQL', 'PostgreSQL', 'DynamoDB', 'Couchbase', 'NoSQL', 'Kafka', 'Spark', 'ETL']
    },
    {
      category: 'Observability & Monitoring',
      accent: 'accent-2',
      skills: ['Splunk', 'Prometheus', 'Datadog', 'PagerDuty', 'CloudWatch', 'Grafana', 'X-Ray']
    },
    {
      category: 'DevOps & CI/CD',
      accent: 'accent-1',
      skills: ['AWS CI/CD', 'ArgoCD', 'Terraform', 'Git', 'Gitlab', 'REST APIs']
    },
    {
      category: 'Certifications',
      accent: 'accent-2',
      skills: ['AWS SAA', 'AWS GenAI', 'AWS Well-Architected', 'Couchbase CAA']
    }
  ]

  return (
    <div 
      className="skills-modal-backdrop" 
      onClick={onClose}
      role="presentation"
    >
      {/* Modal */}
      <div 
        className="skills-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="skills-modal-close"
          onClick={onClose}
          aria-label="Close skills modal"
        >
          ✕
        </button>

        <div className="skills-modal-header">
          <h2>Technical Skills</h2>
          <p>Expertise across the full stack</p>
        </div>

        <div className="skills-grid">
          {skillsData.map((section, idx) => (
            <div key={idx} className="skills-category">
              <h3 className={`category-title ${section.accent}`}>
                {section.category}
              </h3>
              <div className="skills-list">
                {section.skills.map((skill, sidx) => (
                  <div key={sidx} className={`skill-tag ${section.accent}`}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="skills-modal-footer">
          <p>Proven experience building production systems at scale</p>
        </div>
      </div>
    </div>
  )
}
