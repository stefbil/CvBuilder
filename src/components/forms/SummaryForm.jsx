export default function SummaryForm({ resume, updateResume }) {
    return (
        <div>
            <div className="form-section-intro">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="7" />
                    <path d="M8 5v4M8 11h.01" />
                </svg>
                <span>Write a concise 2-4 sentence summary highlighting your key strengths, years of experience, and what you bring to the role. Tailor it to the job you're applying for.</span>
            </div>

            <div className="form-group">
                <label htmlFor="summary">Professional Summary</label>
                <textarea
                    id="summary"
                    placeholder="e.g. Results-driven software engineer with 5+ years of experience building scalable web applications. Specialized in data process optimization, pipeline automation, and data validation. Seeking to apply engineering rigor to challenging data-driven initiatives within a global organization."
                    value={resume.summary || ''}
                    onChange={e => updateResume({ summary: e.target.value })}
                    rows={6}
                    style={{ minHeight: '140px' }}
                />
                <div className="form-hint">Keep it focused — recruiters spend ~6 seconds scanning each resume</div>
            </div>
        </div>
    )
}
