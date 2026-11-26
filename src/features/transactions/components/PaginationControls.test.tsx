import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationControls } from './PaginationControls';

describe('PaginationControls', () => {
  it('disables previous button on page 0 and triggers onPageChange on next click', async () => {
    const onPageChange = vi.fn();
    render(<PaginationControls page={0} totalPages={3} onPageChange={onPageChange} />);

    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    const nextBtn = screen.getByRole('button', { name: /próxima/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    await userEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
