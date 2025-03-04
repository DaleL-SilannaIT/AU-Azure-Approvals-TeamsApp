import { useState, useContext, useEffect } from 'react';
import { TeamsFxContext } from '../common/Context';
//import { MyApprovalsTable } from './components/table/MyApprovalsTable';
import { MyApprovalsTable } from './components/table/MyApprovalsTable';
import { ApprovalFilters } from '../../../api/src/database/interfaces/filters';

export const MyApprovals: React.FC = () => {
  const { userToken, accessToken } = useContext(TeamsFxContext);
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const [filters, setFilters] = useState<ApprovalFilters>({
    sortField: 'Approvals_id',
    sortOrder: 'DESC',
    topCount: 10,
    skipCount: 0,
    approvalRecordFilters: [],
    approvalGroupFilters: [],
    approvalUserFilters: {
      requestersFilters: {
        tableName: 'Approval_Users',
        columnName: 'object_id',
        operator: '=',
        value: '[]',
        value_type: 'string_array'
      },
      approversFilters: {
        tableName: 'Approval_Users',
        columnName: 'object_id',
        operator: '=',
        value: '[]',
        value_type: 'string_array'
      }
    }
  });

  useEffect(() => {
    console.log('Filters updated in MyApprovals:', filters); // Debug log
  }, [filters]);

  return (
    <MyApprovalsTable
      filters={filters}
      setFilters={setFilters}
      userToken={userToken}
      accessToken={accessToken}
    />
  );
};