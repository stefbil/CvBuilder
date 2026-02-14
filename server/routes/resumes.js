import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth to all resume routes
router.use('/resumes', authMiddleware);

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
router.get('/resumes', async (req, res) => {
    try {
        const resumes = await prisma.resume.findMany({
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' },
            include: { contact: true },
        });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new resume
router.post('/resumes', async (req, res) => {
    try {
        const { title } = req.body;
        const resume = await prisma.resume.create({
            data: {
                title: title || 'Untitled Resume',
                userId: req.userId,
                contact: { create: {} },
            },
            include: fullInclude,
        });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a full resume with all relations (ownership check)
router.get('/resumes/:id', async (req, res) => {
    try {
        const resume = await prisma.resume.findUnique({
            where: { id: req.params.id },
            include: fullInclude,
        });
        if (!resume) return res.status(404).json({ error: 'Resume not found' });
        if (resume.userId !== req.userId) return res.status(403).json({ error: 'Access denied' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auto-save: update a resume and all its relations (ownership check)
router.put('/resumes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Ownership check
        const existing = await prisma.resume.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Resume not found' });
        if (existing.userId !== req.userId) return res.status(403).json({ error: 'Access denied' });

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
        const updated = await prisma.resume.findUnique({
            where: { id },
            include: fullInclude,
        });

        res.json(updated);
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a resume (ownership check)
router.delete('/resumes/:id', async (req, res) => {
    try {
        const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: 'Resume not found' });
        if (existing.userId !== req.userId) return res.status(403).json({ error: 'Access denied' });

        await prisma.resume.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
