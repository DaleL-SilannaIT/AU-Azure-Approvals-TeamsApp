import type { ApprovalRecord } from './approvalRecord';
import type { ApprovalGroup } from './approvalGroup';
import type { ApprovalUser } from './approvalUser';
import type { ApprovalRecordSet } from './approvalRecordSet';

export interface ApprovalRecordFilters {
    tableName: 'Approvals'
    columnName: keyof ApprovalRecord,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'datetime' | 'number_array' | 'string_array'
    join_operator?: 'AND' | 'OR'
}

export interface ApprovalGroupFilters {
    tableName: 'Approval_Groups',
    columnName: keyof ApprovalGroup,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'string_array'
    join_operator?: 'AND' | 'OR'
}

export interface ApprovalUserFilters {
    requestersFilters: ApprovalRequesterFilters;
    approversFilters: ApprovalApproversFilters;
}

export interface ApprovalRequesterFilters {
    tableName: string,
    columnName: keyof ApprovalUser,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'datetime' | 'string_array'
    join_operator?: 'AND' | 'OR'
}

export interface ApprovalApproversFilters {
    tableName: string,
    columnName: keyof ApprovalUser,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE',
    value: string,
    value_type: 'number' | 'string' | 'boolean' | 'datetime' | 'string_array'
    join_operator?: 'AND' | 'OR'
}

export interface ApprovalFilters {

    approvalRecordFilters: ApprovalRecordFilters[];
  
    approvalGroupFilters: ApprovalGroupFilters[];
  
    approvalUserFilters: ApprovalUserFilters;

    topCount: number;
    sortField: keyof ApprovalRecordSet;
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