import {Metadata} from 'next';
import Image from 'next/image';
import {getPageContent, getSiteConfig, getSEOConfig} from '@/src/lib/config/file-manager';
import {Session as Ses, User as Usr} from "next-auth";

type User = Usr & {
    role: string
}

type Session = Ses & {
    user: User
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
    const pageContent = await getPageContent('about');
    const siteConfig = await getSiteConfig();
    const seoConfig = await getSEOConfig();

    const title = pageContent.seo?.title || `About Us | ${siteConfig.site?.name}`;
    const description = pageContent.seo?.description || pageContent.meta?.description || siteConfig.site?.description;

    return {
        title,
        description,
        keywords: pageContent.seo?.keywords || pageContent.meta?.keywords,
        openGraph: {
            title: pageContent.seo?.og?.title || title,
            description: pageContent.seo?.og?.description || description,
            images: pageContent.seo?.og?.image ? [pageContent.seo.og.image] : undefined,
            type: 'article',
            url: pageContent.seo?.canonical || `${siteConfig.site?.url}/about`,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageContent.seo?.twitter?.title || title,
            description: pageContent.seo?.twitter?.description || description,
            images: pageContent.seo?.twitter?.image ? [pageContent.seo.twitter.image] : undefined,
        },
        alternates: {
            canonical: pageContent.seo?.canonical || `${siteConfig.site?.url}/about`,
        },
    };
}

export default async function AboutPage() {
    const content = await getPageContent('about');
    const siteConfig = await getSiteConfig();

    // Fallback content if TOML file doesn't exist or is empty
    const pageData = {
        hero: {
            title: content.hero?.title || 'About Our Company',
            subtitle: content.hero?.subtitle || 'Learn more about our story and mission',
            background_image: content.hero?.background_image || '/images/about-hero.jpg',
        },
        story: {
            title: content.story?.title || 'Our Story',
            content: content.story?.content || 'We are a dedicated team committed to delivering exceptional results.',
            image: content.story?.image || '/images/about-story.jpg',
            founded: content.story?.founded || siteConfig.company?.founded || new Date().getFullYear(),
        },
        mission: {
            title: content.mission?.title || 'Our Mission',
            content: content.mission?.content || 'To provide outstanding service and create lasting value for our clients.',
        },
        values:
        // content.values ||
            [
                {
                    title: 'Quality',
                    description: 'We deliver exceptional quality in everything we do.',
                    icon: 'star',
                },
                {
                    title: 'Innovation',
                    description: 'We embrace new ideas and cutting-edge solutions.',
                    icon: 'lightbulb',
                },
                {
                    title: 'Integrity',
                    description: 'We conduct business with honesty and transparency.',
                    icon: 'shield',
                },
            ],
        team_preview: {
            title: content.team_preview?.title || 'Meet Our Team',
            description: content.team_preview?.description || 'The talented individuals behind our success.',
            cta_text: content.team_preview?.cta_text || 'View Full Team',
            cta_link: content.team_preview?.cta_link || '/team',
        },
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                className="relative h-96 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {pageData.hero.background_image && (
                    <div className="absolute inset-0">
                        <Image
                            src={pageData.hero.background_image}
                            alt="About us hero"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/50"/>
                    </div>
                )}
                <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {pageData.hero.title}
                    </h1>
                    <p className="text-xl md:text-2xl opacity-90">
                        {pageData.hero.subtitle}
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                {pageData.story.title}
                            </h2>
                            <div className="prose prose-lg text-gray-600 mb-6">
                                {pageData.story.content.split('\n').map((paragraph: any, index: any) => (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Founded in {pageData.story.founded}</span>
                                <span>•</span>
                                <span>{siteConfig.company?.name || 'Our Company'}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <Image
                                src={pageData.story.image}
                                alt="Our story"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                        {pageData.mission.title}
                    </h2>
                    <div className="prose prose-xl text-gray-600 mx-auto">
                        {pageData.mission.content.split('\n').map((paragraph: any, index: any) => (
                            <p key={index} className="mb-4">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600">
                            The principles that guide everything we do
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pageData.values.map((value, index) => (
                            <div key={index}
                                 className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div
                                    className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {/* Simple icon representation */}
                                    <div className="w-8 h-8 bg-white rounded opacity-80"></div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Preview Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {pageData.team_preview.title}
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        {pageData.team_preview.description}
                    </p>
                    <a
                        href={pageData.team_preview.cta_link}
                        className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {pageData.team_preview.cta_text}
                    </a>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="py-16 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Work With Us?
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        Let's discuss how we can help bring your vision to life.
                    </p>
                    <div className="space-x-4">
                        <a
                            href="/contact"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Get In Touch
                        </a>
                        <a
                            href="/services"
                            className="inline-block border border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Our Services
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}