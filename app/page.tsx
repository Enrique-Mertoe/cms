import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  getPageContent,
  getSiteConfig,
  getSEOConfig,
  getComponentContent
} from '@/src/lib/config/file-manager';

// Import custom components
import SiteHeader from '@/src/components/layout/header';
import Carousel from '@/src/components/home/carousel';
import TechInitiatives from '@/src/components/home/tech-initiatives';
import Courses from '@/src/components/home/courses';
import Services from '@/src/components/home/services';

// SEO metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const seoConfig = await getSEOConfig();
  const pageContent = await getPageContent('home');

  const title = pageContent.meta?.title || seoConfig.global?.default_title || siteConfig.site?.name;
  const description = pageContent.meta?.description || seoConfig.global?.default_description;
  const canonical = `${siteConfig.site?.url || ''}`;

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

// Carousel Section Component
async function CarouselSection() {
  const content = await getPageContent('home');
  const carouselItems = content.carousel;

  if (!carouselItems || !Array.isArray(carouselItems) || carouselItems.length === 0) {
    return null;
  }

  return <Carousel items={carouselItems} />;
}

// About Preview Section
async function AboutPreviewSection() {
  const content = await getPageContent('home');
  const about = content.about_preview;

  if (!about) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {about.title}
            </h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-4">
              {about.content?.split('\n').map((paragraph: string, index: number) => (
                paragraph.trim() && (
                  <p key={index}>{paragraph.trim()}</p>
                )
              ))}
            </div>
            {about.cta_text && about.cta_link && (
              <Link
                href={about.cta_link}
                className="inline-block mt-6 text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
              >
                {about.cta_text} →
              </Link>
            )}
          </div>

          {about.image && (
            <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={about.image}
                alt={about.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Tech Initiatives Section
async function TechInitiativesSection() {
  const content = await getPageContent('home');
  const techInitiatives = content.tech_initiatives;

  if (!techInitiatives || !techInitiatives.items || !Array.isArray(techInitiatives.items)) {
    return null;
  }

  return (
    <TechInitiatives 
      title={techInitiatives.title || 'Our Tech Initiatives'} 
      subtitle={techInitiatives.subtitle}
      initiatives={techInitiatives.items}
    />
  );
}

// Courses Section
async function CoursesSection() {
  const content = await getPageContent('home');
  const coursesData = content.courses;

  if (!coursesData || !coursesData.items || !Array.isArray(coursesData.items)) {
    return null;
  }

  return (
    <Courses 
      title={coursesData.title || 'Our Courses'} 
      subtitle={coursesData.subtitle}
      courses={coursesData.items}
    />
  );
}

// Services Section
async function ServicesSection() {
  const content = await getPageContent('home');
  const servicesData = content.services;

  if (!servicesData || !servicesData.items || !Array.isArray(servicesData.items)) {
    return null;
  }

  return (
    <Services 
      title={servicesData.title || 'Our Services'} 
      subtitle={servicesData.subtitle}
      services={servicesData.items}
    />
  );
}

// Testimonials Section
async function TestimonialsSection() {
  const testimonials = await getComponentContent('testimonials');

  if (!testimonials.testimonials || !Array.isArray(testimonials.testimonials)) {
    return null;
  }

  const displayCount = testimonials.settings?.display_count || 3;
  const displayedTestimonials = testimonials.testimonials.slice(0, displayCount);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {testimonials.settings?.title || 'What Our Clients Say'}
          </h2>
          {testimonials.settings?.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {testimonials.settings.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedTestimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                {testimonial.image && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.position} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Call to Action Section
async function CTASection() {
  const siteConfig = await getSiteConfig();

  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
          Contact us today to discuss your project and see how we can help your business grow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="bg-yellow-500 text-black px-8 py-4 rounded-md font-semibold hover:bg-yellow-400 transition-colors duration-300"
          >
            Get In Touch
          </Link>

          {siteConfig.site?.phone && (
            <a
              href={`tel:${siteConfig.site.phone}`}
              className="border-2 border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white hover:text-black transition-colors duration-300"
            >
              Call {siteConfig.site.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// Stats Section
async function StatsSection() {
  const content = await getPageContent('home');
  const stats = content.stats;

  if (!stats || !stats.items || !Array.isArray(stats.items)) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {stats.title || 'Our Impact'}
          </h2>
          {stats.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {stats.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.items.map((stat: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-700 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16"> {/* Add padding top to account for fixed header */}
        <CarouselSection />
        <AboutPreviewSection />
        <TechInitiativesSection />
        <CoursesSection />
        <ServicesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </>
  );
}
