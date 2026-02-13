import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper: include all resume relations
const fullInclude = {
    contact: true,
    experience: { orderBy: { order: 'asc' } },
    projects: { orderBy: { order: 'asc' } },
    education: { orderBy: { order: 'asc' } },
    skills: { orderBy: { order: 'asc' } },
    customSections: { orderBy: { order: 'asc' } },
};

// List all resumes for the authenticated user
router.get('/resumes', authenticateToken, async (req, res) => {
    try {
        const resumes = await prisma.resume.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            include: { contact: true },
        });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new resume
router.post('/resumes', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        const resume = await prisma.resume.create({
            data: {
                title: title || 'Untitled Resume',
                userId: req.user.id,
                contact: { create: {} },
            },
            include: fullInclude,
        });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a full resume (ensure ownership)
router.get('/resumes/:id', authenticateToken, async (req, res) => {
    try {
        const resume = await prisma.resume.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: fullInclude,
        });
        if (!resume) return res.status(404).json({ error: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a resume (ensure ownership)
router.put('/resumes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Ownership check
        const existing = await prisma.resume.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.status(404).json({ error: 'Resume not found' });

        const { title, summary, templateId, sectionOrder, contact, experience, projects, education, skills, customSections } = req.body;

        // Update main resume fields
        await prisma.resume.update({
            where: { id },
            data: {
                title: title || 'Untitled Resume',
                summary: summary || '',
                templateId: templateId || 'standard',
                sectionOrder: sectionOrder || 'summary,skills,education,experience,projects',
            },
        });

        // Upsert contact
        if (contact) {
            await prisma.contact.upsert({
                where: { resumeId: id },
                update: {
                    firstName: contact.firstName || '',
                    lastName: contact.lastName || '',
                    email: contact.email || '',
                    phone: contact.phone || '',
                    linkedin: contact.linkedin || '',
                    website: contact.website || '',
                    country: contact.country || '',
                    city: contact.city || '',
                },
                create: {
                    resumeId: id,
                    firstName: contact.firstName || '',
                    lastName: contact.lastName || '',
                    email: contact.email || '',
                    phone: contact.phone || '',
                    linkedin: contact.linkedin || '',
                    website: contact.website || '',
                    country: contact.country || '',
                    city: contact.city || '',
                },
            });
        }

        // Sync experience items
        if (experience) {
            await prisma.experience.deleteMany({ where: { resumeId: id } });
            if (experience.length > 0) {
                await prisma.experience.createMany({
                    data: experience.map((exp, i) => ({
                        resumeId: id,
                        role: exp.role || '',
                        company: exp.company || '',
                        location: exp.location || '',
                        startDate: exp.startDate || '',
                        endDate: exp.endDate || '',
                        isCurrent: exp.isCurrent || false,
                        bullets: exp.bullets || '',
                        order: i,
                    })),
                });
            }
        }

        // Sync projects
        if (projects) {
            await prisma.project.deleteMany({ where: { resumeId: id } });
            if (projects.length > 0) {
                await prisma.project.createMany({
                    data: projects.map((proj, i) => ({
                        resumeId: id,
                        name: proj.name || '',
                        description: proj.description || '',
                        technologies: proj.technologies || '',
                        url: proj.url || '',
                        bullets: proj.bullets || '',
                        order: i,
                    })),
                });
            }
        }

        // Sync education
        if (education) {
            await prisma.education.deleteMany({ where: { resumeId: id } });
            if (education.length > 0) {
                await prisma.education.createMany({
                    data: education.map((edu, i) => ({
                        resumeId: id,
                        degree: edu.degree || '',
                        school: edu.school || '',
                        location: edu.location || '',
                        startDate: edu.startDate || '',
                        endDate: edu.endDate || '',
                        gpa: edu.gpa || '',
                        bullets: edu.bullets || '',
                        order: i,
                    })),
                });
            }
        }

        // Sync skills
        if (skills) {
            await prisma.skill.deleteMany({ where: { resumeId: id } });
            if (skills.length > 0) {
                await prisma.skill.createMany({
                    data: skills.map((skill, i) => ({
                        resumeId: id,
                        category: skill.category || '',
                        items: skill.items || '',
                        order: i,
                    })),
                });
            }
        }

        // Sync custom sections
        if (customSections) {
            await prisma.customSection.deleteMany({ where: { resumeId: id } });
            for (let i = 0; i < customSections.length; i++) {
                const cs = customSections[i];
                await prisma.customSection.create({
                    data: {
                        id: cs.id,
                        resumeId: id,
                        title: cs.title || '',
                        items: typeof cs.items === 'string' ? cs.items : JSON.stringify(cs.items || []),
                        order: i,
                    },
                });
            }
        }

        // Return the updated resume
        const updated = await prisma.resume.findFirst({
            where: { id, userId: req.user.id },
            include: fullInclude,
        });

        res.json(updated);
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a resume (ensure ownership)
router.delete('/resumes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await prisma.resume.deleteMany({
            where: { id, userId: req.user.id }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Resume not found or not authorized' });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate PDF (Public access - resumes should be generating based on ID, but ideally protected or using a signed URL. 
// For now, keeping public access to simplify print view logic, or we can require token if print view sends it)
// Let's keep PDF generation protected for now, but the print view page might need the token.
// Actually, the print view is a frontend route. Puppeteer visits the frontend.
// The frontend print view needs to fetch data. If we protect the GET route, Puppeteer needs a way to auth.
// Simplest solution for this phase: Allow PDF generation route to be protected (user requests it), 
// but the underlying data fetch for print view might need a special unauthed endpoint or token passing.
// Given Puppeteer runs on server, we can bypass network and inject data, or use a "rendering token".
// 
// BETTER APPROACH FOR MVP:
// 1. The /pdf endpoint is protected (so only owner can request PDF).
// 2. Puppeteer sets an auth cookie or header when visiting the page.
//    OR: We create a temporary /public/resumes/:id endpoint for the printer? No, security risk.
// 
// Let's stick to the simplest working model:
// The /pdf endpoint is protected.
// Puppeteer launches browser.
// We can pass the Resume Data directly to the print template? No, it's a URL visit.
// 
// Alternative: Puppeteer visits a local file or we inject a script.
// 
// Decision: Let's modify the /pdf route to fetch the resume data securely on the server (we already have req.user),
// and then inject that data into the page via Puppeteer's `evaluate`, eliminating the need for the page to fetch it.
// This is robust.
// 
// I will implement this injection strategy in the replacement content.

router.get('/resumes/:id/pdf', authenticateToken, async (req, res) => {
    try {
        // Fetch resume data securely first
        const resume = await prisma.resume.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: fullInclude
        });

        if (!resume) return res.status(404).json({ error: 'Resume not found' });

        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
            ],
        });

        const port = process.env.PORT || 5173;
        const baseUrl = process.env.NODE_ENV === 'production'
            ? `http://localhost:${port}`
            : 'http://localhost:5173';

        const page = await browser.newPage();

        // Navigate to the print page
        await page.goto(`${baseUrl}/print/${req.params.id}?print=true`, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        // INJECT DATA: The frontend needs to support receiving data via window object to avoid fetch if present.
        // We will modify the frontend PrintView to check window.__RESUME_DATA__
        await page.evaluate((data) => {
            window.__RESUME_DATA__ = data;
            // Trigger a re-render or event if needed, but if we do this before hydration it might be tricky.
            // Actually, best to go to a special "render" route or just rely on the standard fetch if we can pass the token.
            // Passing token via URL param `?token=...` is easiest for Puppeteer.
        }, resume);

        // Wait for potential re-render
        await new Promise(r => setTimeout(r, 500));
        await page.waitForSelector('.a4-page', { timeout: 10000 });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="resume.pdf"`,
            'Content-Length': pdf.length,
        });
        res.send(pdf);
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
    }
});

export default router;
