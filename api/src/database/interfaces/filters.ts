import type { ApprovalRecord } from './approvalRecord';
import type { ApprovalGroup } from './approvalGroup';
import type { ApprovalUser } from './approvalUser';

export interface ApprovalRecordFilters {
    columnName: keyof ApprovalRecord,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'datetime'
}

export interface ApprovalGroupFilters {
    columnName: keyof ApprovalGroup,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=',
    value: string,
    value_type: 'number' | 'string' | 'boolean'
}

export interface ApprovalUserFilters {
    columnName: keyof ApprovalUser,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'datetime'
}

export interface ApprovalFilters {

    approvalRecordFilters: ApprovalRecordFilters[];
  
    approvalGroupFilters: ApprovalGroupFilters[];
  
    approvalUserFilters: ApprovalUserFilters[];

    topCount: number;
    sortField: keyof ApprovalRecord | undefined;
    sortOrder: 'ASC' | 'DESC';
    skipCount: number;
  }


// Example payload

/*const examplePayload = {
    ApprovalRecord: 
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
        }
    ],
    ApprovalGroup: 
    [
        {
            columnName: 'id',
            operator: '=',
            value: '1',
            value_type: 'number'
        },
        {
            columnName: 'title',
            operator: '!=',
            value: 'test',
            value_type: 'string'
        },
        {
            columnName: 'complete',
            operator: '=',
            value: 'true',
            value_type: 'boolean'
        },
    ],
    ApprovalUser: 
    [
        {
            columnName: 'id',
            operator: '=',
            value: '1',
            value_type: 'number'
        },
        {
            columnName: 'email',
            operator: '!=',
            value: 'string',
            value_type: 'string'
        }
    ]
};*/