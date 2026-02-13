import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateResumeModal from '../components/CreateResumeModal'

export default function Dashboard() {
    const [resumes, setResumes] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchResumes()
    }, [])

    async function fetchResumes() {
        try {
            const res = await fetch('/api/resumes')
            const data = await res.json()
            setResumes(data)
        } catch (err) {
            console.error('Failed to fetch resumes:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(e, id) {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this resume?')) return
        try {
            await fetch(`/api/resumes/${id}`, { method: 'DELETE' })
            setResumes(prev => prev.filter(r => r.id !== id))
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    function getDisplayName(resume) {
        if (resume.contact?.firstName || resume.contact?.lastName) {
            return `${resume.contact.firstName} ${resume.contact.lastName}`.trim()
        }
        return resume.title
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">My Resumes</h1>
                    <p className="dashboard-subtitle">
                        {resumes.length} resume{resumes.length !== 1 ? 's' : ''} created
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="3" x2="8" y2="13" />
                        <line x1="3" y1="8" x2="13" y2="8" />
                    </svg>
                    New Resume
                </button>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p className="empty-state-text">Loading...</p>
                </div>
            ) : resumes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <h2 className="empty-state-title">No resumes yet</h2>
                    <p className="empty-state-text">Create your first resume to get started</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Create Resume
                    </button>
                </div>
            ) : (
                <div className="resume-grid">
                    {resumes.map(resume => (
                        <div
                            key={resume.id}
                            className="resume-card"
                            onClick={() => navigate(`/editor/${resume.id}`)}
                        >
                            <div className="resume-card-actions">
                                <button
                                    className="btn-icon danger"
                                    onClick={(e) => handleDelete(e, resume.id)}
                                    title="Delete resume"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 3.5h10M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M11 3.5l-.5 8a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5L3 3.5" />
                                    </svg>
                                </button>
                            </div>
                            <h3 className="resume-card-title">{getDisplayName(resume)}</h3>
                            <p className="resume-card-meta">
                                Last edited {formatDate(resume.updatedAt)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <CreateResumeModal
                    onClose={() => setShowModal(false)}
                    onCreated={(resume) => {
                        setShowModal(false)
                        navigate(`/editor/${resume.id}`)
                    }}
                />
            )}
        </div>
    )
}
