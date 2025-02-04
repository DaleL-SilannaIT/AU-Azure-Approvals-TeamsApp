import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { Panel } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { defaultDatePickerStrings, mergeStyleSets, DatePicker as FluentDatePicker, SpinButton, ISpinButtonStyles, Position, DefaultButton } from '@fluentui/react';
import { onFormatDate, onParseDateFromString } from './controls/DatePicker';
import { useState } from 'react';
import { ApprovalFilters, ApprovalRecordFilters, ApprovalGroupFilters, ApprovalUserFilters } from '../../../../../api/src/database/interfaces/filters';
import { ApprovalRecord } from '../../../../../api/src/database/interfaces/approvalRecord';
import { ApprovalGroup } from '../../../../../api/src/database/interfaces/approvalGroup';
import { ApprovalUser } from '../../../../../api/src/database/interfaces/approvalUser';

interface MyApprovalsFiltersProps {
  filters: ApprovalFilters;
  onApplyFilters: (filters: ApprovalFilters) => void;
}

export const MyApprovalsFilters: React.FC<MyApprovalsFiltersProps> = ({ filters, onApplyFilters }) => {
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

  const IdStyles: Partial<ISpinButtonStyles> = { spinButtonWrapper: { width: 75 } };

  const onApply = () => {
    onApplyFilters(filters);
    dismissPanel();
  };

  const addApprovalRecordFilter = (columnName: keyof ApprovalRecord, value: string, operator: '=' | '!=' | '>' | '<' | '>=' | '<=', valueType: 'number' | 'string' | 'boolean' | 'datetime') => {
    const newFilter: ApprovalRecordFilters = {
      columnName,
      operator,
      value,
      value_type: valueType
    };
  };

  const styles = mergeStyleSets({
      root: { selectors: { '> *': { marginBottom: 15 } } },
      control: { maxWidth: 300, marginBottom: 15 },
  });

  return (
    <div>
      <IconButton
        iconProps={{ iconName: 'Filter' }}
        title="Open Filters"
        ariaLabel="Open Filters"
        onClick={openPanel}
      />
      <Panel
        headerText="Filters"
        isOpen={isOpen}
        onDismiss={dismissPanel}
        isLightDismiss
        closeButtonAriaLabel="Close"
      >
        <form>
          <div>
            <SpinButton
              label="Id"
              labelPosition={Position.top}
              defaultValue=""
              min={0}
              max={100}
              step={1}
              incrementButtonAriaLabel="Increase value by 1"
              decrementButtonAriaLabel="Decrease value by 1"
              styles={IdStyles}
              onChange={(e, newValue) => {
                if (newValue) {
                  addApprovalRecordFilter('id', newValue, '=', 'number');
                }
              }}
            />
          </div>
          <div>
            <div>
              <FluentDatePicker
                label="From"
                allowTextInput
                ariaLabel="Select a date. Input format is day slash month slash year."
                //value={localFilters.fromDate || undefined}
                onSelectDate={(fromDate) => {
                  if (fromDate) {
                    addApprovalRecordFilter(
                      'created_datetime',
                      fromDate.toISOString(),
                      '>=',
                      'datetime'
                    );
                  }
                }}
                formatDate={onFormatDate}
                parseDateFromString={onParseDateFromString}
                className={styles.control}
                strings={defaultDatePickerStrings}
              />
              <FluentDatePicker
                label="To"
                allowTextInput
                ariaLabel="Select a date. Input format is day slash month slash year."
                //value={localFilters.toDate || undefined}
                onSelectDate={(toDate) => {
                  if (toDate) {
                    addApprovalRecordFilter(
                      'created_datetime',
                      toDate.toISOString(),
                      '<=',
                      'datetime'
                    );
                  }
                }}
                formatDate={onFormatDate}
                parseDateFromString={onParseDateFromString}
                className={styles.control}
                strings={defaultDatePickerStrings}
              />
            </div>
            <div>
              <Toggle
                label="Active"
                defaultChecked
                onText="Yes"
                offText="No"
                onChange={(ev, checked = false) => {
                  if (checked !== undefined) {
                    addApprovalRecordFilter(
                      'active',
                      checked.toString(),
                      '=',
                      'boolean'
                    );
                  }
                }}
              />
            </div>
          </div>
          <div>
            <DefaultButton text="Apply" onClick={onApply} />
          </div>
        </form>
      </Panel>
    </div>
  );
};