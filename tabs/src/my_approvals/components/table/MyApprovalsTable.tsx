import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { ApprovalFilters } from '../../../../../api/src/database/interfaces/filters';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Fabric } from '@fluentui/react/lib/Fabric';
import { DetailsListLayoutMode, Selection, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { MyApprovalsFilters } from '../filters/MyApprovalsFilters';
import { ShimmeredDetailsList } from '@fluentui/react';

const classNames = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px'
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden'
      }
    }
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px'
  },
  controlWrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  exampleToggle: {
    display: 'inline-block',
    marginBottom: '10px',
    marginRight: '30px'
  },
  selectionDetails: {
    marginBottom: '20px'
  }
});
const controlStyles = {
  root: {
    margin: '0 30px 20px 0',
    maxWidth: '300px'
  }
};

export interface IMyApprovalTableState {
  columns: IColumn[];
  items: IApproval[];
  selectionDetails: string;
  isModalSelection: boolean;
  isCompactMode: boolean;
  loading: boolean;
  error: string | null;
}

export interface IApproval {
  id: string;
  title: string;
  subject: string;
  outcome: string;
  entity_name: string;
  created_datetime: string;
  icon: string;
  groups: IGroup[];
}

export interface IGroup {
  Approval_Groups_id: number;
  Approval_Groups_title: string;
  users: IUser[];
}

export interface IUser {
  Approval_Users_id: number;
  Approval_Users_upn: string;
  Approval_Users_email: string;
  Approval_Users_display_name: string;
  Approval_Users_notes: string[];
}

interface IMyApprovalsTableProps {
  filters: ApprovalFilters;
  setFilters: (filters: ApprovalFilters) => void;
  userToken: string | undefined;
}

export class MyApprovalsTable extends React.Component<IMyApprovalsTableProps, IMyApprovalTableState> {
  private _selection: Selection;

  constructor(props: IMyApprovalsTableProps) {
    super(props);

    const columns: IColumn[] = [
      { 
        key: 'Approvals_icon', 
        name: 'Icon', 
        fieldName: 'icon',  // Changed to match ApprovalRecord interface
        minWidth: 50, 
        maxWidth: 50,
        isResizable: true,
        onRender: (item: IApproval) => (
          <img 
            src={item.icon} 
            alt="Approval Icon" 
            style={{ width: '51px', height: '51px' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = '/default-icon.png';
            }}
          />
        )
      },
      { key: 'Approvals_id', name: 'Id', fieldName: 'id', minWidth: 50, isSorted: true, isSortedDescending: true, sortAscendingAriaLabel: 'Sorted Small to Large', sortDescendingAriaLabel: 'Sorted Large to Small', onColumnClick: this._onColumnClick },
      { key: 'Approvals_title', name: 'Title', fieldName: 'title', minWidth: 100, onColumnClick: this._onColumnClick },
      { key: 'Approvals_subject', name: 'Subject', fieldName: 'subject', minWidth: 100, onColumnClick: this._onColumnClick },
      { key: 'Approvals_outcome', name: 'Outcome', fieldName: 'outcome', minWidth: 100, onColumnClick: this._onColumnClick },
      { key: 'Approvals_entity_name', name: 'Entity Name', fieldName: 'entity_name', minWidth: 100, onColumnClick: this._onColumnClick },
      { key: 'Approvals_created_datetime', name: 'Created Date', fieldName: 'created_datetime', minWidth: 150, onColumnClick: this._onColumnClick },
    ];

    this._selection = new Selection({
      onSelectionChanged: () => {
        this.setState({
          selectionDetails: this._getSelectionDetails()
        });
      }
    });

    this.state = {
      items: [],
      columns: columns,
      selectionDetails: this._getSelectionDetails(),
      isModalSelection: false,
      isCompactMode: false,
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchData(this.props.filters);
  }

  componentDidUpdate(prevProps: IMyApprovalsTableProps) {
    if (prevProps.filters !== this.props.filters || prevProps.userToken !== this.props.userToken) {
      this.fetchData(this.props.filters);
    }
  }

  fetchData = async (filters: ApprovalFilters) => {
    const { userToken } = this.props;

    if (!userToken) {
      console.log('No userToken available, aborting fetch');
      return;
    }

    console.log('Starting fetch with filters:', filters); // Debug log
    this.setState({ loading: true });

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

      const data: IApproval[] = await response.json();
      console.log('Fetched data:', data); // Debug log

      const formattedData = this.restructureData(data);
      console.log('Formatted data:', formattedData); // Debug log

      if (!formattedData || formattedData.length === 0) {
        console.log('No data returned'); // Debug log
        this.setState({ items: [] });
      } else {
        this.setState({ items: formattedData });
      }

    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      this.setState({ error: err instanceof Error ? err.message : 'An unknown error occurred', items: [] });
    } finally {
      console.log('Fetch complete, setting loading false'); // Debug log
      this.setState({ loading: false });
    }
  };

