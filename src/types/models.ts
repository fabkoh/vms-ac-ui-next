// ---- Auth ----

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface User {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string[] | string;
  mobile?: string;
  password?: string;
}

export type UserProfile = User;

// ---- Person ----

export interface Person {
  personId: number;
  personFirstName: string | null;
  personLastName: string | null;
  personUid: string | null;
  personMobileNumber?: string | null;
  personEmail?: string | null;
  accessGroup?: AccessGroup | number | null;
}

// ---- Access Group ----

export interface AccessGroup {
  accessGroupId: number;
  accessGroupName: string;
  accessGroupDesc?: string;
  isActive: boolean;
  persons?: Person[];
}

// ---- Entrance ----

export interface Entrance {
  entranceId: number;
  entranceName: string;
  entranceDesc?: string;
  isActive?: boolean;
  accessGroups?: AccessGroup[];
  thirdPartyOption?: string | null;
}

// ---- Access Group <-> Entrance (N-to-N) ----

export interface AccessGroupEntrance {
  groupToEntranceId: number;
  accessGroupId?: number;
  entranceId?: number;
  accessGroup?: AccessGroup;
  entrance?: Entrance;
}

// ---- Credentials ----

export interface Credential {
  credId: number;
  credUid: string;
  credTTL: string | Date | null;
  isValid: boolean;
  isPerm: boolean;
  credTypeId: number;
  personId?: number;
}

export interface CredentialType {
  credTypeId: number;
  credTypeName?: string;
  credTypeDesc?: string;
}

// ---- Controllers ----

export interface Controller {
  controllerId: number;
  controllerName: string;
  controllerIpStatic: boolean | string;
  controllerIP: string;
  controllerMAC: string;
  controllerSerialNo: string;
  created?: string;
  masterController?: boolean;
  pinAssignmentConfig?: string;
  settingsConfig?: string;
  lastOnline?: string;
  authDevices?: AuthDevice[];
}

// ---- Auth Devices ----

export interface AuthDevice {
  authDeviceId: string;
  authDeviceName: string;
  authDeviceDirection: string;
  lastOnline?: string;
  masterpin: boolean;
  defaultAuthMethod?: string;
  controllerId: string;
  entrance?: Entrance | null;
}

export interface AuthMethod {
  authMethodId: number;
  authMethodDesc: string;
}

export interface AuthMethodSchedule {
  authMethodScheduleId?: number;
  authMethodScheduleName: string;
  rrule: string;
  timeStart: string;
  timeEnd: string;
  authMethod: number | AuthMethod;
}

export interface AuthenticationSchedule {
  authenticationScheduleId?: number;
  authenticationScheduleName: string;
  rrule: string;
  timeStart: string;
  timeEnd: string;
  authMethod: number | AuthMethod;
}

// ---- Schedules ----

export interface EntranceSchedule {
  entranceScheduleId?: number;
  entranceScheduleName: string;
  rrule: string;
  timeStart: string;
  timeEnd: string;
}

export interface AccessGroupSchedule {
  accessGroupScheduleId?: number;
  accessGroupScheduleName: string;
  rrule: string;
  timeStart: string;
  timeEnd: string;
}

export interface TriggerSchedule {
  triggerScheduleId?: number;
  triggerName?: string;
  rrule: string;
  timeStart: string;
  timeEnd: string;
}

// ---- Events ----

export interface EventActionInput {
  eventActionInputId: number;
  eventActionInputName: string;
  timerEnabled: boolean;
  eventActionInputConfig: unknown | null;
}

export interface EventActionOutput {
  eventActionOutputId: number;
  eventActionOutputName: string;
  timerEnabled: boolean;
  eventActionOutputConfig: unknown | null;
}

export interface EventsManagement {
  eventsManagementId: number;
  eventsManagementName: string;
  inputEvents?: EventActionInput[];
  outputActions?: EventActionOutput[];
  controllerIds?: number[];
  entranceIds?: number[];
  triggerSchedules?: TriggerSchedule[];
}

export interface EventsManagementNotification {
  eventsManagementNotificationId: number;
  eventsManagementNotificationType: string;
  eventsManagementNotificationRecipients: string;
  eventsManagementNotificationContent: string;
  eventsManagementNotificationTitle: string;
  deleted: boolean;
  eventsManagement?: EventsManagement;
}

// ---- Notifications ----

export interface SMSConfig {
  smsSettingsId: number;
  smsAPI: string;
  enabled: boolean;
}

export interface EmailConfig {
  emailSettingsId: number;
  username: string;
  email: string;
  emailPassword: string;
  hostAddress: string;
  portNumber: string | number;
  enabled: boolean;
  isTLS?: boolean;
}

export interface NotificationLog {
  notificationLogsId: number;
  notificationLogsStatusCode: number;
  notificationLogsError: string;
  timeSent: string;
  eventsManagementNotification?: EventsManagementNotification;
}

// ---- Video Recorders ----

export interface VideoRecorder {
  recorderId: number;
  recorderName: string;
  recorderSerialNumber?: string;
  recorderPublicIp?: string;
  recorderPrivateIp?: string;
  recorderIpAddress?: string;
  recorderPortNumber: number;
  recorderIWSPort?: number;
  recorderUsername: string;
  recorderPassword: string;
  created?: string;
  recorderChannels?: string[];
  recorderCameras?: string[];
  autoPortForwarding?: boolean;
}
