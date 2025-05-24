import {getSiteConfig, getPageContent} from '@/src/lib/config/file-manager';

export default async function ContactInfo() {
    const siteConfig = await getSiteConfig();
    const pageContent = await getPageContent('contact');

    const contactMethods = [
        {
            icon: '📧',
            label: 'Email',
            value: siteConfig.site?.email,
            href: `mailto:${siteConfig.site?.email}`,
            description: 'Send us an email anytime'
        },
        {
            icon: '📞',
            label: 'Phone',
            value: siteConfig.site?.phone,
            href: `tel:${siteConfig.site?.phone}`,
            description: 'Call us during business hours'
        },
        {
            icon: '📍',
            label: 'Address',
            value: siteConfig.company?.address,
            href: pageContent.location?.map_link || '#',
            description: 'Visit our office'
        }
    ];

    const socialLinks = [
        {
            name: 'Facebook',
            url: siteConfig.social?.facebook,
            icon: '📘'
        },
        {
            name: 'Twitter',
            url: siteConfig.social?.twitter,
            icon: '🐦'
        },
        {
            name: 'LinkedIn',
            url: siteConfig.social?.linkedin,
            icon: '💼'
        },
        {
            name: 'Instagram',
            url: siteConfig.social?.instagram,
            icon: '📷'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Contact Methods */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Contact Information
                </h3>

                <div className="space-y-6">
                    {contactMethods.map((method, index) => (
                        method.value && (
                            <div key={index} className="flex items-start space-x-4">
                                <div
                                    className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">{method.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                        {method.label}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {method.description}
                                    </p>
                                    <a
                                        href={method.href}
                                        className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                                    >
                                        {method.value}
                                    </a>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Business Hours */}
            {pageContent.hours?.schedule && (
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        Business Hours
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="space-y-3">
                            {Object.entries(pageContent.hours.schedule).map(([day, time]: [string, any]) => (
                                <div key={day} className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 capitalize">
                    {day}
                  </span>
                                    <span className="text-gray-600">
                    {time}
                  </span>
                                </div>
                            ))}
                        </div>

                        {pageContent.hours.note && (
                            <p className="text-sm text-gray-500 mt-4 italic">
                                {pageContent.hours.note}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Social Media */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Follow Us
                </h3>

                <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                        social.url && (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors group"
                                title={`Follow us on ${social.name}`}
                            >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {social.icon}
                </span>
                            </a>
                        )
                    ))}
                </div>
            </div>

            {/* Additional Info */}
            {pageContent.additional_info && (
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        {pageContent.additional_info.title || 'Additional Information'}
                    </h3>

                    <div className="bg-blue-50 rounded-lg p-6">
                        <div className="space-y-3">
                            {pageContent.additional_info.items?.map((item: any, index: number) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <p className="text-gray-700">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Response Time */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">⏰</span>
                    </div>
                    <div>
                        {/*<h4 className="font-semibold text-green-800 mb-*/}
                    </div>
                </div>
            </div>
        </div>
    )
}