import React, { useEffect, useState } from 'react';
import { IColumn, SelectionMode, ShimmeredDetailsList } from '@fluentui/react';
import { ApprovalRecord } from '../../../../../api/src/database/interfaces/approvalRecord';
// import { Facepile, IFacepilePersona } from '@fluentui/react/lib/Facepile';
// import { facepilePersonas } from '@fluentui/example-data';
import { FacepileOverflowExample } from '../face_pile/FacePile';
import './MyApprovalsTable.css';

const columns: IColumn[] = [
  { key: 'icon', name: 'Icon', fieldName: 'icon', minWidth: 50, maxWidth: 50, onRender: (item: ApprovalRecord) => <img src={item.icon} alt="Icon" style={{ width: '50px', height: '50px' }} /> },
  { key: 'id', name: 'Id', fieldName: 'id', minWidth: 50 },
  { key: 'facepile', name: 'FacePile', fieldName: 'facepile', minWidth: 150, onRender: (item: ApprovalRecord) => <FacepileOverflowExample /> },
  { key: 'title', name: 'Title', fieldName: 'title', minWidth: 100 },
  { key: 'subject', name: 'Subject', fieldName: 'subject', minWidth: 100 },
  { key: 'outcome', name: 'Outcome', fieldName: 'outcome', minWidth: 100 },
  { key: 'entity_name', name: 'Entity Name', fieldName: 'entity_name', minWidth: 100 },
  { key: 'created_datetime', name: 'Created Date', fieldName: 'created_datetime', minWidth: 150 },
  
];

const onRenderItemColumn = (item?: ApprovalRecord, index?: number, column?: IColumn): React.ReactNode => {
  if (!item || !column?.key) {
    return null;
  }

  if (column.key === 'facepile') {
    return <FacepileOverflowExample />;
  }

  return item[column.key as keyof ApprovalRecord];
};

export const MyApprovalsTable: React.FunctionComponent = () => {
  const [items, setItems] = useState<ApprovalRecord[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
        console.log("endpoint", endpoint);
        const response = await fetch(`${endpoint}/api/data`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApprovalRecord[] = await response.json();
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

    fetchData();
  }, []);

  return (
    <div className='table-container'>
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