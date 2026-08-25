import { PublicLayout as PublicLayoutComponent } from '@/components/layout/PublicLayout';

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutComponent>{children}</PublicLayoutComponent>;
}
