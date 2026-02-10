import { useState } from 'react';
import { api } from '@/services/api';
import { ActionType, ActionOutcome } from '@collections/shared';

interface ActionFormProps {
  caseId: number;
  onAdded: () => void;
}

export function ActionForm({ caseId, onAdded }: ActionFormProps) {
  const [type, setType] = useState<ActionType>(ActionType.CALL);
  const [outcome, setOutcome] = useState<ActionOutcome>(ActionOutcome.NO_ANSWER);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.actions.add(caseId, { type, outcome, notes: notes || undefined });
      setNotes('');
      onAdded();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ActionType)}
            className="border border-slate-300 rounded px-3 py-2 text-sm"
          >
            {Object.values(ActionType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Outcome</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as ActionOutcome)}
            className="border border-slate-300 rounded px-3 py-2 text-sm"
          >
            {Object.values(ActionOutcome).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="border border-slate-300 rounded px-3 py-2 text-sm w-full"
          placeholder="Optional notes..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Action'}
      </button>
    </form>
  );
}
