import Image from 'next/image';
import Link from 'next/link';

interface TechInitiative {
  title: string;
  description: string;
  image: string;
  link?: string;
}

interface TechInitiativesProps {
  title: string;
  subtitle?: string;
  initiatives: TechInitiative[];
}

export default function TechInitiatives({ 
  title, 
  subtitle, 
  initiatives 
}: TechInitiativesProps) {
  if (!initiatives || initiatives.length === 0) {
    return null;
  }

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={initiative.image}
                  alt={initiative.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {initiative.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {initiative.description}
                </p>
                
                {initiative.link && (
                  <Link
                    href={initiative.link}
                    className="text-yellow-500 font-medium hover:text-yellow-600 inline-flex items-center"
                  >
                    Learn more
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}