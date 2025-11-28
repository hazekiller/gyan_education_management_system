import { forwardRef } from 'react';

/**
 * Enhanced Stat Card Component with GSAP animation support
 * Maintains all functionality while adding modern UI
 */
export const StatCard = forwardRef(({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient = "from-blue-500 to-blue-600",
    bgGradient = "from-white to-blue-50/30",
    onClick,
    className = ""
}, ref) => {
    return (
        <div
            ref={ref}
            onClick={onClick}
            className={`card hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${bgGradient} ${className}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
                    <h3 className={`stat-number text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {value}
                    </h3>
                    {subtitle && (
                        <div className="flex items-center mt-3 text-xs">
                            <span className="text-gray-600 font-semibold">{subtitle}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl transform hover:rotate-12 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
});

StatCard.displayName = 'StatCard';

/**
 * Enhanced Welcome Banner Component
 */
export const WelcomeBanner = forwardRef(({
    title,
    subtitle,
    date = true,
    stats = [],
    gradient = "from-blue-600 via-purple-600 to-pink-600"
}, ref) => {
    return (
        <div
            ref={ref}
            className={`bg-gradient-to-r ${gradient} rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                {subtitle && <p className="text-lg opacity-90 mb-6">{subtitle}</p>}

                {date && (
                    <p className="text-sm opacity-80 mb-6">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                )}

                {stats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                                <div className="flex items-center gap-2 mb-2">
                                    {stat.icon && <stat.icon className="w-5 h-5" />}
                                    <p className="text-sm opacity-90">{stat.label}</p>
                                </div>
                                <p className="text-3xl font-bold">{stat.value}</p>
                                {stat.subtitle && <p className="text-sm opacity-80 mt-2">{stat.subtitle}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

WelcomeBanner.displayName = 'WelcomeBanner';

/**
 * Enhanced Section Card Component
 */
export const SectionCard = forwardRef(({
    title,
    icon: Icon,
    action,
    actionLabel = "View All",
    children,
    className = ""
}, ref) => {
    return (
        <div ref={ref} className={`card ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {Icon && <Icon className="w-6 h-6 text-blue-600" />}
                    {title}
                </h3>
                {action && (
                    <button
                        onClick={action}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
});

SectionCard.displayName = 'SectionCard';

/**
 * Enhanced Quick Action Button
 */
export const QuickActionButton = ({
    icon: Icon,
    label,
    description,
    onClick,
    color = "blue"
}) => {
    const colorClasses = {
        blue: { bg: 'bg-blue-50 hover:bg-blue-100', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-100' },
        green: { bg: 'bg-green-50 hover:bg-green-100', gradient: 'from-green-500 to-green-600', border: 'border-green-100' },
        purple: { bg: 'bg-purple-50 hover:bg-purple-100', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-100' },
        orange: { bg: 'bg-orange-50 hover:bg-orange-100', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-100' },
        red: { bg: 'bg-red-50 hover:bg-red-100', gradient: 'from-red-500 to-red-600', border: 'border-red-100' },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 ${colors.bg} rounded-xl transition-all duration-300 text-left group hover:shadow-lg border ${colors.border}`}
        >
            <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{label}</p>
                    {description && <p className="text-xs text-gray-600">{description}</p>}
                </div>
            </div>
        </button>
    );
};

/**
 * Enhanced Progress Bar
 */
export const ProgressBar = ({
    value,
    max = 100,
    gradient = "from-blue-500 to-blue-600",
    showPercentage = true,
    label
}) => {
    const percentage = Math.round((value / max) * 100);

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showPercentage && <span className="text-sm font-bold text-gray-900">{percentage}%</span>}
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`bg-gradient-to-r ${gradient} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

/**
 * Enhanced Badge Component
 */
export const Badge = ({
    children,
    variant = "default",
    size = "md"
}) => {
    const variants = {
        default: "bg-gray-100 text-gray-700 border-gray-200",
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-orange-100 text-orange-700 border-orange-200",
        danger: "bg-red-100 text-red-700 border-red-200",
        info: "bg-blue-100 text-blue-700 border-blue-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
    };

    const sizes = {
        sm: "text-xs px-2 py-1",
        md: "text-xs px-3 py-1.5",
        lg: "text-sm px-4 py-2",
    };

    return (
        <span className={`${variants[variant]} ${sizes[size]} rounded-full font-semibold border inline-flex items-center`}>
            {children}
        </span>
    );
};

/**
 * Enhanced List Item Component
 */
export const ListItem = ({
    icon: Icon,
    title,
    subtitle,
    badge,
    onClick,
    gradient = "from-gray-50 to-white"
}) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-4 bg-gradient-to-r ${gradient} rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100`}
        >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                {Icon && (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{title}</p>
                    {subtitle && <p className="text-xs text-gray-600 truncate">{subtitle}</p>}
                </div>
            </div>
            {badge && <div className="ml-3">{badge}</div>}
        </div>
    );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ size = "md", className = "" }) => {
    const sizes = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16",
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-blue-600`}></div>
        </div>
    );
};

/**
 * Empty State Component
 */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionLabel
}) => {
    return (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
            {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-3" />}
            <p className="text-gray-900 font-semibold mb-1">{title}</p>
            {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
            {action && (
                <button
                    onClick={action}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
