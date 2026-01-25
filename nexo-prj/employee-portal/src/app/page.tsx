'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@nexo-prj/ui';

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
          Employee Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          NEXO CRM - Employee Access
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
                  You are signed in as an employee user.
                </p>
              </div>
              <div className="mt-6">
                <Button
                  variant="danger"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Sign In Required
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Please sign in to access the employee portal.
                </p>
              </div>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => signIn('keycloak')}
                >
                  Sign In with Keycloak
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
