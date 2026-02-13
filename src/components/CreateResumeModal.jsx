import { useState } from 'react'

export default function CreateResumeModal({ onClose, onCreated }) {
    const [title, setTitle] = useState('')
    const [creating, setCreating] = useState(false)

    async function handleCreate(e) {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await fetch('/api/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title || 'Untitled Resume' }),
            })
            const data = await res.json()
            onCreated(data)
        } catch (err) {
            console.error('Failed to create:', err)
            setCreating(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Create New Resume</h2>
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label htmlFor="resume-title">Resume Title</label>
                        <input
                            id="resume-title"
                            type="text"
                            placeholder="e.g. Frontend Developer Resume"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? 'Creating...' : 'Create Resume'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
