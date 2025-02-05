import { defaultDatePickerStrings, mergeStyleSets, DatePicker as FluentDatePicker, SpinButton, ISpinButtonStyles, Position, DefaultButton, PrimaryButton, IconButton, Panel } from '@fluentui/react';
import { onFormatDate, onParseDateFromString } from './controls/DatePicker';
import { useState, useCallback, useEffect } from 'react';
import { ApprovalFilters, ApprovalRecordFilters, ApprovalGroupFilters, ApprovalUserFilters } from '../../../../../api/src/database/interfaces/filters';
import { ApprovalRecord } from '../../../../../api/src/database/interfaces/approvalRecord';
import { ApprovalGroup } from '../../../../../api/src/database/interfaces/approvalGroup';
import { ApprovalUser } from '../../../../../api/src/database/interfaces/approvalUser';

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

    return newFilters;
  }, [idFilter, fromDate, toDate]);

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
          onChange={(e, newValue) => setIdFilter(newValue || '')}
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
        <DefaultButton onClick={clearFilters} >
          Clear
        </DefaultButton>
        <PrimaryButton onClick={applyFilters} style={{ marginLeft: '8px' }}>
          Apply
        </PrimaryButton>
      </Panel>
    </div>
  );
};