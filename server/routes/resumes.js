import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all resume routes
router.use(authenticateToken);

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
router.get('/', async (req, res) => {
    try {
        const resumes = await prisma.resume.findMany({
            where: { userId: req.user.userId },
            orderBy: { updatedAt: 'desc' },
            include: { contact: true },
        });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new resume
router.post('/', async (req, res) => {
    try {
        console.log('POST /resumes body:', req.body);
        const { title } = req.body;
        console.log('Creating resume with title:', title);
        const resume = await prisma.resume.create({
            data: {
                userId: req.user.userId,
                title: title || 'Untitled Resume',
                contact: { create: {} },
            },
            include: fullInclude,
        });
        console.log('Resume created:', resume.id);
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a full resume with all relations
router.get('/:id', async (req, res) => {
    try {
        const resume = await prisma.resume.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            },
            include: fullInclude,
        });
        if (!resume) return res.status(404).json({ error: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auto-save: update a resume and all its relations
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, summary, templateId, sectionOrder, contact, experience, projects, education, skills, customSections } = req.body;

        // Verify ownership
        const existing = await prisma.resume.findFirst({
            where: { id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'Resume not found' });

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
            where: { id, userId: req.user.userId },
            include: fullInclude,
        });

        res.json(updated);
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a resume
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await prisma.resume.deleteMany({
            where: { id, userId: req.user.userId }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate PDF
router.get('/resumes/:id/pdf', async (req, res) => {
    try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(`http://localhost:5173/print/${req.params.id}`, {
            waitUntil: 'networkidle0',
            timeout: 15000,
        });

        // Wait for the resume to render
        await page.waitForSelector('.a4-page', { timeout: 10000 });

        // Small delay for fonts to load
        await new Promise(r => setTimeout(r, 500));

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
