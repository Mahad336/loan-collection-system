import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { CreateCaseDto } from '@collections/shared';

interface CreateCaseFormProps {
  onCreated: () => void;
}

interface AvailableLoan {
  id: number;
  customerId: number;
  customer: { name: string };
  principal: number;
  outstanding: number;
  dueDate: string;
}

export function CreateCaseForm({ onCreated }: CreateCaseFormProps) {
  const [loans, setLoans] = useState<AvailableLoan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(true);

  useEffect(() => {
    api.cases.getAvailableLoans().then(({ data }) => {
      setLoans(data);
      setLoadingLoans(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lid = parseInt(selectedLoanId, 10);
    if (isNaN(lid)) {
      alert('Please select a loan');
      return;
    }
    const loan = loans.find((l) => l.id === lid);
    if (!loan) {
      alert('Invalid loan selected');
      return;
    }
    setLoading(true);
    try {
      await api.cases.create({ customerId: loan.customerId, loanId: loan.id });
      setSelectedLoanId('');
      setLoans((prev) => prev.filter((l) => l.id !== lid));
      onCreated();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingLoans) {
    return <div className="text-sm text-slate-500">Loading loans...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
      <div className="min-w-[280px]">
        <label className="block text-xs text-slate-500 mb-1">
          Select Loan (Customer + Loan)
        </label>
        <select
          value={selectedLoanId}
          onChange={(e) => setSelectedLoanId(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm w-full"
          required
        >
          <option value="">-- Select a delinquent loan --</option>
          {loans.map((loan) => (
            <option key={loan.id} value={loan.id}>
              {loan.customer.name} • Loan #{loan.id} • ${loan.outstanding.toLocaleString()} outstanding
            </option>
          ))}
        </select>
        {loans.length === 0 && (
          <p className="text-xs text-slate-500 mt-1">
            No delinquent loans without an open case
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || loans.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Case'}
      </button>
    </form>
  );
}
