'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { unstable_noStore as noStore } from 'next/cache';

export default function Index() {
  noStore();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Client Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          NEXO CRM - Client Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {session ? (
            <div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Welcome, {session.user?.name || session.user?.email}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  You are signed in as a client user.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => signOut()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Sign In Required
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Please sign in to access the client portal.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => signIn('keycloak')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In with Keycloak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
