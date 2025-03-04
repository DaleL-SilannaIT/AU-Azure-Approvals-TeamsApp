import React, { useState, useCallback } from 'react';
import { DefaultButton, PrimaryButton, IconButton, Panel, TextField, Dropdown, SpinButton, Position, DatePicker as FluentDatePicker } from '@fluentui/react';
import { ApprovalFilters } from '../../../../../api/src/database/interfaces/filters';
import { SourceDropdown } from './controls/SourceDropdown';
import { RequestersDropdown } from './controls/RequestersDropdown';
import { ApproversDropdown } from './controls/ApproversDropdown';
import { AdvancedFiltersToggle } from './controls/AdvancedFiltersToggle';
import { IRequester, IApprover } from '../../services/Interfaces';
import { ApprovalRecord } from '../../../../../api/src/database/interfaces/approvalRecord';
import { ApprovalGroup } from '../../../../../api/src/database/interfaces/approvalGroup';
import { ApprovalUser } from '../../../../../api/src/database/interfaces/approvalUser';
import { DropdownMenuItemType, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';

const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
interface MyApprovalsFiltersProps {
  filters: ApprovalFilters;
  onApplyFilters: (filters: ApprovalFilters) => void;
  userToken: string;
  requesters: IRequester[];
  approvers: IApprover[];
}

export const MyApprovalsFilters: React.FC<MyApprovalsFiltersProps> = ({
  filters,
  onApplyFilters,
  userToken,
  requesters,
  approvers
}) => {
  const [advancedFilters, setAdvancedFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [idFilter, setIdFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [outcome, setOutcome] = useState<string[]>([]);
  const [entityName, setEntityName] = useState<string>('');
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [hasNotes, setHasNotes] = useState<boolean | undefined>(undefined);
  const [hasAttachments, setHasAttachments] = useState<boolean | undefined>(undefined);
  const [parentSource, setParentSource] = useState<string>('');
  const [childSource, setChildSource] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [sourceDropdownSelectedKeys, setSourceDropdownSelectedKeys] = useState<string[]>([]);
  const [requestersDropdownSelectedKeys, setRequestersDropdownSelectedKeys] = useState<string[]>([]);
  const [approversDropdownSelectedKeys, setApproversDropdownSelectedKeys] = useState<string[]>([]);

  const outcomeDropDownOptions = [
    { key: 'pending', text: 'Pending' },
    { key: 'approved', text: 'Approved' },
    { key: 'rejected', text: 'Rejected' },
    { key: 'cancelled', text: 'Cancelled' },
    { key: 'cancelledBySystem', text: 'Cancelled by System' }
  ];

  const updateFilters = useCallback((): ApprovalFilters => {
    const newFilters: ApprovalFilters = {
      sortField: "Approvals_id",
      sortOrder: 'DESC',
      topCount: 10,
      skipCount: 0,
      approvalRecordFilters: [],
      approvalGroupFilters: [],
      approvalUserFilters: {
        requestersFilters: {
          tableName: "Approval_Users",
          columnName: 'object_id',
          operator: '=',
          value: '[]',
          value_type: 'string_array'
        },
        approversFilters: {
          tableName: "Approval_Users",
          columnName: 'object_id',
          operator: '=',
          value: '[]',
          value_type: 'string_array'
        }
      }
    };

    // Add ID filter if present
    if (idFilter) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'id',
        operator: '=',
        value: idFilter,
        value_type: 'number'
      });
    }

    // Add date range filters if present
    if (fromDate) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'created_datetime',
        operator: '>=',
        value: fromDate.toISOString(),
        value_type: 'datetime'
      });
    }

    if (toDate) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'created_datetime',
        operator: '<=',
        value: toDate.toISOString(),
        value_type: 'datetime'
      });
    }

    if (title) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'title',
        operator: 'LIKE',
        value: `'%${title}%'`,
        value_type: 'string'
      });
    }

    if (subject) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'subject',
        operator: 'LIKE',
        value: `'%${subject}%'`,
        value_type: 'string'
      });
    }

    if (outcome && outcome.length > 0) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'outcome',
        operator: 'IN',
        value: `('${outcome.join('\',\'')}')`,
        value_type: 'string'
      });
    }

    if (entityName) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'entity_name',
        operator: 'LIKE',
        value: `'%${entityName}%'`,
        value_type: 'string'
      });
    }

    if (entityId) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'entity_id',
        operator: '=',
        value: entityId,
        value_type: 'number'
      });
    }

    if (active) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'active',
        operator: '=',
        value: active.toString(),
        value_type: 'boolean'
      });
    }

    if (hasNotes) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'has_notes',
        operator: '=',
        value: hasNotes.toString(),
        value_type: 'boolean'
      });
    }

    if (hasAttachments) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'has_attachments',
        operator: '=',
        value: hasAttachments.toString(),
        value_type: 'boolean'
      });
    }

    // Add source filters if any are selected
    if (sourceDropdownSelectedKeys.length > 0) {
      newFilters.approvalRecordFilters.push({
        tableName: 'Approvals',
        columnName: 'source_id',
        operator: '=',
        value: `[${sourceDropdownSelectedKeys.join(',')}]`,
        value_type: 'number_array',
        join_operator: 'OR'
      });
    }

    if (requestersDropdownSelectedKeys.length > 0) {
      newFilters.approvalUserFilters.requestersFilters = 
      {
        tableName: "Approval_Users",
        columnName: 'object_id',
        operator: '=',
        value: `["${requestersDropdownSelectedKeys.join('","')}"]`,
        value_type: 'string_array',
        join_operator: 'AND'
      };
    }

    if (approversDropdownSelectedKeys.length > 0) {
      newFilters.approvalUserFilters.approversFilters = 
      {
        tableName: "Approval_Users",
        columnName: 'object_id',
        operator: '=',
        value: `["${approversDropdownSelectedKeys.join('","')}"]`,
        value_type: 'string_array',
        join_operator: 'AND'
      };
    }

    return newFilters;
  }, [
    idFilter,
    fromDate,
    toDate,
    title,
    subject,
    outcome,
    entityName,
    entityId,
    active,
    hasNotes,
    hasAttachments,
    parentSource,
    childSource,
    sourceDropdownSelectedKeys,
    requestersDropdownSelectedKeys,
    approversDropdownSelectedKeys
  ]
  );

  const applyFilters = useCallback(() => {
    const newFilters = updateFilters();
    newFilters.skipCount = 0; // Reset skipCount
    console.log('Applying filters:', newFilters); // Debug log

    // Serialize the approvalUserFilters object
    const serializedApprovalUserFilters = JSON.stringify(newFilters.approvalUserFilters);
    console.log('Serialized approvalUserFilters:', serializedApprovalUserFilters);

    // Create a FormData object to send the filters
    const formData = new FormData();
    formData.append('sortField', newFilters.sortField);
    formData.append('sortOrder', newFilters.sortOrder);
    formData.append('topCount', newFilters.topCount.toString());
    formData.append('skipCount', newFilters.skipCount.toString());
    formData.append('approvalRecordFilters', JSON.stringify(newFilters.approvalRecordFilters));
    formData.append('approvalGroupFilters', JSON.stringify(newFilters.approvalGroupFilters));
    formData.append('approvalUserFilters', serializedApprovalUserFilters);
    formData.forEach((value, key) => {
      console.log(key, value)
    });

    // Send the filters to the API
    fetch(`${endpoint}/api/data`, {
      method: 'POST',
      headers: {
        'token': userToken
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then(data => {
      console.log('API response:', data);
      onApplyFilters(newFilters);
      setIsOpen(false);
    })
    .catch(error => {
      console.error('Error applying filters:', error);
    });
  }, [updateFilters, onApplyFilters, userToken]);

  const clearFilters = useCallback(() => {
    setIdFilter('');
    setFromDate(undefined);
    setToDate(undefined);
    setTitle('');
    setSubject('');
    setOutcome([]);
    setEntityName('');
    setEntityId('');
    setActive(undefined);
    setHasNotes(undefined);
    setHasAttachments(undefined);
    setParentSource('');
    setChildSource('');
    setSourceDropdownSelectedKeys([]);
    setRequestersDropdownSelectedKeys([]);
    setApproversDropdownSelectedKeys([]);

    const defaultFilters: ApprovalFilters = {
      sortField: "Approvals_id",
      sortOrder: 'DESC',
      topCount: 10,
      skipCount: 0,
      approvalRecordFilters: [],
      approvalGroupFilters: [],
      approvalUserFilters: {
        requestersFilters: {
            tableName: "Approval_Users",
            columnName: 'object_id',
            operator: '=',
            value: '[]',
            value_type: 'string_array'
        },
        approversFilters: {
            tableName: "Approval_Users",
            columnName: 'object_id',
            operator: '=',
            value: '[]',
            value_type: 'string_array'
        }
      }
    };

    // Serialize the approvalUserFilters object
    const serializedApprovalUserFilters = JSON.stringify(defaultFilters.approvalUserFilters);
    console.log('Serialized approvalUserFilters:', serializedApprovalUserFilters);
    // Create a FormData object to send the filters
    const formData = new FormData();
    formData.append('sortField', defaultFilters.sortField);
    formData.append('sortOrder', defaultFilters.sortOrder);
    formData.append('topCount', defaultFilters.topCount.toString());
    formData.append('skipCount', defaultFilters.skipCount.toString());
    formData.append('approvalRecordFilters', JSON.stringify(defaultFilters.approvalRecordFilters));
    formData.append('approvalGroupFilters', JSON.stringify(defaultFilters.approvalGroupFilters));
    formData.append('approvalUserFilters', serializedApprovalUserFilters);

    
    // Send the filters to the API
    fetch(`${endpoint}/api/data`, {
        method: 'POST',
        headers: {
            'token': userToken
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('API response:', data);
        defaultFilters.skipCount = 0;
        onApplyFilters(defaultFilters);
    })
    .catch(error => {
        console.error('Error clearing filters:', error);
    });
}, [onApplyFilters, userToken]);

  return (
    <div>
      <IconButton
        iconProps={{ iconName: 'Filter' }}
        onClick={() => setIsOpen(true)}
      />
      <Panel isOpen={isOpen} onDismiss={() => setIsOpen(false)} isLightDismiss={true}>
        {/* <AdvancedFiltersToggle
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
        /> */}
        <SpinButton
          label="Id"
          labelPosition={Position.top}
          value={idFilter}
          onChange={(e, id) => setIdFilter(id || '')}
        />
        <TextField
          label="Title"
          value={title}
          onChange={(e, title) => setTitle(title || '')}
        />
        <TextField
          label="Subject"
          value={subject}
          onChange={(e, subject) => setSubject(subject || '')}
        />
        <RequestersDropdown
          requesterSelectedKeys={requestersDropdownSelectedKeys}
          setRequesterSelectedKeys={setRequestersDropdownSelectedKeys}
          userToken={userToken}
          requesters={requesters}
        />
        <ApproversDropdown
          approversSelectedKeys={approversDropdownSelectedKeys}
          setApproversSelectedKeys={setApproversDropdownSelectedKeys}
          userToken={userToken}
          approvers={approvers}
        />
        <Dropdown
          label="Outcome"
          placeholder="Select outcome"
          selectedKeys={outcome}
          multiSelect
          options={outcomeDropDownOptions}
          onChange={(e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
            if (option) {
              setOutcome(
                option.selected
                  ? [...outcome, option.key as string]
                  : outcome.filter(key => key !== option.key)
              );
            }
          }}
        />
        <SourceDropdown
          sourceDropdownSelectedKeys={sourceDropdownSelectedKeys}
          setSourceDropdownSelectedKeys={setSourceDropdownSelectedKeys}
          userToken={userToken}
        />
        <TextField
          label="Entity Name"
          value={entityName}
          onChange={(e, entityName) => setEntityName(entityName || '')}
        />
        <FluentDatePicker
          label="From"
          value={fromDate}
          onSelectDate={(date) => setFromDate(date || undefined)}
        />
        <FluentDatePicker
          label="To"
          value={toDate}
          onSelectDate={(date) => setToDate(date || undefined)}
        />

        {/* Buttons to apply and clear */}
        <DefaultButton onClick={clearFilters} >
          Clear
        </DefaultButton>
        <PrimaryButton onClick={applyFilters} style={{ marginLeft: '8px', marginTop: '8px' }}>
          Apply
        </PrimaryButton>
      </Panel>
    </div>
  );
};