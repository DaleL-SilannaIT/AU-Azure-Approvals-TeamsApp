export interface ApprovalRecord {
    id: number;
    title: string;
    subject: string;
    body: string;
    outcome: string;
    outcome_colour: string;
    parent_source: string;
    child_source: string;
    entity_id: number;
    entity_name: string;
    entity_url: string;
    has_notes: boolean;
    has_attachments: boolean;
    active: boolean;
    icon: string;
    created_datetime: string;
    attachments: string;
  }