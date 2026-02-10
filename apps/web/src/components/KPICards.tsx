interface KPICardsProps {
  kpis: {
    openCasesCount: number;
    resolvedTodayCount: number;
    averageDpdOfOpenCases: number;
  };
}

export function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="text-sm text-slate-500">Open Cases</div>
        <div className="text-2xl font-bold text-slate-800">{kpis.openCasesCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="text-sm text-slate-500">Resolved Today</div>
        <div className="text-2xl font-bold text-slate-800">{kpis.resolvedTodayCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="text-sm text-slate-500">Avg DPD (Open)</div>
        <div className="text-2xl font-bold text-slate-800">{kpis.averageDpdOfOpenCases}</div>
      </div>
    </div>
  );
}
