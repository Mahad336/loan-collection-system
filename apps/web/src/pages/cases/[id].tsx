import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '@/services/api';
import type { CaseWithRelations } from '@collections/shared';
import { CaseDetails } from '@/components/CaseDetails';
import { ActionForm } from '@/components/ActionForm';
import { ActionHistory } from '@/components/ActionHistory';

export default function CaseDetailPage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const [caseData, setCaseData] = useState<CaseWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    api.cases.getById(id).then(({ data }) => {
      setCaseData(data);
      setLoading(false);
    });
  }, [id]);

  const refresh = () => {
    if (!id) return;
    api.cases.getById(id).then(({ data }) => setCaseData(data));
  };

  const handleRunAssignment = async () => {
    if (!id) return;
    setAssigning(true);
    setAssignResult(null);
    try {
      const { data } = await api.assignments.run(id, caseData?.version);
      setAssignResult(
        data.alreadyAssigned
          ? 'Already assigned'
          : `Assigned to ${data.assignedTo} (${data.decision.reason})`,
      );
      refresh();
    } catch (err) {
      setAssignResult('Failed: ' + (err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  const handleActionAdded = () => refresh();

  if (loading || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/cases"
            className="text-slate-600 hover:text-slate-900"
          >
            ← Back to cases
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">
            Case #{caseData.id}
          </h1>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <CaseDetails caseData={caseData} />

        <div className="flex gap-3">
          <button
            onClick={handleRunAssignment}
            disabled={assigning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {assigning ? 'Running...' : 'Run Assignment'}
          </button>
          <a
            href={api.pdf.getNoticeUrl(caseData.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Generate PDF Notice
          </a>
        </div>

        {assignResult && (
          <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
            {assignResult}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-lg font-medium mb-3">Add Action</h2>
          <ActionForm caseId={caseData.id} onAdded={handleActionAdded} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-lg font-medium mb-3">Action History</h2>
          <ActionHistory actions={caseData.actionLogs || []} />
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
