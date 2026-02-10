import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { api } from '@/services/api';
import type { CaseWithRelations, ListCasesQueryDto } from '@collections/shared';
import { CaseStage, CaseStatus } from '@collections/shared';
import { KPICards } from '@/components/KPICards';
import { CasesTable } from '@/components/CasesTable';
import { FilterBar } from '@/components/FilterBar';
import { CreateCaseForm } from '@/components/CreateCaseForm';

export default function CasesPage() {
  const [data, setData] = useState<{
    data: CaseWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [kpis, setKpis] = useState<{
    openCasesCount: number;
    resolvedTodayCount: number;
    averageDpdOfOpenCases: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListCasesQueryDto>({
    page: 1,
    limit: 10,
  });

  const fetchCases = () => {
    setLoading(true);
    api.cases.list(filters).then(({ data: res }) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchCases();
  }, [filters]);

  useEffect(() => {
    api.kpis().then(({ data: k }) => setKpis(k));
  }, []);

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
  };

  const handleCaseCreated = () => {
    fetchCases();
    api.kpis().then(({ data: k }) => setKpis(k));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Collections Case Manager
        </h1>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {kpis && <KPICards kpis={kpis} />}

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <CreateCaseForm onCreated={handleCaseCreated} />
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : data ? (
            <CasesTable
              cases={data.data}
              total={data.total}
              page={data.page}
              limit={data.limit}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="p-12 text-center text-slate-500">No data</div>
          )}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
