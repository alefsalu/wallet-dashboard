import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const isFirstPage = page <= 0;
  const isLastPage = page >= totalPages - 1;

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl"
      aria-label="Paginação"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          aria-label="Anterior"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          aria-label="Próxima"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-700">{page + 1}</span> de{' '}
        <span className="font-semibold text-slate-700">{Math.max(1, totalPages)}</span>
      </div>
    </nav>
  );
};
