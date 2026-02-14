
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Svg, Path, Circle, Rect, Line, Font } from '@react-pdf/renderer';

// Register a font if needed, otherwise use Helvetica
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' }, // Fallback or use standard
    ]
});

// Styles translated from resume.css
const styles = StyleSheet.create({
    page: {
        padding: 30, // ~10mm
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#333',
        backgroundColor: '#ffffff', // Ensure white background
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontFamily: 'Times-Roman',
        fontWeight: 'bold',
        color: '#1a5276', // Dark Navy
        marginBottom: 5,
    },
    contactLine: {
        flexDirection: 'row',
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        // gap: 4, // Removed to rely on separator margins and avoid assymetry
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        marginHorizontal: 6, // Added spacing between items
    },
    contactText: {
        fontSize: 7, // Small enough for single line
        color: '#555',
    },
    link: {
        textDecoration: 'none',
        color: '#555',
    },
    icon: {
        width: 9, // Reduced from 10
        height: 9, // Reduced from 10
        marginRight: 3, // Reduced from 4
        color: '#1a5276', // Match name color
        // Ensure icon is centered vertically with text
        marginTop: 0,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1a5276',
        borderBottomWidth: 1.5,
        borderBottomColor: '#1a5276',
        textTransform: 'uppercase',
        paddingBottom: 2,
        marginBottom: 8,
        letterSpacing: 1,
    },
    entry: {
        marginBottom: 8,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    entryTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    entryDate: {
        fontSize: 9,
        fontStyle: 'italic', // Helvetica-Oblique
        color: '#666',
    },
    entrySubtitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    entryOrg: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#444',
    },
    entryLocation: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#666',
    },
    bullets: {
        marginLeft: 10,
    },
    bullet: {
        flexDirection: 'row',
        marginBottom: 1,
    },
    bulletPoint: {
        width: 10,
        fontSize: 10,
        color: '#333',
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        color: '#333',
    },
    skillsList: {
        flexDirection: 'column',
    },
    skillRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    skillCategory: {
        fontWeight: 'bold',
        width: 80,
        fontSize: 9,
    },
    skillItems: {
        flex: 1,
        fontSize: 9,
    },
});

// Icons (converted to react-pdf Svg)
const Icons = {
    location: (
        <Svg viewBox="0 0 24 24" style={styles.icon}>
            <Path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
        </Svg>
    ),
    email: (
        <Svg viewBox="0 0 24 24" style={styles.icon}>
            <Rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <Path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M22 7l-10 7L2 7" />
        </Svg>
    ),
    phone: (
        <Svg viewBox="0 0 24 24" style={styles.icon}>
            <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <Line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" />
        </Svg>
    ),
    linkedin: (
        <Svg viewBox="0 0 24 24" style={styles.icon}>
            <Path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <Rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
            <Circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
        </Svg>
    ),
    website: (
        <Svg viewBox="0 0 24 24" style={styles.icon}>
            <Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <Line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
            <Path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </Svg>
    ),
};

const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'education', 'experience', 'projects'];
const BUILTIN_SECTIONS = ['summary', 'skills', 'education', 'experience', 'projects'];

function parseBullets(text) {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim()).map(line => line.replace(/^[\s•\-*]+/, '').trim()).filter(Boolean);
}

