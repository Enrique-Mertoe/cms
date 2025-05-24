import Image from 'next/image';
import Link from 'next/link';

interface Service {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  link: string;
}

interface ServicesProps {
  title: string;
  subtitle?: string;
  services: Service[];
}

export default function Services({ 
  title, 
  subtitle, 
  services 
}: ServicesProps) {
  if (!services || services.length === 0) {
    return null;
  }

  // Helper function for service icons
  const getServiceIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      'consulting': '💼',
      'research': '🔍',
      'training': '👨‍🏫',
      'development': '💻',
      'strategy': '📊',
      'support': '🛠️',
    };

    return icons[iconName] || '✓';
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Link 
              key={index}
              href={service.link}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row"
            >
              {service.image && (
                <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center mb-3">
                  {service.icon && (
                    <span className="text-2xl mr-3">
                      {getServiceIcon(service.icon)}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-yellow-500 transition-colors">
                    {service.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4 flex-grow">
                  {service.description}
                </p>
                
                <div className="flex items-center text-yellow-500 font-medium group-hover:text-yellow-600">
                  Learn more
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link
            href="/services"
            className="inline-block bg-black text-white hover:bg-yellow-500 hover:text-black transition-colors duration-300 px-6 py-3 rounded-md font-medium"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}