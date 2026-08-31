'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Compass, Database, FileText, Image, Map, Newspaper, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Expeditions', href: '/expeditions', icon: Compass },
    { name: 'Datasets', href: '/datasets', icon: Database },
    { name: 'Publications', href: '/publications', icon: FileText },
    { name: 'Media Gallery', href: '/media', icon: Image },
    { name: 'Polar Map', href: '/map', icon: Map },
    { name: 'Outreach', href: '/news', icon: Newspaper },
  ];

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/95 backdrop-blur-md">
      {/* Top Ministry bar */}
      <div className="w-full bg-primary-color py-1 px-4 text-[10px] sm:text-xs font-mono text-primary-fg tracking-wide flex justify-between items-center border-b border-card-border/10">
        <div>MINISTRY OF EARTH SCIENCES • GOVERNMENT OF INDIA</div>
        <div className="hidden md:block">POLAR SCIENCE RESEARCH PORTAL (POLARIS)</div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center border border-accent-color/40 bg-accent-light/10 text-accent-color font-serif font-black text-xl tracking-tighter rounded-sm">
                P
                <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-accent-color animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-foreground leading-none group-hover:text-accent-color transition-colors">
                  POLARIS
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-text font-mono leading-none mt-1">
                  Polar Science Outreach
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                    active
                      ? 'border-accent-color text-accent-color font-semibold bg-accent-light/10'
                      : 'border-transparent text-muted-text hover:text-foreground hover:border-card-border'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-muted-text hover:text-foreground hover:bg-muted-bg border border-transparent hover:border-card-border transition-all rounded-sm"
              aria-label="Search portal"
            >
              <Search className="h-4 w-4" />
            </Link>
            
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-fg bg-primary-color hover:bg-accent-color transition-all border border-card-border/20 rounded-sm"
            >
              <User className="h-3.5 w-3.5" />
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/search"
              className="p-2 text-muted-text hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-muted-text hover:text-foreground hover:bg-muted-bg border border-card-border rounded-sm"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-card-border bg-background">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-sm transition-all ${
                    active
                      ? 'bg-accent-light/15 text-accent-color font-semibold border-l-4 border-accent-color'
                      : 'text-muted-text hover:text-foreground hover:bg-muted-bg'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-card-border mt-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 bg-primary-color py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-fg hover:bg-accent-color transition-colors rounded-sm"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
