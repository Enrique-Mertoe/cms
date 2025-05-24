'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUpRight, FileText } from 'lucide-react';

export default function SearchPreview() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Search Engine Preview</h2>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            id="desktop-view-btn"
                            className="px-3 py-1.5 rounded-md bg-white shadow-sm text-sm font-medium text-gray-700"
                            onClick={() => {
                                document.getElementById('desktop-view')?.classList.remove('hidden');
                                document.getElementById('mobile-view')?.classList.add('hidden');
                                document.getElementById('desktop-view-btn')?.classList.add('bg-white', 'shadow-sm');
                                document.getElementById('mobile-view-btn')?.classList.remove('bg-white', 'shadow-sm');
                            }}
                        >
                            Desktop
                        </button>
                        <button
                            id="mobile-view-btn"
                            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700"
                            onClick={() => {
                                document.getElementById('mobile-view')?.classList.remove('hidden');
                                document.getElementById('desktop-view')?.classList.add('hidden');
                                document.getElementById('mobile-view-btn')?.classList.add('bg-white', 'shadow-sm');
                                document.getElementById('desktop-view-btn')?.classList.remove('bg-white', 'shadow-sm');
                            }}
                        >
                            Mobile
                        </button>
                    </div>
                    <Link
                        href="/dashboard/seo"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                        Customize SEO <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Desktop Search Preview */}
                    <div id="desktop-view" className="space-y-6">
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-6 h-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value="your website name" 
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="search-result">
                                    <div className="text-sm text-gray-600 mb-1">yourwebsite.com</div>
                                    <a href="#" className="text-xl text-blue-800 font-medium hover:underline">Your Website - Professional Services for Business</a>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Professional services for your business needs. We provide exceptional solutions with over 10 years of experience in the industry.
                                    </p>
                                </div>

                                <div className="search-result">
                                    <div className="text-sm text-gray-600 mb-1">yourwebsite.com › about</div>
                                    <a href="#" className="text-xl text-blue-800 font-medium hover:underline">About Our Company | Your Website</a>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Learn about our company's mission, vision, and the team behind our success. Dedicated professionals committed to excellence.
                                    </p>
                                </div>

                                <div className="search-result">
                                    <div className="text-sm text-gray-600 mb-1">yourwebsite.com › services</div>
                                    <a href="#" className="text-xl text-blue-800 font-medium hover:underline">Our Services | Your Website</a>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Explore our comprehensive range of services designed to help your business grow and succeed in today's competitive market.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Preview */}
                    <div id="mobile-view" className="hidden space-y-6">
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm p-4 max-w-sm mx-auto">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-5 h-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value="your website name" 
                                            readOnly
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="search-result">
                                    <div className="text-xs text-gray-600 mb-1">yourwebsite.com</div>
                                    <a href="#" className="text-base text-blue-800 font-medium hover:underline">Your Website - Professional Services...</a>
                                    <p className="text-xs text-gray-700 mt-1">
                                        Professional services for your business needs. We provide exceptional solutions with over 10 years...
                                    </p>
                                </div>

                                <div className="search-result">
                                    <div className="text-xs text-gray-600 mb-1">yourwebsite.com › about</div>
                                    <a href="#" className="text-base text-blue-800 font-medium hover:underline">About Our Company | Your Website</a>
                                    <p className="text-xs text-gray-700 mt-1">
                                        Learn about our company's mission, vision, and the team behind our success. Dedicated professionals...
                                    </p>
                                </div>

                                <div className="search-result">
                                    <div className="text-xs text-gray-600 mb-1">yourwebsite.com › services</div>
                                    <a href="#" className="text-base text-blue-800 font-medium hover:underline">Our Services | Your Website</a>
                                    <p className="text-xs text-gray-700 mt-1">
                                        Explore our comprehensive range of services designed to help your business grow and succeed...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Engine Visibility</h3>
                        <p className="text-gray-700 mb-4">
                            This is how your website will appear in search engine results. The title and description are critical for attracting visitors.
                        </p>
                        <p className="text-gray-700 mb-6">
                            Optimize your SEO settings to improve your search ranking and drive more traffic to your website.
                        </p>

                        <div className="mt-auto space-y-4">
                            <Link 
                                href="/dashboard/seo" 
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Customize SEO
                            </Link>

                            <Link 
                                href="/dashboard/content?section=pages&item=home" 
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Manage Content
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}