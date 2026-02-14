export default function ContactForm({ resume, updateResume }) {
    const contact = resume.contact || {}

    function updateContact(field, value) {
        const updated = { ...contact, [field]: value }
        updateResume({ contact: updated })
    }

    function updateName(field, value) {
        const updated = { ...contact, [field]: value }
        const firstName = field === 'firstName' ? value : contact.firstName || ''
        const lastName = field === 'lastName' ? value : contact.lastName || ''
        const title = `${firstName} ${lastName}`.trim() || 'Untitled Resume'
        updateResume({ contact: updated, title })
    }

    return (
        <div>
            <div className="form-section-intro">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="7" />
                    <path d="M8 5v4M8 11h.01" />
                </svg>
                <span>Your contact details appear at the top of your resume. Add your location, email, phone, and any relevant professional links.</span>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        id="firstName"
                        type="text"
                        placeholder="e.g. John"
                        value={contact.firstName || ''}
                        onChange={e => updateName('firstName', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        id="lastName"
                        type="text"
                        placeholder="e.g. Doe"
                        value={contact.lastName || ''}
                        onChange={e => updateName('lastName', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="e.g. john@example.com"
                        value={contact.email || ''}
                        onChange={e => updateContact('email', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +1 (555) 123-4567"
                        value={contact.phone || ''}
                        onChange={e => updateContact('phone', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                        id="city"
                        type="text"
                        placeholder="e.g. New York"
                        value={contact.city || ''}
                        onChange={e => updateContact('city', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                        id="country"
                        type="text"
                        placeholder="e.g. USA"
                        value={contact.country || ''}
                        onChange={e => updateContact('country', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="linkedin">LinkedIn URL</label>
                <input
                    id="linkedin"
                    type="url"
                    placeholder="e.g. https://linkedin.com/in/johndoe"
                    value={contact.linkedin || ''}
                    onChange={e => updateContact('linkedin', e.target.value)}
                />
                <div className="form-hint">Displayed as a shortened link (e.g. linkedin.com/in/johndoe)</div>
            </div>

            <div className="form-group">
                <label htmlFor="website">Website / Portfolio</label>
                <input
                    id="website"
                    type="url"
                    placeholder="e.g. https://johndoe.dev"
                    value={contact.website || ''}
                    onChange={e => updateContact('website', e.target.value)}
                />
                <div className="form-hint">GitHub, personal site, or portfolio — shown with a globe icon</div>
            </div>
        </div>
    )
}
