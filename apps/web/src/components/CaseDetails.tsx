import type { CaseWithRelations } from '@collections/shared';

interface CaseDetailsProps {
  caseData: CaseWithRelations;
}

export function CaseDetails({ caseData }: CaseDetailsProps) {
  const { customer, loan } = caseData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h2 className="text-lg font-medium mb-3">Customer</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd>{customer?.name ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd>{customer?.phone ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd>{customer?.email ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Risk Score</dt>
            <dd>{customer?.riskScore ?? '-'}</dd>
          </div>
        </dl>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h2 className="text-lg font-medium mb-3">Loan</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Principal</dt>
            <dd>${loan?.principal?.toLocaleString() ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Outstanding</dt>
            <dd>${loan?.outstanding?.toLocaleString() ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Due Date</dt>
            <dd>{loan ? new Date(loan.dueDate).toLocaleDateString() : '-'}</dd>
          </div>
        </dl>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:col-span-2">
        <h2 className="text-lg font-medium mb-3">Case Summary</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">DPD</dt>
            <dd>{caseData.dpd}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Stage</dt>
            <dd>{caseData.stage}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd>{caseData.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Assigned To</dt>
            <dd>{caseData.assignedTo ?? 'Unassigned'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
