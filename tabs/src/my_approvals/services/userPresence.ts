import { PersonaPresence } from '@fluentui/react/lib/Persona';

export interface IUserPresence {
  id: string;
  availability: string;
  activity: string;
}

interface GraphPresenceResponse {
  '@odata.context': string;
  value: IUserPresence[];
}

export async function fetchUserPresence(userObjectIds: string[], userToken: string | undefined): Promise<Map<string, PersonaPresence>> {
  try {
    const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';

    if (!userToken) {
      console.log('No userToken available, aborting fetch');
      return new Map<string, PersonaPresence>();
    }

    let headers = new Headers();
    headers.append('token', userToken);
    headers.append('Content-Type', 'application/json');

    const requestBody = {
      ids: userObjectIds
    };

    console.log('Sending presence request with body:', requestBody);

    const response = await fetch(`${endpoint}/api/presence`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch presence: ${response.status}`);
    }

    const graphResponse: GraphPresenceResponse = await response.json();
    console.log('Graph response:', graphResponse);
    
    // Extract the presence array from the value property
    const presenceData = graphResponse.value;
    console.log('Presence data array:', presenceData);
    
    const mappedPresence = mapPresenceData(presenceData);
    console.log('Mapped presence:', Object.fromEntries(mappedPresence));
    return mappedPresence;
  } catch (error) {
    console.error('Error fetching presence:', error);
    return new Map();
  }
}

function mapPresenceData(presenceData: IUserPresence[]): Map<string, PersonaPresence> {
  const presenceMap = new Map<string, PersonaPresence>();

  presenceData.forEach(presence => {
    let personaPresence = PersonaPresence.none;
    switch (presence.availability.toLowerCase()) {
      case 'available':
        personaPresence = PersonaPresence.online;
        break;
      case 'busy':
        personaPresence = PersonaPresence.busy;
        break;
      case 'donotdisturb':
        personaPresence = PersonaPresence.dnd;
        break;
      case 'away':
        personaPresence = PersonaPresence.away;
        break;
      case 'offline':
        personaPresence = PersonaPresence.offline;
        break;
    }
    presenceMap.set(presence.id, personaPresence);
  });

  return presenceMap;
}