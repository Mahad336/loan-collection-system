export enum CaseStage {
  SOFT = 'SOFT',
  HARD = 'HARD',
  LEGAL = 'LEGAL',
}

export enum CaseStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ActionType {
  CALL = 'CALL',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export enum ActionOutcome {
  NO_ANSWER = 'NO_ANSWER',
  PROMISE_TO_PAY = 'PROMISE_TO_PAY',
  PAID = 'PAID',
  WRONG_NUMBER = 'WRONG_NUMBER',
}
