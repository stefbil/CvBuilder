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
            // Check for injected data (from Puppeteer)
            if (window.__RESUME_DATA__) {
                setResume(window.__RESUME_DATA__)
                return
            }

            try {
                // Try fetching - this might fail if protected and no token, 
                // but currently PrintView is public-ish or we can pass token in URL if needed.
                // For now, let's try standard fetch.
                const res = await fetch(`/api/resumes/${id}`)
                if (!res.ok) throw new Error('Resume not found')
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
