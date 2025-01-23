export interface ApprovalUser {
    id: number;
    group_id: number;
    upn: string;
    email: string;
    display_name: string;
    substitute_for: string;
    response: string;
    notes: string;
    actionable: boolean;
    time_zone_offset: number;
    reminder_count: number;
    response_datetime: string;
  }