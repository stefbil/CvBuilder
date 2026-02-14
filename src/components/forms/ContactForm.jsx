import { User, Mail, Phone, MapPin, Linkedin, Globe, Info } from 'lucide-react'

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
        <div className="space-y-6">
            <div className="form-section-intro">
                <Info size={18} className="text-accent" />
                <span>Your contact details appear at the top of your resume. Add your location, email, phone, and any relevant professional links.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-with-icon">
                        <User size={16} />
                        <input
                            id="firstName"
                            type="text"
                            placeholder="e.g. John"
                            value={contact.firstName || ''}
                            onChange={e => updateName('firstName', e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-with-icon">
                        <User size={16} />
                        <input
                            id="lastName"
                            type="text"
                            placeholder="e.g. Doe"
                            value={contact.lastName || ''}
                            onChange={e => updateName('lastName', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-with-icon">
                        <Mail size={16} />
                        <input
                            id="email"
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={contact.email || ''}
                            onChange={e => updateContact('email', e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <div className="input-with-icon">
                        <Phone size={16} />
                        <input
                            id="phone"
                            type="tel"
                            placeholder="e.g. +1 (555) 123-4567"
                            value={contact.phone || ''}
                            onChange={e => updateContact('phone', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <div className="input-with-icon">
                        <MapPin size={16} />
                        <input
                            id="city"
                            type="text"
                            placeholder="e.g. New York"
                            value={contact.city || ''}
                            onChange={e => updateContact('city', e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <div className="input-with-icon">
                        <MapPin size={16} />
                        <input
                            id="country"
                            type="text"
                            placeholder="e.g. USA"
                            value={contact.country || ''}
                            onChange={e => updateContact('country', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="linkedin">LinkedIn URL</label>
                <div className="input-with-icon">
                    <Linkedin size={16} />
                    <input
                        id="linkedin"
                        type="url"
                        placeholder="e.g. https://linkedin.com/in/johndoe"
                        value={contact.linkedin || ''}
                        onChange={e => updateContact('linkedin', e.target.value)}
                    />
                </div>
                <div className="form-hint">Displayed as a shortened link (e.g. linkedin.com/in/johndoe)</div>
            </div>

            <div className="form-group">
                <label htmlFor="website">Website / Portfolio</label>
                <div className="input-with-icon">
                    <Globe size={16} />
                    <input
                        id="website"
                        type="url"
                        placeholder="e.g. https://johndoe.dev"
                        value={contact.website || ''}
                        onChange={e => updateContact('website', e.target.value)}
                    />
                </div>
                <div className="form-hint">GitHub, personal site, or portfolio — shown with a globe icon</div>
            </div>
        </div>
    )
}
