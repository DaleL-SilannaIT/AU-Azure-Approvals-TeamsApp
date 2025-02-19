import { IUserPhotoInfo, IApproval } from '../services/Interfaces';

export async function fetchUserPhoto(EntraId: string, userToken: string | undefined): Promise<string | undefined> {
  try {
    const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';

    if (!userToken) {
      console.log('No userToken available, aborting fetch');
      return;
    }

    let headers = new Headers();
    headers.append('token', userToken);

    const response = await fetch(`${endpoint}/api/userPhoto?EntraId=${EntraId}`, {
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

export function extractDistinctUsers(approvals: IApproval[]): IUserPhotoInfo[] {
  const distinctUsers = new Map<string, IUserPhotoInfo>();
  
  approvals.forEach(approval => {
    approval.approval_members.forEach(member => {
      if (member.data.upn && !distinctUsers.has(member.data.upn)) {
        distinctUsers.set(member.data.upn, {
          upn: member.data.upn,
          objectId: member.data.objectId,
          displayName: member.personaName
        });
      }
    });
  });

  return Array.from(distinctUsers.values());
}

export async function fetchPhotosForApproval(
  users: IUserPhotoInfo[], 
  userToken: string, 
  currentPhotos: { [upn: string]: string | undefined }, 
  updateState: (photos: { [upn: string]: string | undefined }) => void
) {
  const newPhotos: { [upn: string]: string | undefined } = {};
  let hasUpdates = false;
  
  // Process users in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const photoPromises = batch.map(async user => {
      if (user.upn && !currentPhotos[user.upn]) {
        const photoUrl = await fetchUserPhoto(user.upn, userToken);
        if (photoUrl) {
          return { upn: user.upn, photoUrl };
        }
      }
      return null;
    });

    const results = await Promise.all(photoPromises);
    results.forEach(result => {
      if (result) {
        newPhotos[result.upn] = result.photoUrl;
        hasUpdates = true;
      }
    });

    // Update state after each batch if we have new photos
    if (hasUpdates) {
      console.log(`Updating photos batch ${i/batchSize + 1} with:`, newPhotos);
      updateState(newPhotos);
    }
  }
}