import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToolContext } from '@/components/tool/ToolContext';
import { ALL_TOOLS } from './registry';

/**
 * Renders every registered tool with its default inputs and checks that it produces a
 * result and never leaks NaN / Infinity / undefined / null into the UI.
 */
describe.each(ALL_TOOLS.map((t) => [t.slug, t] as const))('%s', (_slug, tool) => {
  it('renders with defaults and shows a valid result', async () => {
    const Comp = await tool.load();
    const { container } = render(
      <MemoryRouter>
        <ToolContext.Provider value={tool}>
          <Comp />
        </ToolContext.Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container.textContent?.length ?? 0).toBeGreaterThan(20));
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]/);
    expect(text).not.toContain('Enter valid values to see the result');
    expect(screen.queryAllByRole('alert').filter((a) => a.textContent?.trim())).toHaveLength(0);
  });
});
