import { useState, useContext, useEffect } from 'react';
import { TeamsFxContext } from '../common/Context';
import { MyApprovalsTable } from './components/table/MyApprovalsTable';
import { ApprovalFilters } from '../../../api/src/database/interfaces/filters';

export const MyApprovals: React.FC = () => {
  const { userToken } = useContext(TeamsFxContext);
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const [filters, setFilters] = useState<ApprovalFilters>({
    sortField: 'id',
    sortOrder: 'DESC',
    topCount: 100,
    skipCount: 0,
    approvalRecordFilters: [],
    approvalGroupFilters: [],
    approvalUserFilters: []
  });

  useEffect(() => {
    console.log('Filters updated in MyApprovals:', filters); // Debug log
  }, [filters]);

  return (
    <div className="my-approvals">
      <MyApprovalsTable 
        filters={filters}
        setFilters={setFilters}
        userToken={userToken}
      />
    </div>
  );
};