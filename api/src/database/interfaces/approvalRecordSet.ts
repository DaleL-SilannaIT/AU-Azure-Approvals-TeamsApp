export interface ApprovalRecordSet {
    //Approval records
    Approvals_id: number;
    Approvals_title: string;
    Approvals_subject: string;
    Approvals_body: string;
    Approvals_outcome: string;
    Approvals_outcome_colour: string;
    Approvals_parent_source: string;
    Approvals_child_source: string;
    Approvals_entity_id: number;
    Approvals_entity_name: string;
    Approvals_entity_url: string;
    Approvals_has_notes: boolean;
    Approvals_has_attachments: boolean;
    Approvals_active: boolean;
    Approvals_icon: string;
    Approvals_created_datetime: string;
    Approvals_attachments: string;

    //Approval groups
    Approval_Groups_id: number;
    Approval_Groups_title: string;
    Approval_Groups_approval_id: number;
    Approval_Groups_approval_type: string;
    Approval_Groups_outcome: string;
    Approval_Groups_outcome_colour: string;
    Approval_Groups_percentage_of_approers: number;
    Approval_Groups_order: number;
    Approval_Groups_complete: boolean;
    Approval_Groups_reminder_interval: number;
    Approval_Groups_days_until_reminder: number;
    Approval_Groups_days_until_escalation: number;
    Approval_Groups_days_until_termination: number;
    Approval_Groups_business_days_since_approval_created: number;

    //Approval users
    Approval_Users_id: number;
    Approval_Users_group_id: number;
    Approval_Users_upn: string;
    Approval_Users_email: string;
    Approval_Users_display_name: string;
    Approval_Users_substitute_for: string;
    Approval_Users_response: string;
    Approval_Users_notes: string;
    Approval_Users_actionable: boolean;
    Approval_Users_time_zone_offset: number;
    Approval_Users_reminder_count: number;
    Approval_Users_response_datetime: string;
}