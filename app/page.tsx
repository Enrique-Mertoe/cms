import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  getPageContent,
  getSiteConfig,
  getSEOConfig,
  getComponentContent
} from '@/src/lib/config/file-manager';

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

// Hero Section Component
async function HeroSection() {
  const content = await getPageContent('home');
  const hero = content.hero;

  if (!hero) return null;

  return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        {hero.background_image && (
            <div className="absolute inset-0 z-0">
              <Image
                  src={hero.background_image}
                  alt="Hero background"
                  fill
                  className="object-cover opacity-30"
                  priority
              />
            </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {hero.title}
          </h1>

          {hero.subtitle && (
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
                {hero.subtitle}
              </p>
          )}

          {hero.cta_text && hero.cta_link && (
              <Link
                  href={hero.cta_link}
                  className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {hero.cta_text}
              </Link>
          )}
        </div>
      </section>
  );
}

// About Preview Section
async function AboutPreviewSection() {
  const content = await getPageContent('home');
  const about = content.about_preview;

  if (!about) return null;

  return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {about.title}
              </h2>
              <div className="text-lg text-gray-700 leading-relaxed space-y-4">
                {about.content?.split('\n').map((paragraph: string, index: number) => (
                    paragraph.trim() && (
                        <p key={index}>{paragraph.trim()}</p>
                    )
                ))}
              </div>
              <Link
                  href="/about"
                  className="inline-block mt-6 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                Learn More About Us →
              </Link>
            </div>

            {about.image && (
                <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
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

// Features Section
async function FeaturesSection() {
  const content = await getPageContent('home');
  const features = content.features;

  if (!features || !Array.isArray(features)) return null;

  return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide exceptional services with a commitment to quality and excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any, index: number) => (
                <div
                    key={index}
                    className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  {feature.icon && (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-xl">
                    {getFeatureIcon(feature.icon)}
                  </span>
                      </div>
                  )}

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
            ))}
          </div>
        </div>
      </section>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {testimonials.settings?.title || 'What Our Clients Say'}
            </h2>
            {testimonials.settings?.subtitle && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {testimonials.settings.subtitle}
                </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedTestimonials.map((testimonial: any, index: number) => (
                <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
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
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Contact us today to discuss your project and see how we can help your business grow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300"
            >
              Get In Touch
            </Link>

            {siteConfig.site?.phone && (
                <a
                    href={`tel:${siteConfig.site.phone}`}
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
                >
                  Call {siteConfig.site.phone}
                </a>
            )}
          </div>
        </div>
      </section>
  );
}

// Helper function for feature icons
function getFeatureIcon(iconName: string) {
  const icons: Record<string, string> = {
    'check-circle': '✓',
    'users': '👥',
    'star': '⭐',
    'heart': '❤️',
    'shield': '🛡️',
    'clock': '⏰',
    'lightning': '⚡',
    'trophy': '🏆',
    'target': '🎯',
    'rocket': '🚀',
  };

  return icons[iconName] || '✓';
}

// Main Homepage Component
export default async function HomePage() {
  return (
      <main>
        <HeroSection />
        <AboutPreviewSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
  );
}