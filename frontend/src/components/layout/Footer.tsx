import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/data/categories';
import { SITE } from '@/config/site';
import { Logo } from './Header';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-slate-600">
            {SITE.tagline}. No sign-up needed — calculations run in your browser.
          </p>
        </div>
        <nav aria-label="Categories" className="md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Categories</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.id}`} className="text-slate-600 hover:text-brand-700">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">{SITE.brand}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/tools" className="text-slate-600 hover:text-brand-700">
                All tools
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-slate-600 hover:text-brand-700">
                About
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="text-slate-600 hover:text-brand-700">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-slate-600 hover:text-brand-700">
                Terms of use
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="text-slate-600 hover:text-brand-700">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-slate-600 hover:text-brand-700">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-100">
        <p className="container-page py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE.brand}. Results are estimates for informational
          purposes only and are not financial, tax, legal or medical advice.
        </p>
      </div>
    </footer>
  );
}
