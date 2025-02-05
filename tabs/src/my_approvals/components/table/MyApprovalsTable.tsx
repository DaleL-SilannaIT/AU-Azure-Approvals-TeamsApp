import React, { useEffect, useState, useCallback } from 'react';
import { IColumn, SelectionMode, ShimmeredDetailsList } from '@fluentui/react';
import { ApprovalRecord } from '../../../../../api/src/database/interfaces/approvalRecord';
import { ApprovalRecordSet } from '../../../../../api/src/database/interfaces/approvalRecordSet';
import { Facepile, IFacepilePersona } from '@fluentui/react/lib/Facepile';
import { facepilePersonas } from '@fluentui/example-data';
import { MyApprovalsFilters } from '../filters/MyApprovalsFilters';
import './MyApprovalsTable.css';
import { CommunicationPersonFilled } from '@fluentui/react-icons';
import { ApprovalFilters } from '../../../../../api/src/database/interfaces/filters';
import { TeamsUserCredential } from '@microsoft/teamsfx';



const columns: IColumn[] = [
  { 
    key: 'Approvals_icon', 
    name: 'Icon', 
    fieldName: 'icon',  // Changed to match ApprovalRecord interface
    minWidth: 50, 
    maxWidth: 50,
    isResizable: true,
    // onRender(item: ApprovalRecord) {
    //   return <img src={item.icon} alt="Approval Icon" style={{ width: '51px', height: '51px' }} />;
    // }
  },
  { key: 'Approvals_id', name: 'Id', fieldName: 'id', minWidth: 50, isSorted: true, isSortedDescending: true, sortAscendingAriaLabel: 'Sorted Small to Large', sortDescendingAriaLabel: 'Sorted Large to Small' },
  { key: 'Approvals_title', name: 'Title', fieldName: 'title', minWidth: 100 },
  { key: 'Approvals_subject', name: 'Subject', fieldName: 'subject', minWidth: 100 },
  { key: 'Approvals_outcome', name: 'Outcome', fieldName: 'outcome', minWidth: 100 },
  { key: 'Approvals_entity_name', name: 'Entity Name', fieldName: 'entity_name', minWidth: 100 },
  { key: 'Approvals_created_datetime', name: 'Created Date', fieldName: 'created_datetime', minWidth: 150 },
  //{ key: 'facepile', name: 'FacePile', fieldName: 'facepile', minWidth: 150, onRender: (item: ApprovalRecord) => <Facepile personas={facepilePersonas.slice(0, 3)} maxDisplayablePersonas={3} /> }
];

const onRenderItemColumn = (item?: ApprovalRecordSet, index?: number, column?: IColumn): React.ReactNode => {
  if (!item || !column?.key) {
    return null;
  }

  // Special handling for icon column
  if (column.key === 'Approvals_icon') {
    return (
      <img 
        src={item.Approvals_icon} 
        alt="Approval Icon" 
        style={{ width: '51px', height: '51px' }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = '/default-icon.png';
        }}
      />
    );
  }

  // Default handling for other columns
  return item[column.key as keyof ApprovalRecordSet];
};

interface MyApprovalsTableProps {
  filters: ApprovalFilters;
  setFilters: (filters: ApprovalFilters) => void;
  userToken: string | undefined;  // Add userToken to props
}

export const MyApprovalsTable: React.FunctionComponent<MyApprovalsTableProps> = ({ 
  filters, 
  setFilters, 
  userToken 
}) => {
  const [items, setItems] = useState<ApprovalRecordSet[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filters: ApprovalFilters) => {
    if (!userToken) {
      console.log('No userToken available, aborting fetch');
      return;
    }

    console.log('Starting fetch with filters:', filters); // Debug log
    setLoading(true);
    
    try {
      const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
      let formData = new FormData();
      
      // Append non-array filters
      (Object.keys(filters) as (keyof ApprovalFilters)[]).forEach(key => {
        if (!Array.isArray(filters[key])) {
          formData.append(key, filters[key] as string);
          console.log(`Adding filter: ${key}=${filters[key]}`); // Debug log
        }
      });

      // Append array filters as JSON strings
      formData.append('approvalRecordFilters', JSON.stringify(filters.approvalRecordFilters));
      formData.append('approvalGroupFilters', JSON.stringify(filters.approvalGroupFilters));
      formData.append('approvalUserFilters', JSON.stringify(filters.approvalUserFilters));

      console.log('record filters length', filters.approvalRecordFilters.length)
      console.log('Stringified record filters', JSON.stringify(filters.approvalRecordFilters))
      let headers = new Headers();
      headers.append('token', userToken);

      // Debug: Log formatted data
      const formDataObj: Record<string, any> = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      console.table(formDataObj);
      
      const response = await fetch(`${endpoint}/api/data`, {
        method: 'POST',
        body: formData,
        headers: headers
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApprovalRecordSet[] = await response.json();
      console.log('Fetched data:', data); // Debug log
      
      if (!data || data.length === 0) {
        console.log('No data returned'); // Debug log
        setItems([]);
      } else {
        setItems(data);
      }

    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setItems([]); // Set empty array on error
    } finally {
      console.log('Fetch complete, setting loading false'); // Debug log
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    if (userToken) {
      console.log('Filters changed, fetching data:', filters); // Debug log
      fetchData(filters);
    }
  }, [filters, userToken, fetchData]);

  return (
    <div className='table-container'>
      <div className="my-approvals-filters-container">
        <MyApprovalsFilters 
          filters={filters}
          onApplyFilters={setFilters}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <ShimmeredDetailsList
        setKey="items"
        items={items || []}
        columns={columns}
        selectionMode={SelectionMode.none}
        enableShimmer={loading}
        ariaLabelForShimmer="Content is being fetched"
        ariaLabelForGrid="Item details"
        onRenderItemColumn={onRenderItemColumn}
      />
    </div>
  );
};