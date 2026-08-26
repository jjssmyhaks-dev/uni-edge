import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
          },
        }}
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
