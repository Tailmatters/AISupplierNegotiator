import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12">
        <div className="mx-auto max-w-md w-full">{children}</div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-primary/90 to-primary-foreground/30 text-white">
        <div className="flex flex-col justify-center h-full p-12">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-6">
              AI-Powered Procurement Negotiation Platform
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Streamline your procurement negotiations with advanced AI technology 
              that helps you achieve better terms, faster results, and significant 
              cost savings.
            </p>
            <ul className="space-y-3 text-lg">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Automated AI-driven supplier negotiations
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Advanced spend analysis and reporting
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Contract management and template library
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Strategic market analysis with Porter's Five Forces
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}