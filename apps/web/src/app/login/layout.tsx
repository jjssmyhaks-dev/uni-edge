import { PublicLayout as PublicLayoutComponent } from '@/components/layout/PublicLayout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutComponent>{children}</PublicLayoutComponent>;
}
