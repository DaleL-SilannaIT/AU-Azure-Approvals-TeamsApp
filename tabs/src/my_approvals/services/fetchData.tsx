import { ApprovalFilters } from '../../../../api/src/database/interfaces/filters';
import { IApproval, IUserPhotoInfo, IDecodedToken } from './Interfaces';
import { fetchUserPresence } from './userPresence';
import { fetchPhotosForApproval } from './userPhotos';
import { PersonaPresence } from '@fluentui/react/lib/Persona';
import jwtDecode, { JwtPayload } from 'jwt-decode';


interface FetchDataOptions {
  userToken: string;
  filters: ApprovalFilters;
  onStateUpdate: (updates: {
    items?: IApproval[];
    loading?: boolean;
    error?: string | null;
    photos?: { [upn: string]: string | undefined };
    presence?: { [objectId: string]: PersonaPresence };
  }) => void;
}

export async function fetchData({ userToken, filters, onStateUpdate }: FetchDataOptions) {
  if (!userToken) {
    console.log('No userToken available, aborting fetch');
    return;
  }

  console.log('Starting fetch with filters:', filters);
  onStateUpdate({ loading: true });

  try {
    const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
    let formData = new FormData();

    // Append non-array filters
    (Object.keys(filters) as (keyof ApprovalFilters)[]).forEach(key => {
      if (!Array.isArray(filters[key]) && typeof filters[key] !== 'object') {
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

    const formattedData = restructureData(data, userToken);
    //console.log('Formatted data:', formattedData);

    // Update table data immediately
    onStateUpdate({ 
      items: formattedData,
      loading: false 
    });

    // Then fetch profiles asynchronously
    setTimeout(() => {
      updateUserProfilesAsync(formattedData, userToken, onStateUpdate);
    }, 0);

  } catch (err) {
    console.error('Fetch error:', err); // Debug log
    onStateUpdate({ error: err instanceof Error ? err.message : 'An unknown error occurred', items: [] });
  } finally {
    console.log('Fetch complete, setting loading false'); // Debug log
    onStateUpdate({ loading: false });
  }
}

async function updateUserProfilesAsync(
  formattedData: IApproval[], 
  userToken: string,
  onStateUpdate: FetchDataOptions['onStateUpdate']
) {
  // Extract distinct users
  const distinctUsers = new Map<string, IUserPhotoInfo>();
  formattedData.forEach(item => {
    item.approval_members.forEach(member => {
      if (member.data.upn && !distinctUsers.has(member.data.upn)) {
        distinctUsers.set(member.data.upn, {
          upn: member.data.upn,
          objectId: member.data.objectId
        });
      }
    });
  });

  // Fetch presence asynchronously
  const objectIds = Array.from(distinctUsers.values())
    .map(user => user.objectId)
    .filter((id): id is string => id !== undefined);

  if (objectIds.length > 0) {
    fetchUserPresence(objectIds, userToken).then(presenceMap => {
      onStateUpdate({
        presence: Object.fromEntries(presenceMap)
      });
    });
  }

  // Fetch photos asynchronously
  fetchPhotosForApproval(
    Array.from(distinctUsers.values()),
    userToken,
    {},
    (newPhotos) => {
      onStateUpdate({
        photos: newPhotos
      });
    }
  );
}

function restructureData(data: any[], userToken: string): IApproval[] {
  const approvalsMap: { [key: string]: IApproval } = {};
  // Decode the token here using the passed userToken
  const decodedToken = userToken ? jwtDecode<IDecodedToken>(userToken) : null;

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
        approval_members: [],
        child_approval_source_display_name: record.Child_Approval_Source_display_name
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
  
  // Remove the updateUserProfiles call since it's handled in fetchData
  return approvals;
}