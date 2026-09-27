import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToolContext } from '@/components/tool/ToolContext';
import { getTool } from '@/tools/registry';

async function renderTool(slug: string) {
  const tool = getTool(slug)!;
  const Comp = await tool.load();
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <ToolContext.Provider value={tool}>
        <Comp />
      </ToolContext.Provider>
    </MemoryRouter>,
  );
  return user;
}

describe('FormTool (EMI calculator)', () => {
  it('shows the reference EMI for default inputs', async () => {
    await renderTool('emi-calculator');
    const result = screen.getByRole('region', { name: 'Result' });
    expect(within(result).getByText('₹43,391')).toBeInTheDocument();
    expect(within(result).getByText('₹54,13,840')).toBeInTheDocument();
    expect(within(result).getByText('₹1,04,13,840')).toBeInTheDocument();
  });

  it('recalculates instantly and accepts Indian-formatted numbers', async () => {
    const user = await renderTool('emi-calculator');
    const amount = screen.getByLabelText('Loan amount');
    await user.clear(amount);
    await user.type(amount, '10,00,000');
    expect(screen.getByText('₹8,678')).toBeInTheDocument();
  });

  it('shows human-readable validation errors and never NaN', async () => {
    const user = await renderTool('emi-calculator');
    const rate = screen.getByLabelText('Interest rate (p.a.)');
    await user.clear(rate);
    await user.type(rate, 'abc');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Interest rate (p.a.) must be a number.');
    expect(document.body.textContent).not.toMatch(/NaN|Infinity|undefined/);
    await user.clear(rate);
    await user.type(rate, '-5');
    expect(screen.getByRole('alert')).toHaveTextContent('must be at least 0');
  });

  it('resets to defaults', async () => {
    const user = await renderTool('emi-calculator');
    const amount = screen.getByLabelText('Loan amount');
    await user.clear(amount);
    await user.type(amount, '12345');
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText('Loan amount')).toHaveValue('50,00,000');
    expect(screen.getByText('₹43,391')).toBeInTheDocument();
  });

  it('shows domain errors from the engine', async () => {
    const user = await renderTool('loan-tenure-calculator');
    const emi = screen.getByLabelText('Monthly EMI you can pay');
    await user.clear(emi);
    await user.type(emi, '1000');
    expect(screen.getByRole('alert')).toHaveTextContent('never gets repaid');
  });

  it('renders share actions', async () => {
    await renderTool('gst-calculator');
    expect(screen.getByRole('button', { name: /copy result/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me'),
    );
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
  });
});
