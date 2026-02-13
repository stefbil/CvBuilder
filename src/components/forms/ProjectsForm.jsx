import { useState } from 'react'

function BulletTextarea({ value, onChange, placeholder, rows = 4 }) {
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

export default function ProjectsForm({ resume, updateResume }) {
    const items = resume.projects || []
    const [openIndex, setOpenIndex] = useState(items.length > 0 ? 0 : -1)

    function addItem() {
        const updated = [...items, {
            name: '', description: '', technologies: '', url: '', bullets: '',
        }]
        updateResume({ projects: updated })
        setOpenIndex(updated.length - 1)
    }

    function removeItem(index) {
        updateResume({ projects: items.filter((_, i) => i !== index) })
        if (openIndex === index) setOpenIndex(-1)
        else if (openIndex > index) setOpenIndex(openIndex - 1)
    }

    function updateItem(index, field, value) {
        updateResume({
            projects: items.map((item, i) => i === index ? { ...item, [field]: value } : item)
        })
    }

    function moveItem(index, direction) {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= items.length) return
        const updated = [...items]
            ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
        updateResume({ projects: updated })
        setOpenIndex(newIndex)
    }

    return (
        <div>
            <SectionIntro text="Showcase your best projects. Include a link to the repo or demo, and describe the impact and technologies used." />

            <div className="accordion-list">
                {items.map((proj, index) => (
                    <div key={index} className="accordion-item">
                        <div className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                            <div className="accordion-header-left">
                                <span className="accordion-header-title">{proj.name || 'Untitled Project'}</span>
                                <span className="accordion-header-subtitle">{proj.technologies || 'Technologies'}</span>
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
                                    <label>Project Name</label>
                                    <input type="text" placeholder="e.g. E-Commerce Platform" value={proj.name}
                                        onChange={e => updateItem(index, 'name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Technologies</label>
                                    <input type="text" placeholder="e.g. React, Node.js, PostgreSQL" value={proj.technologies}
                                        onChange={e => updateItem(index, 'technologies', e.target.value)} />
                                    <div className="form-hint">Comma-separated list of key technologies</div>
                                </div>
                                <div className="form-group">
                                    <label>Project URL (optional)</label>
                                    <input type="url" placeholder="e.g. https://github.com/username/project" value={proj.url}
                                        onChange={e => updateItem(index, 'url', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Description & Key Highlights</label>
                                    <BulletTextarea
                                        placeholder={"• Built a full-stack e-commerce platform with real-time inventory\n• Implemented payment processing with Stripe API"}
                                        value={proj.bullets}
                                        onChange={val => updateItem(index, 'bullets', val)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button className="add-item-btn" onClick={addItem} style={{ marginTop: '12px' }}>
                + Add Project
            </button>
        </div>
    )
}
