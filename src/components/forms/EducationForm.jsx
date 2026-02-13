import { useState } from 'react'

function BulletTextarea({ value, onChange, placeholder, rows = 3 }) {
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            const textarea = e.target
            const pos = textarea.selectionStart
            const before = value.substring(0, pos)
            const after = value.substring(textarea.selectionEnd)
            const newValue = before + '\n• '
            onChange(newValue + after)
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = newValue.length
            }, 0)
        }
    }

    function handleFocus() {
        if (!value) onChange('• ')
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

export default function EducationForm({ resume, updateResume }) {
    const items = resume.education || []
    const [openIndex, setOpenIndex] = useState(items.length > 0 ? 0 : -1)

    function addItem() {
        const updated = [...items, {
            degree: '', school: '', location: '',
            startDate: '', endDate: '', gpa: '', bullets: '',
        }]
        updateResume({ education: updated })
        setOpenIndex(updated.length - 1)
    }

    function removeItem(index) {
        updateResume({ education: items.filter((_, i) => i !== index) })
        if (openIndex === index) setOpenIndex(-1)
        else if (openIndex > index) setOpenIndex(openIndex - 1)
    }

    function updateItem(index, field, value) {
        updateResume({
            education: items.map((item, i) => i === index ? { ...item, [field]: value } : item)
        })
    }

    function moveItem(index, direction) {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= items.length) return
        const updated = [...items]
            ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
        updateResume({ education: updated })
        setOpenIndex(newIndex)
    }

    return (
        <div>
            <SectionIntro text="List your education in reverse chronological order. Include relevant coursework, honors, or GPA if it strengthens your profile." />

            <div className="accordion-list">
                {items.map((edu, index) => (
                    <div key={index} className="accordion-item">
                        <div className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                            <div className="accordion-header-left">
                                <span className="accordion-header-title">{edu.degree || 'Untitled Degree'}</span>
                                <span className="accordion-header-subtitle">{edu.school || 'School'}</span>
                            </div>
                            <div className="accordion-header-actions">
                                <button className="reorder-btn" onClick={(e) => { e.stopPropagation(); moveItem(index, -1) }}
                                    disabled={index === 0} title="Move up">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 7l3-4 3 4" />
                                    </svg>
                                </button>
                                <button className="reorder-btn" onClick={(e) => { e.stopPropagation(); moveItem(index, 1) }}
                                    disabled={index === items.length - 1} title="Move down">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 3l3 4 3-4" />
                                    </svg>
                                </button>
                                <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); removeItem(index) }}
                                    style={{ width: '28px', height: '28px' }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 3h8M4 3V2a1 1 0 011-1h2a1 1 0 011 1v1M9 3l-.4 6.5A1.5 1.5 0 017.1 11H4.9a1.5 1.5 0 01-1.5-1.5L3 3" />
                                    </svg>
                                </button>
                                <span className={`accordion-chevron ${openIndex === index ? 'open' : ''}`}>▼</span>
                            </div>
                        </div>
                        {openIndex === index && (
                            <div className="accordion-body">
                                <div className="form-group" style={{ marginTop: '12px' }}>
                                    <label>Degree / Program</label>
                                    <input type="text" placeholder="e.g. B.S. in Computer Science" value={edu.degree}
                                        onChange={e => updateItem(index, 'degree', e.target.value)} />
                                    <div className="form-hint">Include the full degree name and major</div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>School / University</label>
                                        <input type="text" placeholder="e.g. MIT" value={edu.school}
                                            onChange={e => updateItem(index, 'school', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" placeholder="e.g. Cambridge, MA" value={edu.location}
                                            onChange={e => updateItem(index, 'location', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="text" placeholder="e.g. September 2019" value={edu.startDate}
                                            onChange={e => updateItem(index, 'startDate', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input type="text" placeholder="e.g. June 2023" value={edu.endDate}
                                            onChange={e => updateItem(index, 'endDate', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>GPA (optional)</label>
                                    <input type="text" placeholder="e.g. 3.85 / 4.0" value={edu.gpa}
                                        onChange={e => updateItem(index, 'gpa', e.target.value)} />
                                    <div className="form-hint">Include only if 3.5+ or relevant to the role</div>
                                </div>
                                <div className="form-group">
                                    <label>Additional Details</label>
                                    <BulletTextarea
                                        placeholder={"• Dean's List, Honors\n• Relevant Coursework: Algorithms, Data Structures"}
                                        value={edu.bullets}
                                        onChange={val => updateItem(index, 'bullets', val)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button className="add-item-btn" onClick={addItem} style={{ marginTop: '12px' }}>
                + Add Education
            </button>
        </div>
    )
}
