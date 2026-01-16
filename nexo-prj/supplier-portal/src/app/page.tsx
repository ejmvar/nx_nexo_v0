'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function Index() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Supplier Portal</h1>

        {session ? (
          <div>
            <p className="text-center mb-4">Welcome, {session.user?.email}!</p>
            <button
              onClick={() => signOut()}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-center mb-4">Please sign in to access the portal.</p>
            <button
              onClick={() => signIn('keycloak')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Sign In with Keycloak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
