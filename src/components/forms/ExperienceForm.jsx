import { useState } from 'react'

function BulletTextarea({ value, onChange, placeholder, rows = 5 }) {
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            const textarea = e.target
            const pos = textarea.selectionStart
            const before = value.substring(0, pos)
            const after = value.substring(textarea.selectionEnd)
            const newValue = before + '\n• '
            onChange(newValue + after)
            // Set cursor position after React re-render
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = newValue.length
            }, 0)
        }
    }

    function handleFocus() {
        if (!value) {
            onChange('• ')
        }
    }

    return (
        <div className="bullet-textarea-wrapper">
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                rows={rows}
            />
            <div className="bullet-textarea-hint">
                Press <kbd>Enter</kbd> to add a new bullet point
            </div>
        </div>
    )
}

function SectionIntro({ text }) {
    return (
        <div className="form-section-intro">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="7" />
                <path d="M8 5v4M8 11h.01" />
            </svg>
            <span>{text}</span>
        </div>
    )
}

export default function ExperienceForm({ resume, updateResume }) {
    const experiences = resume.experience || []
    const [openIndex, setOpenIndex] = useState(experiences.length > 0 ? 0 : -1)

    function addExperience() {
        const updated = [...experiences, {
            role: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            bullets: '',
        }]
        updateResume({ experience: updated })
        setOpenIndex(updated.length - 1)
    }

    function removeExperience(index) {
        const updated = experiences.filter((_, i) => i !== index)
        updateResume({ experience: updated })
        if (openIndex === index) setOpenIndex(-1)
        else if (openIndex > index) setOpenIndex(openIndex - 1)
    }

    function updateItem(index, field, value) {
        const updated = experiences.map((exp, i) =>
            i === index ? { ...exp, [field]: value } : exp
        )
        updateResume({ experience: updated })
    }

    function moveItem(index, direction) {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= experiences.length) return
        const updated = [...experiences]
            ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
        updateResume({ experience: updated })
        setOpenIndex(newIndex)
    }

    return (
        <div>
            <SectionIntro text="Add your work experience starting with the most recent position. Use strong action verbs for bullet points (e.g. Developed, Led, Implemented)." />

            <div className="accordion-list">
                {experiences.map((exp, index) => (
                    <div key={index} className="accordion-item">
                        <div className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                            <div className="accordion-header-left">
                                <span className="accordion-header-title">
                                    {exp.role || 'Untitled Position'}
                                </span>
                                <span className="accordion-header-subtitle">
                                    {exp.company || 'Company'} {exp.startDate && `• ${exp.startDate}`}
                                </span>
                            </div>
                            <div className="accordion-header-actions">
                                <button
                                    className="reorder-btn"
                                    onClick={(e) => { e.stopPropagation(); moveItem(index, -1) }}
                                    disabled={index === 0}
                                    title="Move up"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 7l3-4 3 4" />
                                    </svg>
                                </button>
                                <button
                                    className="reorder-btn"
                                    onClick={(e) => { e.stopPropagation(); moveItem(index, 1) }}
                                    disabled={index === experiences.length - 1}
                                    title="Move down"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 3l3 4 3-4" />
                                    </svg>
                                </button>
                                <button
                                    className="btn-icon danger"
                                    onClick={(e) => { e.stopPropagation(); removeExperience(index) }}
                                    title="Remove"
                                    style={{ width: '28px', height: '28px' }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 3h8M4 3V2a1 1 0 011-1h2a1 1 0 011 1v1M9 3l-.4 6.5A1.5 1.5 0 017.1 11H4.9a1.5 1.5 0 01-1.5-1.5L3 3" />
                                    </svg>
                                </button>
                                <span className={`accordion-chevron ${openIndex === index ? 'open' : ''}`}>▼</span>
                            </div>
                        </div>

                        {openIndex === index && (
                            <div className="accordion-body">
                                <div className="form-row" style={{ marginTop: '12px' }}>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Software Engineer"
                                            value={exp.role}
                                            onChange={e => updateItem(index, 'role', e.target.value)}
                                        />
                                        <div className="form-hint">Your role or position title</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Google"
                                            value={exp.company}
                                            onChange={e => updateItem(index, 'company', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. New York, NY"
                                        value={exp.location}
                                        onChange={e => updateItem(index, 'location', e.target.value)}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. January 2023"
                                            value={exp.startDate}
                                            onChange={e => updateItem(index, 'startDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Present"
                                            value={exp.endDate}
                                            disabled={exp.isCurrent}
                                            onChange={e => updateItem(index, 'endDate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id={`current-${index}`}
                                        checked={exp.isCurrent}
                                        onChange={e => {
                                            updateItem(index, 'isCurrent', e.target.checked)
                                            if (e.target.checked) updateItem(index, 'endDate', 'Present')
                                        }}
                                    />
                                    <label htmlFor={`current-${index}`}>I currently work here</label>
                                </div>

                                <div className="form-group">
                                    <label>Key Achievements & Responsibilities</label>
                                    <BulletTextarea
                                        placeholder={"• Developed and maintained scalable web applications\n• Led a team of 5 engineers on a key project\n• Improved system performance by 40%"}
                                        value={exp.bullets}
                                        onChange={val => updateItem(index, 'bullets', val)}
                                        rows={5}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button className="add-item-btn" onClick={addExperience} style={{ marginTop: '12px' }}>
                + Add Experience
            </button>
        </div>
    )
}
