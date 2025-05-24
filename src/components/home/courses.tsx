import Image from 'next/image';
import Link from 'next/link';

interface Course {
  title: string;
  description: string;
  image: string;
  category?: string;
  duration?: string;
  link: string;
}

interface CoursesProps {
  title: string;
  subtitle?: string;
  courses: Course[];
}

export default function Courses({ 
  title, 
  subtitle, 
  courses 
}: CoursesProps) {
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
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
          {courses.map((course, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.category && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 text-sm font-medium rounded-full">
                    {course.category}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                
                {course.duration && (
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    {course.duration}
                  </div>
                )}
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>
                
                <Link
                  href={course.link}
                  className="block w-full text-center bg-black text-white hover:bg-yellow-500 hover:text-black transition-colors duration-300 py-2 rounded-md font-medium"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center text-yellow-500 font-medium hover:text-yellow-600"
          >
            View All Courses
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
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}