  restructureData = (data: any[]): IApproval[] => {
    const approvalsMap: { [key: string]: IApproval } = {};

    data.forEach(record => {
      if (!approvalsMap[record.Approvals_id]) {
        approvalsMap[record.Approvals_id] = {
          id: record.Approvals_id,
          title: record.Approvals_title,
          subject: record.Approvals_subject,
          outcome: record.Approvals_outcome,
          entity_name: record.Approvals_entity_name,
          created_datetime: record.Approvals_created_datetime,
          icon: record.Approvals_icon,
          groups: []
        };
      }

      const approval = approvalsMap[record.Approvals_id];

      let group = approval.groups.find(g => g.Approval_Groups_id === record.Approval_Groups_id);
      if (!group) {
        group = {
          Approval_Groups_id: record.Approval_Groups_id,
          Approval_Groups_title: record.Approval_Groups_title,
          users: []
        };
        approval.groups.push(group);
      }

      group.users.push({
        Approval_Users_id: record.Approval_Users_id,
        Approval_Users_upn: record.Approval_Users_upn,
        Approval_Users_email: record.Approval_Users_email,
        Approval_Users_display_name: record.Approval_Users_display_name,
        Approval_Users_notes: JSON.parse(record.Approval_Users_notes)
      });
    });

    return Object.values(approvalsMap);
  };

  private onRenderItemColumn = (item?: IApproval, index?: number, column?: IColumn): React.ReactNode => {
    if (!item || !column?.key) {
      return null;
    }

    // Special handling for icon column
    if (column.key === 'Approvals_icon') {
      return (
        <img 
          src={item.icon} 
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
    const fieldValue = item[column.fieldName as keyof IApproval];
    if (Array.isArray(fieldValue)) {
      return fieldValue.map(group => group.Approval_Groups_title).join(', ');
    }
    return fieldValue;
  };

  public render() {
    const { columns, isCompactMode, items, selectionDetails, isModalSelection, loading, error } = this.state;
    const { filters, setFilters } = this.props;

    return (
      <Fabric>
        <div className="my-approvals-filters-container">
          <MyApprovalsFilters 
            filters={filters}
            onApplyFilters={setFilters}
          />
        </div>
        {error && <div className="error">{error}</div>}
        {/* <div className={classNames.controlWrapper}>
          <Toggle
            label="Enable compact mode"
            checked={isCompactMode}
            onChange={this._onChangeCompactMode}
            onText="Compact"
            offText="Normal"
            styles={controlStyles}
          />
          <Toggle
            label="Enable modal selection"
            checked={isModalSelection}
            onChange={this._onChangeModalSelection}
            onText="Modal"
            offText="Normal"
            styles={controlStyles}
          />
          <TextField label="Filter by name:" onChange={this._onChangeText} styles={controlStyles} />
        </div>
        <div className={classNames.selectionDetails}>{selectionDetails}</div> */}
        <MarqueeSelection selection={this._selection}>
          <ShimmeredDetailsList
            items={items}
            compact={isCompactMode}
            columns={columns}
            selectionMode={isModalSelection ? SelectionMode.multiple : SelectionMode.none}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            selection={this._selection}
            selectionPreservedOnEmptyClick={true}
            onItemInvoked={this._onItemInvoked}
            enterModalSelectionOnTouch={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="Row checkbox"
            enableShimmer={loading}
            onRenderItemColumn={this.onRenderItemColumn}
          />
        </MarqueeSelection>
      </Fabric>
    );
  }

  private _onChangeCompactMode = (ev: React.MouseEvent<HTMLElement>, checked?: boolean): void => {
    this.setState({ isCompactMode: !!checked });
  };

  private _onChangeModalSelection = (ev: React.MouseEvent<HTMLElement>, checked?: boolean): void => {
    this.setState({ isModalSelection: checked! });
  };

  private _onChangeText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState({
      items: newValue ? this.state.items.filter(i => i.title.toLowerCase().indexOf(newValue) > -1) : this.state.items
    });
  };

  private _onItemInvoked(item: any): void {
    alert(`Item invoked: ${item.title}`);
  }

  private _getSelectionDetails(): string {
    const selectionCount = this._selection.getSelectedCount();

    switch (selectionCount) {
      case 0:
        return 'No items selected';
      case 1:
        return '1 item selected: ' + (this._selection.getSelection()[0] as IApproval).title;
      default:
        return `${selectionCount} items selected`;
    }
  }

  private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns, items } = this.state;
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
    this.setState({
      columns: newColumns,
      items: newItems
    });
  };
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
  const key = columnKey as keyof T;
  return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}

export default MyApprovalsTable;