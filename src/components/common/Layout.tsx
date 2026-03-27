interface LayoutProps { children: React.ReactNode; }

export function Layout({ children }: LayoutProps) {
  return <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-4">{children}</div>;
}
