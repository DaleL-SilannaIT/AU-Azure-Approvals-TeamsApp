import { IMyApprovalTableState, IApproval, IGroup, IUser, IMyApprovalsTableProps, IUserPresence, IDecodedToken} from '../services/Interfaces';

export async function fetchUserPhoto(EntraId: string, userToken: string | undefined): Promise<string | undefined> {
  try {
    const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';

    if (!userToken) {
      console.log('No userToken available, aborting fetch');
      return;
    }

    let headers = new Headers();
    headers.append('token', userToken);

    const response = await fetch(`${endpoint}/api/connection?EntraId=${EntraId}`, {
      method: 'POST',
      headers: headers
    });

    if (!response.ok) {
      return undefined;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return undefined;
  }
}

export async function fetchPhotosForApproval(
  approval: IApproval, 
  userToken: string, 
  currentPhotos: { [upn: string]: string | undefined }, 
  updateState: (photos: { [upn: string]: string | undefined }) => void
) {
  const newPhotos: { [upn: string]: string | undefined } = {};
  let hasUpdates = false;
  
  for (const member of approval.approval_members) {
    if (member.data.upn && !currentPhotos[member.data.upn]) {
      const photoUrl = await fetchUserPhoto(member.data.upn, userToken);
      if (photoUrl) {
        newPhotos[member.data.upn] = photoUrl;
        hasUpdates = true;
      }
    }
  }

  if (hasUpdates) {
    console.log('Updating photos with:', newPhotos);
    updateState(newPhotos);
  }
}