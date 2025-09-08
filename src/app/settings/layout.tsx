
import { AppLayout } from '@/components/layout/app-layout';
import { SettingsSidebar } from './_components/settings-sidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-screen">
        <SettingsSidebar />
        <main className="col-span-1 h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </AppLayout>
  );
}
