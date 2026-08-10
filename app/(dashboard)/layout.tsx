import '@/app/globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export const metadata = {
  title: 'InstaFlow IA - Automação & Agendamento para Instagram com IA',
  description: 'Sistema completo de agendamento e publicação automatizada no Instagram com auxílio do Google Gemini IA.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 flex antialiased">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="ml-64 p-6 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
