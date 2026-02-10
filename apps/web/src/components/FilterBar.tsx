import type { ListCasesQueryDto } from '@collections/shared';
import { CaseStage, CaseStatus } from '@collections/shared';

interface FilterBarProps {
  filters: ListCasesQueryDto;
  onChange: (f: ListCasesQueryDto) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Status</label>
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value ? (e.target.value as CaseStatus) : undefined,
              page: 1,
            })
          }
          className="border border-slate-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {Object.values(CaseStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Stage</label>
        <select
          value={filters.stage ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              stage: e.target.value ? (e.target.value as CaseStage) : undefined,
              page: 1,
            })
          }
          className="border border-slate-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {Object.values(CaseStage).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">DPD Min</label>
        <input
          type="number"
          min={0}
          value={filters.dpdMin ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              dpdMin: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
          className="border border-slate-300 rounded px-3 py-2 text-sm w-24"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">DPD Max</label>
        <input
          type="number"
          min={0}
          value={filters.dpdMax ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              dpdMax: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
          className="border border-slate-300 rounded px-3 py-2 text-sm w-24"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Assigned To</label>
        <select
          value={filters.assignedTo ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              assignedTo: e.target.value || undefined,
              page: 1,
            })
          }
          className="border border-slate-300 rounded px-3 py-2 text-sm w-36"
        >
          <option value="">All</option>
          <option value="Tier1Agent">Tier1Agent</option>
          <option value="Tier2Agent">Tier2Agent</option>
          <option value="LegalAgent">LegalAgent</option>
          <option value="SeniorAgent">SeniorAgent</option>
        </select>
      </div>
    </div>
  );
}
