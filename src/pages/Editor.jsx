import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { saveResume, getResume } from '../utils/api'
import ResumePDF from '../components/ResumePDF'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { User, Briefcase, GraduationCap, FolderGit2, Wrench, FileText, Layers, ArrowLeft, Download, Eye, EyeOff, List, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'
import ContactForm from '../components/forms/ContactForm'
import ExperienceForm from '../components/forms/ExperienceForm'
import EducationForm from '../components/forms/EducationForm'
import ProjectsForm from '../components/forms/ProjectsForm'
import SkillsForm from '../components/forms/SkillsForm'
import SummaryForm from '../components/forms/SummaryForm'
import CustomSectionForm from '../components/forms/CustomSectionForm'
import ResumePreview from '../components/ResumePreview'

const BUILTIN_LABELS = {
    contact: 'Contact',
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    skills: 'Skills',
}

const SECTION_ICONS = {
    contact: User,
    summary: FileText,
    experience: Briefcase,
    education: GraduationCap,
    projects: FolderGit2,
    skills: Wrench,
}

const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'education', 'experience', 'projects']

function generateId() {
    return 'cs_' + Math.random().toString(36).substring(2, 10)
}

export default function Editor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [resume, setResume] = useState(null)
    const [activeTab, setActiveTab] = useState('contact')
    const [saveStatus, setSaveStatus] = useState('saved')
    const [loading, setLoading] = useState(true)
    const [showReorder, setShowReorder] = useState(false)
    const [showPageBreaks, setShowPageBreaks] = useState(false)
    const saveTimerRef = useRef(null)
    const resumeRef = useRef(null)

    useEffect(() => {
        fetchResume()
    }, [id])

    async function fetchResume() {
        try {
            const data = await getResume(id)
            setResume(data)
            resumeRef.current = data
        } catch (err) {
            console.error('Failed to load resume:', err)
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const saveResume = useCallback(async (data) => {
        setSaveStatus('saving')
        try {
            await saveResume(id, data)
            setSaveStatus('saved')
        } catch (err) {
            console.error('Save failed:', err)
            setSaveStatus('unsaved')
        }
    }, [id])

    const debouncedSave = useCallback((newResume) => {
        setSaveStatus('unsaved')
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
            saveResume(newResume)
        }, 800)
    }, [saveResume])

    function updateResume(updates) {
        const updated = { ...resumeRef.current, ...updates }
        resumeRef.current = updated
        setResume({ ...updated })
        debouncedSave(updated)
    }

    // Section order helpers
    const sectionOrder = resume?.sectionOrder
        ? resume.sectionOrder.split(',').map(s => s.trim())
        : DEFAULT_SECTION_ORDER

    const customSections = resume?.customSections || []

    // Resolve a section key to a label
    function getSectionLabel(key) {
        if (BUILTIN_LABELS[key]) return BUILTIN_LABELS[key]
        // It's a custom section — look up by id
        const cs = customSections.find(s => s.id === key)
        return cs?.title || 'Custom Section'
    }

    function moveSectionUp(index) {
        if (index <= 0) return
        const newOrder = [...sectionOrder]
            ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
        updateResume({ sectionOrder: newOrder.join(',') })
    }

    function moveSectionDown(index) {
        if (index >= sectionOrder.length - 1) return
        const newOrder = [...sectionOrder]
            ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
        updateResume({ sectionOrder: newOrder.join(',') })
    }

    function removeSection(key) {
        // Only custom sections can be removed
        const newOrder = sectionOrder.filter(k => k !== key)
        const newCustom = customSections.filter(cs => cs.id !== key)
        updateResume({
            sectionOrder: newOrder.join(','),
            customSections: newCustom,
        })
        if (activeTab === key) setActiveTab('contact')
    }

    function addCustomSection() {
        const newId = generateId()
        const newSection = {
            id: newId,
            title: '',
            items: '[]',
            order: customSections.length,
        }
        const newOrder = [...sectionOrder, newId]
        updateResume({
            customSections: [...customSections, newSection],
            sectionOrder: newOrder.join(','),
        })
        setActiveTab(newId)
    }

    // function handleDownloadPDF() { ... } // Replaced by PDFDownloadLink

    if (loading) {
        return (
            <div className="editor-layout">
                <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>Loading...</div>
            </div>
        )
    }

    if (!resume) return null

    // Build tabs: Contact is always first, then the ordered sections
    const tabs = [
        { id: 'contact', label: 'Contact', Icon: SECTION_ICONS.contact },
        ...sectionOrder.map(key => ({
            id: key,
            label: getSectionLabel(key),
            Icon: SECTION_ICONS[key] || Layers
        })),
    ]

    const isCustomSection = (key) => !BUILTIN_LABELS[key]

    const renderForm = () => {
        const props = { resume, updateResume }
        switch (activeTab) {
            case 'contact': return <ContactForm {...props} />
            case 'experience': return <ExperienceForm {...props} />
            case 'education': return <EducationForm {...props} />
            case 'projects': return <ProjectsForm {...props} />
            case 'skills': return <SkillsForm {...props} />
            case 'summary': return <SummaryForm {...props} />
            default:
                // Custom section
                return <CustomSectionForm {...props} sectionId={activeTab} />
        }
    }

    return (
        <div className="editor-layout">
            {/* Left: Form Panel */}
            <div className="editor-sidebar">
                <div className="editor-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="btn-icon"
                            onClick={() => navigate('/')}
                            title="Back to dashboard"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <span className="editor-toolbar-title">{resume.title}</span>
                    </div>
                    <div className="editor-toolbar-actions">
                        <span className={`save-indicator ${saveStatus === 'saving' ? 'saving' : ''} `}>
                            {saveStatus === 'saved' && '✓ Saved'}
                            {saveStatus === 'saving' && '⟳ Saving...'}
                            {saveStatus === 'unsaved' && '● Unsaved'}
                        </span>
                        <button
                            className="btn-icon"
                            onClick={() => setShowPageBreaks(!showPageBreaks)}
                            title="Toggle Page Breaks"
                            style={showPageBreaks ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                        >
                            {showPageBreaks ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                            className="btn-icon"
                            onClick={() => setShowReorder(!showReorder)}
                            title="Reorder sections"
                            style={showReorder ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                        >
                            <List size={18} />
                        </button>

                        <PDFDownloadLink
                            document={<ResumePDF resume={resume} />}
                            fileName={`${resume.contact?.firstName || 'Resume'}_${resume.contact?.lastName || ''}.pdf`}
                            className="btn btn-primary"
                            style={{ textDecoration: 'none', color: 'white' }}
                        >
                            {({ blob, url, loading, error }) => (
                                <div className="flex items-center gap-2">
                                    <Download size={16} />
                                    <span>{loading ? 'Preparing...' : 'PDF'}</span>
                                </div>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>

                {/* Section Reorder Panel */}
                {showReorder && (
                    <div className="section-reorder-panel">
                        <div className="section-reorder-header">
                            <span>Section Order</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reorder or remove sections</span>
                        </div>
                        {sectionOrder.map((key, index) => (
                            <div key={key} className="section-reorder-item">
                                <span className="section-reorder-label">
                                    <div className="text-muted-foreground">
                                        {/* Simple dot grid icon replacement */}
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: 0.5 }}>
                                            <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
                                            <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
                                            <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
                                        </svg>
                                    </div>
                                    {getSectionLabel(key)}
                                    {isCustomSection(key) && (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>custom</span>
                                    )}
                                </span>
                                <div className="section-reorder-actions">
                                    <button
                                        className="btn-icon"
                                        style={{ width: '24px', height: '24px', border: 'none' }}
                                        onClick={() => moveSectionUp(index)}
                                        disabled={index === 0}
                                        title="Move up"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        style={{ width: '24px', height: '24px', border: 'none' }}
                                        onClick={() => moveSectionDown(index)}
                                        disabled={index === sectionOrder.length - 1}
                                        title="Move down"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                    {isCustomSection(key) && (
                                        <button
                                            className="btn-icon"
                                            style={{ width: '24px', height: '24px', border: 'none', color: 'var(--danger)' }}
                                            onClick={() => removeSection(key)}
                                            title="Delete section"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            className="add-item-btn"
                            onClick={addCustomSection}
                            style={{ marginTop: '8px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Plus size={16} /> Add Custom Section
                        </button>
                    </div>
                )}

                <div className="editor-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`editor-tab ${activeTab === tab.id ? 'active' : ''} `}
                            onClick={() => setActiveTab(tab.id)}
                            title={tab.label}
                        >
                            {tab.Icon && <tab.Icon size={16} />}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="form-panel">
                    {renderForm()}
                </div>
            </div>

            {/* Right: Live Preview */}
            <div className="preview-pane">
                <div className="preview-container">
                    <ResumePreview resume={resume} showPageBreaks={showPageBreaks} />
                </div>
            </div>
        </div>
    )
}
