import type { ActionType, ActionOutcome } from '../enums';
export interface CreateActionDto {
    type: ActionType;
    outcome: ActionOutcome;
    notes?: string;
}
