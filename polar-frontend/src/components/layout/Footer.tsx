import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    institutions: [
      { name: 'Ministry of Earth Sciences (MoES)', href: 'https://moes.gov.in' },
      { name: 'National Centre for Polar & Ocean Research (NCPOR)', href: 'https://ncpor.res.in' },
      { name: 'Indian National Centre for Ocean Info Services (INCOIS)', href: 'https://incois.gov.in' },
      { name: 'India Meteorological Department (IMD)', href: 'https://mausam.imd.gov.in' },
    ],
    programs: [
      { name: 'Indian Antarctic Program', href: '/expeditions?region=ANTARCTIC' },
      { name: 'Indian Arctic Program', href: '/expeditions?region=ARCTIC' },
      { name: 'Himalayan Cryptogam Studies', href: '/expeditions?region=HIMALAYA' },
      { name: 'Southern Ocean Expeditions', href: '/expeditions?region=SOUTHERN_OCEAN' },
    ],
    policies: [
      { name: 'Data Management Policy', href: '/datasets#policy' },
      { name: 'Publications Guidelines', href: '/publications#guidelines' },
      { name: 'Terms of Use & API access', href: '/terms' },
      { name: 'Privacy Statement', href: '/privacy' },
    ]
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-card-border/25 mt-auto">
      {/* Editorial top section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Institution Intro */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center border border-slate-700 bg-slate-900 text-slate-100 font-serif font-black text-sm tracking-tighter rounded-sm">
                P
              </div>
              <span className="font-serif text-md font-bold tracking-tight text-slate-100 leading-none">
                POLARIS PORTAL
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              National gateway for Polar Science Outreach, telemetry archives, and media archives compiled by research teams under the Ministry of Earth Sciences, Government of India.
            </p>
            <div className="mt-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-900/50 p-2 border border-slate-800 rounded-sm w-fit">
              System Code: MoES-POL-2026
            </div>
          </div>

          {/* Institutional Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-100">
              Institutional Links
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {links.institutions.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-color transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Domains */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-100">
              Research Domains
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {links.programs.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent-color transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Policy */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-100">
              Data & Guidelines
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {links.policies.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent-color transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Institutional bottom copyright bar */}
      <div className="bg-slate-900 border-t border-slate-800/60 py-6 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono">
          <div className="text-center md:text-left text-slate-500">
            © {currentYear} POLARIS Portal. Developed under guidance of the Ministry of Earth Sciences.
          </div>
          <div className="text-center md:text-right flex gap-4 text-slate-500">
            <a href="https://moes.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
              moes.gov.in
            </a>
            <span>•</span>
            <a href="https://ncpor.res.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
              ncpor.res.in
            </a>
            <span>•</span>
            <Link href="/sitemap" className="hover:text-slate-300">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