export default function ResumePDF({ resume }) {
    const contact = resume.contact || {};
    const experiences = resume.experience || [];
    const projects = resume.projects || [];
    const education = resume.education || [];
    const skills = resume.skills || [];
    const summary = resume.summary || '';
    const customSections = resume.customSections || [];
    const sectionOrder = resume.sectionOrder ? resume.sectionOrder.split(',').map(s => s.trim()) : DEFAULT_SECTION_ORDER;

    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');

    const contactItems = [];
    if (contact.city || contact.country) contactItems.push({ text: [contact.city, contact.country].filter(Boolean).join(', '), icon: 'location' });
    if (contact.email) contactItems.push({ text: contact.email, type: 'email', icon: 'email' });
    if (contact.phone) contactItems.push({ text: contact.phone, icon: 'phone' });
    if (contact.linkedin) contactItems.push({ text: contact.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: contact.linkedin, type: 'link', icon: 'linkedin' });
    if (contact.website) contactItems.push({ text: contact.website.replace(/^https?:\/\/(www\.)?/, ''), href: contact.website, type: 'link', icon: 'website' });

    const renderSummary = () => summary && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={{ fontSize: 9 }}>{summary}</Text>
        </View>
    );

    const renderExperience = () => experiences.length > 0 && experiences.some(e => e.role || e.company) && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experiences.filter(e => e.role || e.company).map((exp, i) => (
                <View key={i} style={styles.entry}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{exp.role}</Text>
                        <Text style={styles.entryDate}>{exp.startDate}{exp.startDate && exp.endDate && ' — '}{exp.endDate}</Text>
                    </View>
                    <View style={styles.entrySubtitle}>
                        <Text style={styles.entryOrg}>{exp.company}</Text>
                        <Text style={styles.entryLocation}>{exp.location}</Text>
                    </View>
                    {exp.bullets && parseBullets(exp.bullets).map((bullet, j) => (
                        <View key={j} style={styles.bullet}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    const renderProjects = () => projects.length > 0 && projects.some(p => p.name) && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.filter(p => p.name).map((proj, i) => (
                <View key={i} style={styles.entry}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{proj.name}</Text>
                        <Text style={styles.entryDate}>{proj.technologies}</Text>
                    </View>
                    {proj.url && <Link src={proj.url} style={{ fontSize: 8, color: '#1a5276', marginBottom: 2 }}>{proj.url}</Link>}
                    {proj.bullets && parseBullets(proj.bullets).map((bullet, j) => (
                        <View key={j} style={styles.bullet}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    const renderEducation = () => education.length > 0 && education.some(e => e.degree || e.school) && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.filter(e => e.degree || e.school).map((edu, i) => (
                <View key={i} style={styles.entry}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{edu.degree}</Text>
                        <Text style={styles.entryDate}>{edu.startDate}{edu.startDate && edu.endDate && ' — '}{edu.endDate}</Text>
                    </View>
                    <View style={styles.entrySubtitle}>
                        <Text style={styles.entryOrg}>{edu.school}</Text>
                        <Text style={styles.entryLocation}>{edu.location}</Text>
                    </View>
                    {edu.gpa && <Text style={{ fontSize: 8.5, color: '#444' }}>GPA: {edu.gpa}</Text>}
                    {edu.bullets && parseBullets(edu.bullets).map((bullet, j) => (
                        <View key={j} style={styles.bullet}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    const renderSkills = () => skills.length > 0 && skills.some(s => s.category || s.items) && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsList}>
                {skills.filter(s => s.category || s.items).map((skill, i) => (
                    <View key={i} style={styles.skillRow}>
                        <Text style={styles.skillCategory}>{skill.category}:</Text>
                        <Text style={styles.skillItems}>{skill.items}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderCustomSection = (id) => {
        const cs = customSections.find(s => s.id === id);
        if (!cs || !cs.title) return null;
        let items = [];
        try { items = typeof cs.items === 'string' ? JSON.parse(cs.items) : (cs.items || []); } catch { items = []; }
        const validItems = items.filter(item => item.title || item.subtitle || item.bullets);
        if (validItems.length === 0 && !cs.title) return null;

        return (
            <View key={id} style={styles.section}>
                <Text style={styles.sectionTitle}>{cs.title}</Text>
                {validItems.map((item, i) => (
                    <View key={i} style={styles.entry}>
                        {(item.title || item.date) && (
                            <View style={styles.entryHeader}>
                                <Text style={styles.entryTitle}>{item.title}</Text>
                                <Text style={styles.entryDate}>{item.date}</Text>
                            </View>
                        )}
                        {item.subtitle && (
                            <View style={styles.entrySubtitle}>
                                <Text style={styles.entryOrg}>{item.subtitle}</Text>
                            </View>
                        )}
                        {item.bullets && parseBullets(item.bullets).map((bullet, j) => (
                            <View key={j} style={styles.bullet}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.bulletText}>{bullet}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    const renderers = {
        summary: renderSummary,
        experience: renderExperience,
        projects: renderProjects,
        education: renderEducation,
        skills: renderSkills,
    };

    return (
        <Document title={`${fullName} Resume`} author={fullName}>
            <Page size="A4" style={styles.page}>
                {fullName && (
                    <View style={styles.header}>
                        <Text style={styles.name}>{fullName}</Text>
                        <View style={styles.contactLine}>
                            {contactItems.map((item, i) => (
                                <View key={i} style={styles.contactItem}>
                                    {Icons[item.icon]}
                                    {item.type === 'link' ? (
                                        <Link src={item.href} style={styles.link}>{item.text}</Link>
                                    ) : item.type === 'email' ? (
                                        <Link src={`mailto:${item.text}`} style={styles.link}>{item.text}</Link>
                                    ) : (
                                        <Text style={styles.contactText}>{item.text}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {sectionOrder.map(key => {
                    if (BUILTIN_SECTIONS.includes(key)) return renderers[key] ? renderers[key]() : null;
                    return renderCustomSection(key);
                })}
            </Page>
        </Document>
    );
}
