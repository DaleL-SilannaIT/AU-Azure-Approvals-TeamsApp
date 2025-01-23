import type { ApprovalRecord } from './approvalRecord';

export interface ApprovalRecordFilters {
    columnName: keyof ApprovalRecord,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'datetime'
}

//Example payload
/*
[
    {
        columnName: 'id',
        operator: '=',
        value: '1',
        value_type: 'number'
    },
    {
        columnName: 'created',
        operator: '>=',
        value: '2025-01-01',
        value_type: 'datetime'
    },
    {
        columnName: 'created',
        operator: '<=',
        value: '2025-06-01',
        value_type: 'datetime'
    },
    {
        columnName: 'email',
        operator: '>=',
        value: '2025-01-01',
        value_type: 'datetime'
    },
]
*/