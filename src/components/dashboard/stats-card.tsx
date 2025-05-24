// components/dashboard/stats-card.tsx
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
    trend?: string;
    description?: string;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        trend: 'text-blue-600'
    },
    green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        trend: 'text-green-600'
    },
    purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        trend: 'text-purple-600'
    },
    orange: {
        bg: 'bg-orange-100',
        icon: 'text-orange-600',
        trend: 'text-orange-600'
    },
    red: {
        bg: 'bg-red-100',
        icon: 'text-red-600',
        trend: 'text-red-600'
    },
    yellow: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        trend: 'text-yellow-600'
    }
};

export default function StatsCard({
                                      title,
                                      value,
                                      icon: Icon,
                                      color,
                                      trend,
                                      description
                                  }: StatsCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                    {trend && (
                        <p className={`text-sm font-medium flex items-center ${colors.trend}`}>
                            {trend}
                        </p>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 mt-2">{description}</p>
                    )}
                </div>
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
}