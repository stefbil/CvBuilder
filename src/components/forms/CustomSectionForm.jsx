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

export default function CustomSectionForm({ resume, updateResume, sectionId }) {
    // Find the custom section by its ID
    const customSections = resume.customSections || []
    const sectionIndex = customSections.findIndex(cs => cs.id === sectionId)
    const section = sectionIndex >= 0 ? customSections[sectionIndex] : null

    const [openIndex, setOpenIndex] = useState(0)

    if (!section) {
        return (
            <div>
                <div className="form-section-intro">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="8" r="7" />
                        <path d="M8 5v4M8 11h.01" />
                    </svg>
                    <span>This section could not be found. It may have been deleted.</span>
                </div>
            </div>
        )
    }

    // Parse items from JSON string
    let items = []
    try {
        items = typeof section.items === 'string' ? JSON.parse(section.items) : (section.items || [])
    } catch {
        items = []
    }

    function updateSection(updates) {
        const updatedSections = customSections.map((cs, i) =>
            i === sectionIndex ? { ...cs, ...updates } : cs
        )
        updateResume({ customSections: updatedSections })
    }

    function updateSectionTitle(newTitle) {
        // Also update sectionOrder label (the key stays the same)
        updateSection({ title: newTitle })
    }

    function addItem() {
        const newItems = [...items, { title: '', subtitle: '', date: '', bullets: '' }]
        updateSection({ items: JSON.stringify(newItems) })
        setOpenIndex(newItems.length - 1)
    }

    function removeItem(index) {
        const newItems = items.filter((_, i) => i !== index)
        updateSection({ items: JSON.stringify(newItems) })
        if (openIndex === index) setOpenIndex(-1)
        else if (openIndex > index) setOpenIndex(openIndex - 1)
    }

    function updateItem(index, field, value) {
        const newItems = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        )
        updateSection({ items: JSON.stringify(newItems) })
    }

    function moveItem(index, direction) {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= items.length) return
        const newItems = [...items]
            ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
        updateSection({ items: JSON.stringify(newItems) })
        setOpenIndex(newIndex)
    }

    return (
        <div>
            <SectionIntro text="Customize this section with any content — certifications, awards, volunteering, languages, or anything else relevant to your resume." />

            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Section Title</label>
                <input
                    type="text"
                    placeholder="e.g. Certifications, Awards, Languages"
                    value={section.title}
                    onChange={e => updateSectionTitle(e.target.value)}
                />
                <div className="form-hint">This title is displayed as the section heading on your resume</div>
            </div>

            <div className="accordion-list">
                {items.map((item, index) => (
                    <div key={index} className="accordion-item">
                        <div className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                            <div className="accordion-header-left">
                                <span className="accordion-header-title">{item.title || 'Untitled Entry'}</span>
                                <span className="accordion-header-subtitle">{item.subtitle || item.date || ''}</span>
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
                                    <label>Title</label>
                                    <input type="text" placeholder="e.g. AWS Solutions Architect"
                                        value={item.title}
                                        onChange={e => updateItem(index, 'title', e.target.value)} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Subtitle (optional)</label>
                                        <input type="text" placeholder="e.g. Amazon Web Services"
                                            value={item.subtitle}
                                            onChange={e => updateItem(index, 'subtitle', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date (optional)</label>
                                        <input type="text" placeholder="e.g. March 2024"
                                            value={item.date}
                                            onChange={e => updateItem(index, 'date', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Details (optional)</label>
                                    <BulletTextarea
                                        placeholder={"• Completed advanced certification with distinction"}
                                        value={item.bullets}
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
                + Add Entry
            </button>
        </div>
    )
}
