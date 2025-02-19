import * as React from 'react';
import jwtDecode from 'jwt-decode';
import { TextField } from '@fluentui/react/lib/TextField';
import { ApprovalFilters } from '../../../../../api/src/database/interfaces/filters';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Fabric } from '@fluentui/react/lib/Fabric';
import { DetailsListLayoutMode, Selection, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { MyApprovalsFilters } from '../filters/MyApprovalsFilters';
import { ShimmeredDetailsList } from '@fluentui/react';
import { Facepile, OverflowButtonType, IFacepilePersona } from '@fluentui/react/lib/Facepile';
import { PersonaPresence, PersonaSize } from '@fluentui/react/lib/Persona';
import { fetchPhotosForApproval, fetchUserPhoto} from '../../services/userPhotos';
import { fetchUserPresence } from '../../services/userPresence';
import { IMyApprovalTableState, IApproval, IGroup, IUser, IMyApprovalsTableProps, IUserPresence, IDecodedToken} from '../../services/Interfaces';
import { fetchData } from '../../services/fetchData';

const MemoizedFacepile = React.memo(({ 
  item, 
  photos, 
  presence, 
  overflowButtonProps 
}: { 
  item: IApproval;
  photos: { [upn: string]: string | undefined };
  presence: { [objectId: string]: PersonaPresence };
  overflowButtonProps: any;
}) => {
  return (
    <Facepile
      personas={item.approval_members}
      maxDisplayablePersonas={3}
      overflowButtonType={OverflowButtonType.descriptive}
      overflowButtonProps={overflowButtonProps}
      personaSize={PersonaSize.size32}
      getPersonaProps={(persona: IFacepilePersona) => ({
        text: persona.personaName,
        secondaryText: persona.data.upn as string,
        size: PersonaSize.size32,
        presence: presence[persona.data.objectId as string] || PersonaPresence.none,
        imageShouldFadeIn: true,
        imageUrl: photos[persona.data.upn as string],
        initialsColor: persona.initialsColor,
        imageInitials: !photos[persona.data.upn as string] ? 
          persona.personaName?.split(' ').map((name: string) => name[0]).join('') : 
          undefined,
      })}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to determine if re-render is needed
  return (
    prevProps.photos === nextProps.photos && 
    prevProps.presence === nextProps.presence &&
    prevProps.item.approval_members === nextProps.item.approval_members
  );
});

export class MyApprovalsTable extends React.Component<IMyApprovalsTableProps, IMyApprovalTableState> {
  private _selection: Selection;
  private userId: string | undefined;

  constructor(props: IMyApprovalsTableProps) {
    super(props);

    // Decode the user token to extract the user ID
    if (props.userToken) {
      const decodedToken: any = jwtDecode(props.userToken);
      this.userId = decodedToken.oid; // Assuming the user ID is in the 'oid' claim
    }

    const overflowButtonProps = {
      ariaLabel: 'More users',
      onClick: (ev: React.MouseEvent<HTMLButtonElement>) => alert('overflow icon clicked'),
    };

    const columns: IColumn[] = [
      {
        key: 'Approvals_icon',
        name: 'Icon',
        fieldName: 'icon',  // Changed to match ApprovalRecord interface
        minWidth: 51,
        maxWidth: 51,
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
      { key: 'Approvals_id', name: 'Id', fieldName: 'id', minWidth: 100, maxWidth: 100, isResizable: true, isSorted: true, isSortedDescending: true, sortAscendingAriaLabel: 'Sorted Small to Large', sortDescendingAriaLabel: 'Sorted Large to Small', onColumnClick: this._onColumnClick },
      { key: 'Approvals_title', name: 'Title', fieldName: 'title', minWidth: 100, maxWidth: 100, isResizable: true, onColumnClick: this._onColumnClick },
      { key: 'Approvals_subject', name: 'Subject', fieldName: 'subject', minWidth: 100, maxWidth: 100, isResizable: true, onColumnClick: this._onColumnClick },
      { key: 'Approvals_outcome', name: 'Outcome', fieldName: 'outcome', minWidth: 100, maxWidth: 100, isResizable: true, onColumnClick: this._onColumnClick },
      { key: 'Approvals_entity_name', name: 'Entity Name', fieldName: 'entity_name', minWidth: 100, maxWidth: 100, isResizable: true, onColumnClick: this._onColumnClick },
      { key: 'Approvals_created_datetime', name: 'Created Date', fieldName: 'created_datetime', minWidth: 100, maxWidth: 100, isResizable: true, onColumnClick: this._onColumnClick },
      {
        key: 'Approval_members',
        name: 'Approval Members',
        fieldName: 'approval_members',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        onRender: (item: IApproval) => (
          <MemoizedFacepile
            item={item}
            photos={this.state.photos}
            presence={this.state.presence}
            overflowButtonProps={overflowButtonProps}
          />
        )
      },
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
      error: null,
      photos: {}, // Add this line
      presence: {}
    };
  }

  componentDidMount() {
    this.handleFetchData(this.props.filters);
  }

  componentDidUpdate(prevProps: IMyApprovalsTableProps, prevState: IMyApprovalTableState) {
    if (prevProps.filters !== this.props.filters || prevProps.userToken !== this.props.userToken) {
      this.handleFetchData(this.props.filters);
      return;
    }

    // Check if items have changed but not due to a filter change
    if (prevState.items !== this.state.items && 
        prevProps.filters === this.props.filters) {
      console.log('Items changed, updating profiles');
      this.updateUserProfiles(this.state.items); // Pass all items at once
    }
  }

  private handleFetchData = async (filters: ApprovalFilters) => {
    if (!this.props.userToken) return;

    await fetchData({
      userToken: this.props.userToken,
      filters,
      onStateUpdate: (updates) => {
        this.setState(prevState => ({
          ...prevState,
          ...updates
        }));
      }
    });
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
    
    // Handle groups array
    if (column.fieldName === 'groups' && Array.isArray(fieldValue)) {
      return (fieldValue as IGroup[])
        .map(group => group.Approval_Groups_id)
        .join(', ');
    }

    // Handle approval_members array
    if (column.fieldName === 'approval_members' && Array.isArray(fieldValue)) {
      return null; // The Facepile component is rendered through the column's onRender property
    }

    // Convert any non-string values to string representation
    if (typeof fieldValue === 'object') {
      return JSON.stringify(fieldValue);
    }

    // Return the field value as string for primitive types
    return String(fieldValue);
  };


  private async updateUserProfiles(approvals: IApproval[]): Promise<void> {
    if (!this.props.accessToken || !this.props.userToken) {
      console.log('No tokens available, skipping profile updates');
      return;
    }
  
    try {
      // Create sets of distinct user identifiers
      const distinctUserIds = new Set<string>();
      const distinctUpns = new Set<string>();
      
      // Collect distinct users across all approvals
      approvals.forEach(approval => {
        approval.approval_members.forEach(member => {
          if (member.data.objectId) {
            distinctUserIds.add(member.data.objectId);
          }
          if (member.data.upn) {
            distinctUpns.add(member.data.upn);
          }
        });
      });
  
      console.log(`Found ${distinctUserIds.size} distinct users`);
  
      // Track updates to trigger a single re-render
      let hasUpdates = false;
  
      // Batch fetch presence for all distinct users
      if (distinctUserIds.size > 0) {
        console.log('Fetching presence for distinct users:', Array.from(distinctUserIds));
        const presenceMap = await fetchUserPresence(Array.from(distinctUserIds), this.props.userToken);
        
        if (presenceMap.size > 0) {
          hasUpdates = true;
          this.setState(prevState => ({
            presence: {
              ...prevState.presence,
              ...Object.fromEntries(presenceMap)
            }
          }));
        }
      }
  
      // Batch fetch photos for all distinct users
      const photoPromises = Array.from(distinctUpns).map(async upn => {
        if (!this.state.photos[upn]) {
          const photoUrl = await fetchUserPhoto(upn, this.props.userToken);
          return { upn, photoUrl };
        }
        return null;
      });
  
      const photoResults = await Promise.all(photoPromises);
      const newPhotos = photoResults.reduce((acc, result) => {
        if (result && result.photoUrl) {
          hasUpdates = true;
          acc[result.upn] = result.photoUrl;
        }
        return acc;
      }, {} as { [upn: string]: string });
  
      if (Object.keys(newPhotos).length > 0) {
        this.setState(prevState => ({
          photos: {
            ...prevState.photos,
            ...newPhotos
          }
        }));
      }
  
    } catch (error) {
      console.error('Error updating user profiles:', error);
    }
  }
  

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
