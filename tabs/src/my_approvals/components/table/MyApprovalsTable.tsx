import React, { useEffect, useState } from 'react';
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
    maxWidth: 50
    // onRender(item: ApprovalRecord) {
    //   return <img src={item.icon} alt="Approval Icon" style={{ width: '51px', height: '51px' }} />;
    // }
  },
  { key: 'Approvals_id', name: 'Id', fieldName: 'id', minWidth: 50 },
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
    console.log('AVAILALBE ICON: ', item);
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
  userToken  // Receive userToken from props
}) => {
  const [items, setItems] = useState<ApprovalRecordSet[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Remove useContext since we're getting userToken from props
  // const { userToken } = useContext(TeamsFxContext);

  useEffect(() => {
    console.log('Component mounted/updated, userToken:', userToken);
  }, [userToken]);

  const fetchData = async (filters: any) => {
    // console.log('fetchData called, current userToken:', userToken);
    // console.log('userToken type:', typeof userToken);
    // console.log('userToken value:', userToken || 'undefined');
    // console.log('Fetching data with filters:', filters); // Debugging log
    if (!userToken) {
      console.log('No userToken available, aborting fetch');
      return;
    }

    setLoading(true);
    try {
      
      const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
      const formData = new FormData();
      Object.keys(filters).forEach(key => {
        formData.append(key, filters[key]);
       
      });

      console.log('pre form data:', formData); // Debugging log
 
      let headers = new Headers();
      headers.append('token', userToken ? userToken : '');
      console.log('Sending request with token:', userToken);

      const response = await fetch(`${endpoint}/api/data`, {
        method: 'POST',
        body: formData,
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApprovalRecordSet[] = await response.json();
      console.log('Fetched data:', data); // Debugging log
      setItems(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchData(filters);
    } else {
      console.log('Waiting for userToken before fetching...');
    }
  }, [filters, userToken]);

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