import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/admin/dashboard"
      />
    </div>
  );
}
