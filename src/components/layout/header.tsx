"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteConfig } from '@/src/lib/config/file-manager';
import { ChevronDown, Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);

  // Fetch site config
  useEffect(() => {
    async function loadConfig() {
      const config = await getSiteConfig();
      setSiteConfig(config);
    }
    loadConfig();
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Show header when scrolled up or at the top
          if (currentScrollY <= 0) {
            setIsScrolled(false);
          } 
          // Show header when scrolled up after scrolling down past threshold
          else if (lastScrollY > currentScrollY && currentScrollY > 100) {
            setIsScrolled(true);
          } 
          // Hide header when scrolling down past threshold
          else if (currentScrollY > 100 && lastScrollY < currentScrollY) {
            setIsScrolled(false);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  // Check if dropdown is open
  const isDropdownOpen = (label: string) => {
    return openDropdowns.includes(label);
  };

  // Navigation items - these would ideally come from TOML config
  const navigation: NavItem[] = [
    { label: 'Home', href: '/' },
    { 
      label: 'Services', 
      href: '/services',
      children: [
        { label: 'Consulting', href: '/services/consulting' },
        { label: 'Research', href: '/services/research' },
        { label: 'Corporate Training', href: '/services/corporate-training' }
      ]
    },
    { 
      label: 'Courses', 
      href: '/courses',
      children: [
        { label: 'Care Coordination', href: '/courses/care-coordination' },
        { label: 'ICT', href: '/courses/ict' },
        { label: 'Agribusiness', href: '/courses/agribusiness' }
      ]
    },
    { label: 'Tech Initiatives', href: '/tech-initiatives' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md transform translate-y-0' 
          : 'bg-white/90 backdrop-blur-sm shadow-sm'
      } ${
        !isScrolled && window.scrollY > 100 
          ? 'transform -translate-y-full' 
          : 'transform translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-yellow-500">
                {siteConfig?.site?.name || 'Company Name'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="flex items-center text-black hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.label}
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 transition-transform ${
                        isDropdownOpen(item.label) ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="text-black hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.children && (
                  <div 
                    className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                      isDropdownOpen(item.label) 
                        ? 'opacity-100 transform translate-y-0' 
                        : 'opacity-0 invisible transform -translate-y-2'
                    }`}
                  >
                    <div className="py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-yellow-500 hover:bg-yellow-50 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          {navigation.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="w-full flex items-center justify-between text-black hover:text-yellow-500 px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.label}
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 transition-transform ${
                        isDropdownOpen(item.label) ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {isDropdownOpen(item.label) && (
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-yellow-50"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-yellow-500 hover:bg-yellow-50"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}