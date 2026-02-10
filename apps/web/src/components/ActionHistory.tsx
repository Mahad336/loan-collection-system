import type { ActionLog } from '@collections/shared';

interface ActionHistoryProps {
  actions: ActionLog[];
}

export function ActionHistory({ actions }: ActionHistoryProps) {
  if (!actions?.length) {
    return <div className="text-sm text-slate-500">No actions recorded</div>;
  }

  return (
    <div className="space-y-2">
      {actions.map((a) => (
        <div
          key={a.id}
          className="flex justify-between items-start p-3 bg-slate-50 rounded text-sm"
        >
          <div>
            <span className="font-medium">{a.type}</span> → {a.outcome}
            {a.notes && (
              <div className="text-slate-600 mt-1">{a.notes}</div>
            )}
          </div>
          <div className="text-slate-500 text-xs">
            {new Date(a.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
