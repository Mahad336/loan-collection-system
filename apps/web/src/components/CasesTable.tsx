import Link from 'next/link';
import type { CaseWithRelations } from '@collections/shared';

interface CasesTableProps {
  cases: CaseWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CasesTable({
  cases,
  total,
  page,
  totalPages,
  onPageChange,
}: CasesTableProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-3 font-medium">ID</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">DPD</th>
              <th className="text-left p-3 font-medium">Stage</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Assigned To</th>
              <th className="text-left p-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="p-3">
                  <Link
                    href={`/cases/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {c.id}
                  </Link>
                </td>
                <td className="p-3">{c.customer?.name ?? '-'}</td>
                <td className="p-3">{c.dpd}</td>
                <td className="p-3">{c.stage}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{c.assignedTo ?? '-'}</td>
                <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-slate-200">
        <div className="text-sm text-slate-500">
          {total} total · Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
