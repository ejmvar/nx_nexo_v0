'use client';

import Link from 'next/link';

export default function PortalSelection() {
  const portals = [
    {
      id: 'employee',
      title: 'Employee Portal',
      description: 'Access your employee dashboard, tasks, and company resources',
      icon: '👥',
      href: '/employee',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'client',
      title: 'Client Portal',
      description: 'Manage your projects, view progress, and communicate with your team',
      icon: '🏢',
      href: '/client',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'supplier',
      title: 'Supplier Portal',
      description: 'Manage orders, deliveries, and supplier relationships',
      icon: '⚙️',
      href: '/supplier',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'professional',
      title: 'Professional Portal',
      description: 'Access professional services, certifications, and development tools',
      icon: '👤',
      href: '/professional',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to NEXO
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Multi-Portal Business Management System
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal) => (
            <Link
              key={portal.id}
              href={portal.href}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full flex flex-col p-8">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">{portal.icon}</div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900">
                    {portal.title}
                  </h2>
                  <p className="text-gray-600 min-h-[60px] mb-6">
                    {portal.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className={`w-full bg-gradient-to-r ${portal.color} text-white py-3 px-6 rounded-lg text-center font-semibold group-hover:opacity-90 transition-opacity`}>
                    Access Portal
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/health"
            className="inline-block mb-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            🔍 System Health Check
          </Link>
          <p className="text-white/70 text-sm">
            © 2026 NEXO Business Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
