import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/routes/router';
import { favoriteTools, recentTools } from '@/services/storage';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  return { router, user };
}

beforeEach(() => {
  favoriteTools._reset();
  recentTools._reset();
  // The site is static: no page may call a backend API.
  vi.spyOn(globalThis, 'fetch');
});
afterEach(() => {
  expect(globalThis.fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe('tool page', () => {
  it('renders breadcrumbs, H1, content, FAQ schema and records recent use', async () => {
    renderAt('/tools/emi-calculator');
    expect(screen.getByRole('heading', { level: 1, name: 'EMI Calculator' })).toBeInTheDocument();
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByText('Finance')).toBeInTheDocument();
    await screen.findByRole('heading', { name: 'Frequently asked questions' });
    await waitFor(() =>
      expect(document.title).toBe('EMI Calculator – Free Online | BASERASTECH India Tools'),
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
      /\/tools\/emi-calculator\/$/,
    );
    const types = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => JSON.parse(s.textContent!)['@type'],
    );
    expect(types).toEqual(expect.arrayContaining(['WebApplication', 'BreadcrumbList', 'FAQPage']));
    expect(recentTools.get()[0]).toBe('emi-calculator');
    expect(screen.getByRole('heading', { name: 'Related tools' })).toBeInTheDocument();
  });

  it('toggles favourites', async () => {
    const { user } = renderAt('/tools/sip-calculator');
    const btn = screen.getByRole('button', { name: /save/i });
    await user.click(btn);
    expect(favoriteTools.get()).toContain('sip-calculator');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows 404 for unknown tools', () => {
    renderAt('/tools/does-not-exist');
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });
});

describe('category, all tools and search pages', () => {
  it('lists category tools', () => {
    renderAt('/category/tax');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tax & GST Calculators' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Income Tax Calculator').length).toBeGreaterThan(0);
  });

  it('filters all tools', async () => {
    const { user } = renderAt('/tools');
    const heading = await screen.findByRole('heading', { level: 1, name: 'All tools' });
    expect(heading).toBeInTheDocument();
    await user.type(screen.getByLabelText('Filter tools'), 'bmi');
    expect(screen.getByRole('status')).toHaveTextContent(/Showing \d+ tool/);
    expect(screen.getAllByText('BMI Calculator').length).toBeGreaterThan(0);
  });

  it('shows search results and an empty state', async () => {
    renderAt('/search?q=gst');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Search results for “gst”',
    );
    expect(screen.getAllByText('GST Calculator').length).toBeGreaterThan(0);
  });

  it('empty search shows popular tools and categories', async () => {
    renderAt('/search?q=qwxzzy');
    expect(await screen.findByText('No tools found for “qwxzzy”.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Browse categories' })).toBeInTheDocument();
  });
});

describe('global search', () => {
  it('opens with Ctrl+K and supports keyboard navigation', async () => {
    const { user, router } = renderAt('/');
    await act(async () => {
      await user.keyboard('{Control>}k{/Control}');
    });
    const dialog = await screen.findByRole('dialog', { name: 'Search tools' });
    const input = within(dialog).getByRole('combobox');
    await user.type(input, 'emi');
    const options = within(dialog).getAllByRole('option');
    expect(options[0]).toHaveTextContent('EMI Calculator');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}{Enter}');
    await waitFor(() => expect(router.state.location.pathname).toBe('/tools/emi-calculator/'));
  });

  it('homepage hero search suggests tools', async () => {
    const { user } = renderAt('/');
    const input = screen.getByRole('combobox', { name: 'Search tools' });
    await user.type(input, 'take home');
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('CTC to In-Hand Salary Calculator');
  });
});

describe('static pages and removed features', () => {
  it('serves privacy policy with AdSense disclosures, disclaimer and contact', async () => {
    renderAt('/privacy-policy');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Privacy policy' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Google AdSense/).length).toBeGreaterThan(0);
    expect(screen.getByText(/not sent to our servers/)).toBeInTheDocument();
  });
  it.each(['/disclaimer', '/contact', '/about', '/terms'])('renders %s', async (path) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
  it.each(['/account', '/admin', '/pricing'])('%s no longer exists', (path) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });
  it('shows ad placeholders in the common layout without touching tool content', () => {
    renderAt('/tools/emi-calculator');
    for (const pos of ['top', 'bottom', 'left', 'right', 'mobile'])
      expect(document.querySelector(`[data-ad="${pos}"]`)).not.toBeNull();
    const form = screen.getByRole('form', { name: /EMI Calculator inputs/ });
    expect(form.querySelector('[data-ad]')).toBeNull();
    expect(document.getElementById('tool-result')?.querySelector('[data-ad]')).toBeNull();
  });
  it('has no membership or login wording anywhere on key pages', () => {
    for (const path of ['/', '/tools/emi-calculator', '/favorites']) {
      const { unmount } = render(
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />,
      );
      expect(document.body.textContent).not.toMatch(
        /\b(sign in|log ?in|register|upgrade|premium|subscribe|subscription|pricing|pro plan)\b/i,
      );
      unmount();
    }
  });
});
