import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ResumePreview from '../components/ResumePreview'

/**
 * Print-only view used by Puppeteer to generate PDFs.
 * Renders only the ResumePreview component with no app chrome.
 */
export default function PrintView() {
    const { id } = useParams()
    const [resume, setResume] = useState(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/resumes/${id}`)
                const data = await res.json()
                setResume(data)
            } catch (err) {
                console.error('Failed to load resume for print:', err)
            }
        }
        load()
    }, [id])

    if (!resume) {
        return <div style={{ padding: '40px', color: '#999' }}>Loading...</div>
    }

    return (
        <div style={{ background: 'white', minHeight: '100vh' }}>
            <ResumePreview resume={resume} />
        </div>
    )
}
