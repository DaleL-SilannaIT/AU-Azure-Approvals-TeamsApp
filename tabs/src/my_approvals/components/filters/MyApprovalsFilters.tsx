import { defaultDatePickerStrings, mergeStyleSets, DatePicker as FluentDatePicker, SpinButton, ISpinButtonStyles, Position, DefaultButton, PrimaryButton, IconButton, Panel, TextField, Dropdown } from '@fluentui/react';
import { onFormatDate, onParseDateFromString } from './controls/DatePicker';
import { useState, useCallback, useEffect } from 'react';
import { ApprovalFilters, ApprovalRecordFilters, ApprovalGroupFilters, ApprovalUserFilters } from '../../../../../api/src/database/interfaces/filters';
import { ApprovalRecord } from '../../../../../api/src/database/interfaces/approvalRecord';
import { ApprovalGroup } from '../../../../../api/src/database/interfaces/approvalGroup';
import { ApprovalUser } from '../../../../../api/src/database/interfaces/approvalUser';
import { DropdownMenuItemType, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import { SourceDropdown } from './controls/SourceDropdown';

interface MyApprovalsFiltersProps {
  filters: ApprovalFilters;
  onApplyFilters: (filters: ApprovalFilters) => void;
}



export const MyApprovalsFilters: React.FC<MyApprovalsFiltersProps> = ({
  filters,
  onApplyFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [idFilter, setIdFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [outcome, setOutcome] = useState<string>('');
  const [entityName, setEntityName] = useState<string>('');
  const [requesters, setRequesters] = useState<string[]>([]);
  const [approvers, setApprovers] = useState<string[]>([]);
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [hasNotes, setHasNotes] = useState<boolean | undefined>(undefined);
  const [hasAttachments, setHasAttachments] = useState<boolean | undefined>(undefined);
  const [parentSource, setParentSource] = useState<string>('');
  const [childSource, setChildSource] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [sourceDropdownSelectedKeys, setSourceDropdownSelectedKeys] = useState<string[]>([]);


  const updateFilters = useCallback((): ApprovalFilters => {
    const newFilters: ApprovalFilters = {
      sortField: 'id',
      sortOrder: 'DESC',
      topCount: 100,
      skipCount: 0,
      approvalRecordFilters: [],
      approvalGroupFilters: [],
      approvalUserFilters: []
    };

    // Add ID filter if present
    if (idFilter) {
      newFilters.approvalRecordFilters.push({
        columnName: 'id',
        operator: '=',
        value: idFilter,
        value_type: 'number'
      });
    }

    // Add date range filters if present
    if (fromDate) {
      newFilters.approvalRecordFilters.push({
        columnName: 'created_datetime',
        operator: '>=',
        value: fromDate.toISOString(),
        value_type: 'datetime'
      });
    }

    if (toDate) {
      newFilters.approvalRecordFilters.push({
        columnName: 'created_datetime',
        operator: '<=',
        value: toDate.toISOString(),
        value_type: 'datetime'
      });
    }

    if (title) {
      newFilters.approvalRecordFilters.push({
        columnName: 'title',
        operator: 'LIKE',
        value: `'%${title}%'`,
        value_type: 'string'
      });
    }

    if (subject) {
      newFilters.approvalRecordFilters.push({
        columnName: 'subject',
        operator: 'LIKE',
        value: `'%${subject}%'`,
        value_type: 'string'
      });
    }

    if (outcome) {
      newFilters.approvalRecordFilters.push({
        columnName: 'outcome',
        operator: 'LIKE',
        value: `'%${outcome}%'`,
        value_type: 'string'
      });
    }

    if (entityName) {
      newFilters.approvalRecordFilters.push({
        columnName: 'entity_name',
        operator: 'LIKE',
        value: `'%${entityName}%'`,
        value_type: 'string'
      });
    }

    if (entityId) {
      newFilters.approvalRecordFilters.push({
        columnName: 'entity_id',
        operator: '=',
        value: entityId,
        value_type: 'number'
      });
    }

    if (active) {
      newFilters.approvalRecordFilters.push({
        columnName: 'active',
        operator: '=',
        value: active.toString(),
        value_type: 'boolean'
      });
    }

    if (hasNotes) {
      newFilters.approvalRecordFilters.push({
        columnName: 'has_notes',
        operator: '=',
        value: hasNotes.toString(),
        value_type: 'boolean'
      });
    }

    if (hasAttachments) {
      newFilters.approvalRecordFilters.push({
        columnName: 'has_attachments',
        operator: '=',
        value: hasAttachments.toString(),
        value_type: 'boolean'
      });
    }

    // Add source filters if any are selected
    if (sourceDropdownSelectedKeys.length > 0) {
      newFilters.approvalRecordFilters.push({
        columnName: 'source_id',
        operator: '=',
        value: sourceDropdownSelectedKeys.join(','),
        value_type: 'number_array'
      });
    }

    return newFilters;
  }, [idFilter, fromDate, toDate, title, subject, outcome, entityName, entityId, active, hasNotes, hasAttachments, parentSource, childSource, sourceDropdownSelectedKeys]);

  const applyFilters = useCallback(() => {
    const newFilters = updateFilters();
    console.log('Applying filters:', newFilters); // Debug log
    onApplyFilters(newFilters);
    setIsOpen(false);
  }, [updateFilters, onApplyFilters]);

  const clearFilters = useCallback(() => {
    setIdFilter('');
    setFromDate(undefined);
    setToDate(undefined);
    setTitle('');
    setSubject('');
    setOutcome('');
    setEntityName('');
    setEntityId('');
    setActive(undefined);
    setHasNotes(undefined);
    setHasAttachments(undefined);
    setParentSource('');
    setChildSource('');
    setSourceDropdownSelectedKeys([]); // Add this line

    onApplyFilters({
      sortField: 'id',
      sortOrder: 'DESC',
      topCount: 100,
      skipCount: 0,
      approvalRecordFilters: [],
      approvalGroupFilters: [],
      approvalUserFilters: []
    });
  }, [onApplyFilters]);



  return (
    <div>
      <IconButton
        iconProps={{ iconName: 'Filter' }}
        onClick={() => setIsOpen(true)}
      />
      <Panel isOpen={isOpen} onDismiss={() => setIsOpen(false)} isLightDismiss={true}>
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
        <TextField
          label="Outcome"
          value={outcome}
          onChange={(e, outcome) => setOutcome(outcome || '')}
        />
        <SourceDropdown
          sourceDropdownSelectedKeys={sourceDropdownSelectedKeys}
          setSourceDropdownSelectedKeys={setSourceDropdownSelectedKeys}
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