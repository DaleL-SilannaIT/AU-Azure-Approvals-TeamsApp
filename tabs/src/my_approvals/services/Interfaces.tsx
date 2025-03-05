import { Facepile, OverflowButtonType, IFacepilePersona } from '@fluentui/react/lib/Facepile';
import { PersonaPresence, PersonaSize } from '@fluentui/react/lib/Persona';
import { DetailsListLayoutMode, Selection, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { ApprovalFilters } from '../../../../api/src/database/interfaces/filters';
import { JwtPayload } from 'jsonwebtoken';

export interface IMyApprovalTableState {
  items: IApproval[];
  columns: IColumn[];
  selectionDetails: string;
  isModalSelection: boolean;
  isCompactMode: boolean;
  loading: boolean;
  error: string | null;
  photos: { [upn: string]: string | undefined };
  presence: { [objectId: string]: PersonaPresence };
  approvers: IApprover[];
  requesters: IRequester[];
  //skipCount: number;
  topCount: number;
  loadMoreDisabled: boolean;
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
  approval_members: IFacepilePersona[];
  child_approval_source_display_name: string;
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
  Approval_Users_object_id: string;
}

export interface IMyApprovalsTableProps {
  filters: ApprovalFilters;
  setFilters: (filters: ApprovalFilters) => void;
  userToken: string | undefined;
  accessToken: string | undefined;
}

export interface IUserPresence {
  id: string;
  availability: string;
  activity: string;
}

// export interface IDecodedToken {
//   oid: string; // Object ID claim from Azure AD
//   // ... other claims
// }


export interface IDecodedToken extends JwtPayload {
  objectId?: string;
  upn?: string;
}

export interface IUserPhotoInfo {
  upn: string;
  objectId?: string;
  displayName?: string;
}

export interface IRequestersDropdownProps {
  requesterSelectedKeys: string[];
  setRequesterSelectedKeys: (state: string[]) => void;
  userToken: string;
  requesters: IRequester[];
}

export interface IRequester {
  object_id: string;
  upn: string;
  email: string;
  display_name: string;
}

export interface IApproversDropdownProps {
  approversSelectedKeys: string[];
  setApproversSelectedKeys: (state: string[]) => void;
  userToken: string;
  approvers: IApprover[];
}

export interface IApprover {
  object_id: string;
  upn: string;
  email: string;
  display_name: string;
}