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
import { fetchPhotosForApproval } from '../../services/userPhotos';
import { fetchUserPresence } from '../../services/userPresence';
import { IMyApprovalTableState, IApproval, IGroup, IUser, IMyApprovalsTableProps, IUserPresence, IDecodedToken} from '../../services/Interfaces';


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
        fieldName: 'approval_members',  // Changed to match ApprovalRecord interface
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        onRender: (item: IApproval) => (
          <Facepile
            personas={item.approval_members}
            maxDisplayablePersonas={3}
            overflowButtonType={OverflowButtonType.descriptive}
            overflowButtonProps={overflowButtonProps}
            personaSize={PersonaSize.size32}
            ariaDescription={'To move through the items use left and right arrow keys.'}
            ariaLabel={'Example list of Facepile personas'}
            getPersonaProps={(persona: IFacepilePersona) => ({
              text: persona.personaName,
              secondaryText: persona.data.upn as string,
              size: PersonaSize.size32,
              presence: this.state.presence[persona.data.objectId as string] || PersonaPresence.offline,
              imageShouldFadeIn: true,
              imageUrl: this.state.photos[persona.data.upn as string],
              initialsColor: persona.initialsColor,
              imageInitials: persona.personaName ? persona.personaName.split(' ').map((name: string) => name[0]).join('') : '',
            })}
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
    this.fetchData(this.props.filters);
  }

  componentDidUpdate(prevProps: IMyApprovalsTableProps, prevState: IMyApprovalTableState) {
    // Check if filters or token changed
    if (prevProps.filters !== this.props.filters || prevProps.userToken !== this.props.userToken) {
      this.fetchData(this.props.filters);
      return; // Exit early to prevent double updates
    }

    // Check if items have changed but not due to a filter change
    if (prevState.items !== this.state.items && 
        prevProps.filters === this.props.filters) {
      console.log('Items changed, updating profiles');
      this.state.items.forEach(item => {
        this.updateUserProfiles(item);
      });
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
        this.setState({ items: [] });
      } else {
        this.setState({ items: formattedData }, async () => {
          // After state is updated, fetch presence for all users
          const objectIds = new Set<string>();
          formattedData.forEach(item => {
            item.approval_members.forEach(member => {
              if (member.data.objectId) {
                objectIds.add(member.data.objectId as string);
              }
            });
          });

          if (objectIds.size > 0) {
            console.log('Fetching presence for users:', Array.from(objectIds));
            const presenceMap = await fetchUserPresence(Array.from(objectIds), this.props.userToken);
            
            // Update presence state
            this.setState(prevState => ({
              presence: {
                ...prevState.presence,
                ...Object.fromEntries(presenceMap)
              }
            }));
          }

          // Fetch photos for each approval
          formattedData.forEach(approval => {
            fetchPhotosForApproval(
              approval,
              this.props.userToken!,
              this.state.photos,
              (newPhotos) => {
                this.setState(prevState => ({
                  photos: {
                    ...prevState.photos,
                    ...newPhotos
                  }
                }));
              }
            );
          });
        });
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
    // Decode the token once
    const decodedToken = this.props.userToken ? jwtDecode<IDecodedToken>(this.props.userToken) : null;
  
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
          groups: [],
          approval_members: []
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
  
      const user = {
        Approval_Users_id: record.Approval_Users_id,
        Approval_Users_upn: record.Approval_Users_upn,
        Approval_Users_email: record.Approval_Users_email,
        Approval_Users_display_name: record.Approval_Users_display_name,
        Approval_Users_notes: JSON.parse(record.Approval_Users_notes),
        Approval_Users_object_id: record.Approval_Users_object_id
      };
  
      group.users.push(user);
  
      // Add user to approval_members if not already present
      if (!approval.approval_members.some(member => member.id === user.Approval_Users_id)) {
        approval.approval_members.push({
          personaName: user.Approval_Users_display_name,
          imageUrl: '', // Add appropriate image URL if available
          imageInitials: user.Approval_Users_display_name.split(' ').map((name: string) => name[0]).join(''),
          data: {
            upn: user.Approval_Users_upn,
            presence: PersonaPresence.offline,
            objectId: user.Approval_Users_object_id // Add the object ID from the token
          }
        });
      }
    });
      
    const approvals = Object.values(approvalsMap);
    
    // Now update both photos and presence
    approvals.forEach(approval => {
      this.updateUserProfiles(approval);
    });
    
    return approvals;
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


  private async updateUserProfiles(approval: IApproval): Promise<void> {
    if (!this.props.accessToken || !this.props.userToken) {
      console.log('No tokens available, skipping profile updates');
      return;
    }
  
    try {
      const objectIds = approval.approval_members
        .map(member => member.data.objectId)
        .filter((id): id is string => id !== undefined);
  
      if (objectIds.length > 0) {
        console.log('Fetching presence for approval members:', objectIds);
        const presenceMap = await fetchUserPresence(objectIds, this.props.userToken);
        
        if (presenceMap.size > 0) {
          this.setState(prevState => ({
            presence: {
              ...prevState.presence,
              ...Object.fromEntries(presenceMap)
            }
          }), () => {
            console.log('Updated presence state:', this.state.presence);
          });
        }
      }
  
      await fetchPhotosForApproval(
        approval,
        this.props.userToken,
        this.state.photos,
        (newPhotos) => {
          if (Object.keys(newPhotos).length > 0) {
            this.setState(prevState => ({
              photos: {
                ...prevState.photos,
                ...newPhotos
              }
            }), () => {
              console.log('Updated photos state:', this.state.photos);
            });
          }
        }
      );
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