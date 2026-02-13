import '../styles/resume.css'

// Inline SVG icons for contact items (Rezi-style)
const icons = {
    location: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    email: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 7l-10 7L2 7" />
        </svg>
    ),
    phone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    website: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
}

const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'education', 'experience', 'projects']

const BUILTIN_SECTIONS = ['summary', 'skills', 'education', 'experience', 'projects']

export default function ResumePreview({ resume }) {
    const contact = resume.contact || {}
    const experiences = resume.experience || []
    const projects = resume.projects || []
    const education = resume.education || []
    const skills = resume.skills || []
    const summary = resume.summary || ''
    const customSections = resume.customSections || []

    // Parse section order
    const sectionOrder = resume.sectionOrder
        ? resume.sectionOrder.split(',').map(s => s.trim())
        : DEFAULT_SECTION_ORDER

    function parseBullets(text) {
        if (!text) return []
        return text.split('\n').filter(line => line.trim()).map(line => {
            // Strip leading bullet characters (•, -, *) and whitespace
            return line.replace(/^[\s•\-*]+/, '').trim()
        }).filter(Boolean)
    }

    // Build contact info items with icons
    const contactItems = []
    if (contact.city || contact.country) {
        contactItems.push({
            text: [contact.city, contact.country].filter(Boolean).join(', '),
            type: 'text',
            icon: 'location',
        })
    }
    if (contact.email) {
        contactItems.push({ text: contact.email, type: 'email', icon: 'email' })
    }
    if (contact.phone) {
        contactItems.push({ text: contact.phone, type: 'text', icon: 'phone' })
    }
    if (contact.linkedin) {
        const display = contact.linkedin.replace(/^https?:\/\/(www\.)?/, '')
        contactItems.push({ text: display, href: contact.linkedin, type: 'link', icon: 'linkedin' })
    }
    if (contact.website) {
        const display = contact.website.replace(/^https?:\/\/(www\.)?/, '')
        contactItems.push({ text: display, href: contact.website, type: 'link', icon: 'website' })
    }

    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
    const hasContent = fullName || summary || experiences.length || projects.length || education.length || skills.length || customSections.length

    // Section renderers
    const sectionRenderers = {
        summary: () => summary ? (
            <div key="summary" className="resume-section">
                <h2 className="resume-section-title">Summary</h2>
                <p className="resume-summary-text">{summary}</p>
            </div>
        ) : null,

        experience: () => experiences.length > 0 && experiences.some(e => e.role || e.company) ? (
            <div key="experience" className="resume-section">
                <h2 className="resume-section-title">Experience</h2>
                {experiences.filter(e => e.role || e.company).map((exp, i) => (
                    <div key={i} className="resume-entry">
                        <div className="resume-entry-header">
                            <span className="resume-entry-title">{exp.role}</span>
                            <span className="resume-entry-date">
                                {exp.startDate}{exp.startDate && exp.endDate && ' — '}{exp.endDate}
                            </span>
                        </div>
                        <div className="resume-entry-subtitle">
                            <span className="resume-entry-org">{exp.company}</span>
                            <span className="resume-entry-location">{exp.location}</span>
                        </div>
                        {exp.bullets && (
                            <ul className="resume-bullets">
                                {parseBullets(exp.bullets).map((bullet, j) => (
                                    <li key={j}>{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        projects: () => projects.length > 0 && projects.some(p => p.name) ? (
            <div key="projects" className="resume-section">
                <h2 className="resume-section-title">Projects</h2>
                {projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="resume-entry">
                        <div className="resume-project-header">
                            <span className="resume-project-title">{proj.name}</span>
                            {proj.technologies && (
                                <span className="resume-project-tech">{proj.technologies}</span>
                            )}
                        </div>
                        {proj.url && (
                            <a className="resume-project-url" href={proj.url}>{proj.url}</a>
                        )}
                        {proj.bullets && (
                            <ul className="resume-bullets">
                                {parseBullets(proj.bullets).map((bullet, j) => (
                                    <li key={j}>{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        education: () => education.length > 0 && education.some(e => e.degree || e.school) ? (
            <div key="education" className="resume-section">
                <h2 className="resume-section-title">Education</h2>
                {education.filter(e => e.degree || e.school).map((edu, i) => (
                    <div key={i} className="resume-entry">
                        <div className="resume-entry-header">
                            <span className="resume-entry-title">{edu.degree}</span>
                            <span className="resume-entry-date">
                                {edu.startDate}{edu.startDate && edu.endDate && ' — '}{edu.endDate}
                            </span>
                        </div>
                        <div className="resume-entry-subtitle">
                            <span className="resume-entry-org">{edu.school}</span>
                            <span className="resume-entry-location">{edu.location}</span>
                        </div>
                        {edu.gpa && (
                            <div style={{ fontSize: '8.5pt', color: '#444', marginBottom: '0.5mm' }}>
                                GPA: {edu.gpa}
                            </div>
                        )}
                        {edu.bullets && (
                            <ul className="resume-bullets">
                                {parseBullets(edu.bullets).map((bullet, j) => (
                                    <li key={j}>{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        skills: () => skills.length > 0 && skills.some(s => s.category || s.items) ? (
            <div key="skills" className="resume-section">
                <h2 className="resume-section-title">Skills</h2>
                <div className="resume-skills-list">
                    {skills.filter(s => s.category || s.items).map((skill, i) => (
                        <div key={i} className="resume-skill-row">
                            <span className="resume-skill-category">{skill.category}:</span>
                            <span className="resume-skill-items">{skill.items}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,
    }

    // Render a custom section by its ID
    function renderCustomSection(sectionId) {
        const cs = customSections.find(s => s.id === sectionId)
        if (!cs || !cs.title) return null

        let items = []
        try {
            items = typeof cs.items === 'string' ? JSON.parse(cs.items) : (cs.items || [])
        } catch {
            items = []
        }

        // Filter out empty items
        const validItems = items.filter(item => item.title || item.subtitle || item.bullets)
        if (validItems.length === 0 && !cs.title) return null

        return (
            <div key={sectionId} className="resume-section">
                <h2 className="resume-section-title">{cs.title}</h2>
                {validItems.map((item, i) => (
                    <div key={i} className="resume-entry">
                        {(item.title || item.date) && (
                            <div className="resume-entry-header">
                                <span className="resume-entry-title">{item.title}</span>
                                {item.date && (
                                    <span className="resume-entry-date">{item.date}</span>
                                )}
                            </div>
                        )}
                        {item.subtitle && (
                            <div className="resume-entry-subtitle">
                                <span className="resume-entry-org">{item.subtitle}</span>
                            </div>
                        )}
                        {item.bullets && (
                            <ul className="resume-bullets">
                                {parseBullets(item.bullets).map((bullet, j) => (
                                    <li key={j}>{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="a4-page">
            {!hasContent ? (
                <div style={{ textAlign: 'center', paddingTop: '120px' }}>
                    <p className="resume-empty-hint">Start filling in your details to see the preview</p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    {fullName && (
                        <div className="resume-header">
                            <h1 className="resume-name">{fullName}</h1>
                            {contactItems.length > 0 && (
                                <div className="resume-contact-line">
                                    {contactItems.map((item, i) => (
                                        <span key={i} className="resume-contact-item">
                                            {i > 0 && <span className="resume-contact-separator">·</span>}
                                            <span className="resume-contact-icon">{icons[item.icon]}</span>
                                            {item.type === 'link' ? (
                                                <a className="resume-contact-link" href={item.href}>{item.text}</a>
                                            ) : item.type === 'email' ? (
                                                <a className="resume-contact-link" href={`mailto:${item.text}`}>{item.text}</a>
                                            ) : (
                                                <span>{item.text}</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Render sections in order */}
                    {sectionOrder.map(sectionKey => {
                        if (BUILTIN_SECTIONS.includes(sectionKey)) {
                            const renderer = sectionRenderers[sectionKey]
                            return renderer ? renderer() : null
                        }
                        // Custom section
                        return renderCustomSection(sectionKey)
                    })}
                </>
            )}
        </div>
    )
}
