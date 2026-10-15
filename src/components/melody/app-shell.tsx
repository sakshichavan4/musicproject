import { Link } from '@tanstack/react-router';
import { AudioLines, ArrowUpRight, Headphones } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function Brand({ small = false }: { small?: boolean }) {
  return <span className={`brand ${small ? 'brand-small' : ''}`}><span className="brand-mark"><AudioLines size={22}/></span><span>Melody<span className="text-primary">AI</span></span></span>;
}
export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell">
    <header className="site-header"><div className="header-inner">
      <Link to="/" aria-label="MelodyAI home"><Brand /></Link>
      <nav aria-label="Main navigation">
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'nav-active' }}>Home</Link>
        <Link to="/create" activeProps={{ className: 'nav-active' }}>Create Karaoke</Link>
        <Link to="/library" activeProps={{ className: 'nav-active' }}>My Library</Link>
      </nav>
      <Button asChild variant="outline" className="header-create"><Link to="/create">Let's create <ArrowUpRight /></Link></Button>
    </div></header>
    <main>{children}</main>
    <footer className="site-footer"><div className="footer-inner"><Brand small/><span>Made for the music. Built for your voice.</span><span className="footer-status"><Headphones size={14}/> Frontend preview</span></div></footer>
  </div>;
}