import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Character_Key {
  id: UUIDString;
  __typename?: 'Character_Key';
}

export interface CreateCharacterData {
  character_insert: Character_Key;
}

export interface CreateCharacterVariables {
  characterName: string;
  characterClass: string;
  health?: number | null;
  mana?: number | null;
  strength?: number | null;
  intelligence?: number | null;
  agility?: number | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  username: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface InventoryItem_Key {
  id: UUIDString;
  __typename?: 'InventoryItem_Key';
}

export interface ListAllQuestsData {
  quests: ({
    id: UUIDString;
    title: string;
    description: string;
    difficulty: string;
    rewards: string;
    dueDate?: DateString | null;
    subject?: {
      name: string;
    };
  } & Quest_Key)[];
}

export interface QuestSubmission_Key {
  id: UUIDString;
  __typename?: 'QuestSubmission_Key';
}

export interface Quest_Key {
  id: UUIDString;
  __typename?: 'Quest_Key';
}

export interface Subject_Key {
  id: UUIDString;
  __typename?: 'Subject_Key';
}

export interface SubmitQuestData {
  questSubmission_insert: QuestSubmission_Key;
}

export interface SubmitQuestVariables {
  questId: UUIDString;
  answers: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCharacter' Mutation. Allow users to execute without passing in DataConnect. */
export function createCharacter(dc: DataConnect, vars: CreateCharacterVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCharacterData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCharacter' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCharacter(vars: CreateCharacterVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCharacterData>>;

/** Generated Node Admin SDK operation action function for the 'ListAllQuests' Query. Allow users to execute without passing in DataConnect. */
export function listAllQuests(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllQuestsData>>;
/** Generated Node Admin SDK operation action function for the 'ListAllQuests' Query. Allow users to pass in custom DataConnect instances. */
export function listAllQuests(options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllQuestsData>>;

/** Generated Node Admin SDK operation action function for the 'SubmitQuest' Mutation. Allow users to execute without passing in DataConnect. */
export function submitQuest(dc: DataConnect, vars: SubmitQuestVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SubmitQuestData>>;
/** Generated Node Admin SDK operation action function for the 'SubmitQuest' Mutation. Allow users to pass in custom DataConnect instances. */
export function submitQuest(vars: SubmitQuestVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SubmitQuestData>>;

