import { PublicLayout as PublicLayoutComponent } from '@/components/layout/PublicLayout';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutComponent>{children}</PublicLayoutComponent>;
}
