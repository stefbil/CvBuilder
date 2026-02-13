import { useState } from 'react'

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

export default function SkillsForm({ resume, updateResume }) {
    const items = resume.skills || []
    const [openIndex, setOpenIndex] = useState(items.length > 0 ? 0 : -1)

    function addItem() {
        const updated = [...items, { category: '', items: '' }]
        updateResume({ skills: updated })
        setOpenIndex(updated.length - 1)
    }

    function removeItem(index) {
        updateResume({ skills: items.filter((_, i) => i !== index) })
        if (openIndex === index) setOpenIndex(-1)
        else if (openIndex > index) setOpenIndex(openIndex - 1)
    }

    function updateItem(index, field, value) {
        updateResume({
            skills: items.map((item, i) => i === index ? { ...item, [field]: value } : item)
        })
    }

    function moveItem(index, direction) {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= items.length) return
        const updated = [...items]
            ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
        updateResume({ skills: updated })
        setOpenIndex(newIndex)
    }

    return (
        <div>
            <SectionIntro text="Organize your skills by category (e.g. Programming Languages, Frameworks, Tools). List the most relevant skills first." />

            <div className="accordion-list">
                {items.map((skill, index) => (
                    <div key={index} className="accordion-item">
                        <div className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                            <div className="accordion-header-left">
                                <span className="accordion-header-title">{skill.category || 'Untitled Category'}</span>
                                <span className="accordion-header-subtitle">
                                    {skill.items ? skill.items.split(',').length + ' skills' : 'No skills added'}
                                </span>
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
                                    <label>Category Name</label>
                                    <input type="text" placeholder="e.g. Programming Languages" value={skill.category}
                                        onChange={e => updateItem(index, 'category', e.target.value)} />
                                    <div className="form-hint">Group related skills under a meaningful category</div>
                                </div>
                                <div className="form-group">
                                    <label>Skills</label>
                                    <input type="text" placeholder="e.g. Python, JavaScript, TypeScript, Go, Rust" value={skill.items}
                                        onChange={e => updateItem(index, 'items', e.target.value)} />
                                    <div className="form-hint">Separate each skill with a comma</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button className="add-item-btn" onClick={addItem} style={{ marginTop: '12px' }}>
                + Add Skill Category
            </button>
        </div>
    )
}
