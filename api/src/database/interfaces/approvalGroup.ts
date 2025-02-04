export interface ApprovalGroup {
    id: number;
    title: string;
    approval_id: number;
    approval_type: string;
    outcome: string;
    outcome_colour: string;
    percentage_of_approers: number;
    order: number;
    complete: boolean;
    reminder_interval: number;
    days_until_reminder: number;
    days_until_escalation: number;
    days_until_termination: number;
    business_days_since_approval_created: number;
  }