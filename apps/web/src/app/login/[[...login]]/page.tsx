import { SignIn } from '@clerk/nextjs';

const Logo = () => (
  <svg
    fill="currentColor"
    height="32"
    viewBox="0 0 40 48"
    width="32"
    className="text-foreground"
  >
    <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center space-x-1.5">
            <Logo />
            <p className="text-pretty font-medium text-foreground text-lg">
              Uni-Edge
            </p>
          </div>
          <h3 className="mt-6 text-balance font-semibold text-foreground text-lg">
            Sign in to your account
          </h3>
          <p className="mt-2 text-pretty text-muted-foreground text-sm">
            Don&apos;t have an account?{' '}
            <a
              className="font-medium text-primary hover:text-primary/90"
              href="/signup"
            >
              Sign up
            </a>
          </p>

          <div className="mt-8">
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'mx-auto w-full',
                  card: 'shadow-none border-0 p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium',
                  socialButtonsBlockButtonText: 'text-foreground font-medium',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground',
                  formFieldLabel: 'text-foreground font-medium text-sm',
                  formFieldInput: 'rounded-md border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring',
                  formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                  footerActionLink: 'text-primary hover:text-primary/90',
                  identityPreviewEditButton: 'text-primary',
                },
              }}
              routing="path"
              path="/login"
              signUpUrl="/signup"
              fallbackRedirectUrl="/admin/dashboard"
            />
          </div>
          <p className="mt-6 text-pretty text-muted-foreground text-sm">
            Forgot your password?{' '}
            <a
              className="font-medium text-primary hover:text-primary/90"
              href="#"
            >
              Reset password
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
