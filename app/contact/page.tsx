import Image from 'next/image';
import {Metadata} from 'next';
import {
    getPageContent,
    getSiteConfig,
    getSEOConfig
} from '@/src/lib/config/file-manager';
import ContactForm from '@/src/components/contact/contact-form';
import ContactInfo from '@/src/components/contact/contact-info';

// SEO metadata generation
export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();
    const seoConfig = await getSEOConfig();
    const pageContent = await getPageContent('contact');

    const title = pageContent.meta?.title || `Contact Us | ${siteConfig.site?.name}`;
    const description = pageContent.meta?.description || 'Get in touch with us for any inquiries or support needs.';
    const canonical = `${siteConfig.site?.url || ''}/contact`;

    return {
        title,
        description,
        keywords: pageContent.meta?.keywords?.join(', '),
        openGraph: {
            title: pageContent.seo?.og?.title || title,
            description: pageContent.seo?.og?.description || description,
            images: pageContent.seo?.og?.image ? [pageContent.seo.og.image] : [],
            type: 'website',
            siteName: siteConfig.site?.name,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageContent.seo?.twitter?.title || title,
            description: pageContent.seo?.twitter?.description || description,
            images: pageContent.seo?.twitter?.image ? [pageContent.seo.twitter.image] : [],
        },
        alternates: {
            canonical,
        },
    };
}

// Hero Section
async function ContactHero() {
    const content = await getPageContent('contact');
    const hero = content.hero;

    return (
        <section className="relative py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            {hero?.background_image && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={hero.background_image}
                        alt="Contact hero background"
                        fill
                        className="object-cover opacity-20"
                    />
                </div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    {hero?.title || 'Contact Us'}
                </h1>

                <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
                    {hero?.subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
                </p>
            </div>
        </section>
    );
}

// Contact Methods Section
async function ContactMethods() {
    const siteConfig = await getSiteConfig();
    const content = await getPageContent('contact');

    const methods = [
        {
            icon: '📧',
            title: 'Email Us',
            value: siteConfig.site?.email,
            href: `mailto:${siteConfig.site?.email}`,
            description: 'Send us an email anytime'
        },
        {
            icon: '📞',
            title: 'Call Us',
            value: siteConfig.site?.phone,
            href: `tel:${siteConfig.site?.phone}`,
            description: 'Mon-Fri from 8am to 5pm'
        },
        {
            icon: '📍',
            title: 'Visit Us',
            value: siteConfig.company?.address,
            href: content.location?.map_link || '#',
            description: 'Come say hello at our office'
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Get In Touch
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choose the best way to reach us. We're here to help and answer any questions you might have.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {methods.map((method, index) => (
                        method.value && (
                            <div key={index}
                                 className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="text-4xl mb-4">
                                    {method.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {method.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {method.description}
                                </p>
                                <a
                                    href={method.href}
                                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                                >
                                    {method.value}
                                </a>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </section>
    );
}

// Main Contact Form Section
async function ContactFormSection() {
    const content = await getPageContent('contact');

    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            {content.form?.title || 'Send Us a Message'}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {content.form?.description || 'Fill out the form below and we\'ll get back to you as soon as possible.'}
                        </p>

                        <ContactForm/>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:pl-8">
                        <ContactInfo/>
                    </div>
                </div>
            </div>
        </section>
    );
}

// FAQ Section
async function FAQSection() {
    const content = await getPageContent('contact');
    const faqs = content.faq;

    if (!faqs || !Array.isArray(faqs)) return null;

    return (
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600">
                        Quick answers to questions you may have
                    </p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {faq.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Business Hours Section
async function BusinessHoursSection() {
    const content = await getPageContent('contact');
    const hours = content.hours;

    if (!hours) return null;

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    {hours.title || 'Business Hours'}
                </h2>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                    {hours.schedule && (
                        <div className="space-y-3">
                            {Object.entries(hours.schedule).map(([day, time]: [string, any]) => (
                                <div key={day}
                                     className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-900 capitalize">
                    {day}
                  </span>
                                    <span className="text-gray-600">
                    {time}
                  </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {hours.note && (
                        <p className="text-sm text-gray-500 mt-6 italic">
                            {hours.note}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

// Main Contact Page Component
export default async function ContactPage() {
    return (
        <main>
            <ContactHero/>
            <ContactMethods/>
            <ContactFormSection/>
            {/*<MapSection />*/}
            <FAQSection/>
            <BusinessHoursSection/>
        </main>
    );
}