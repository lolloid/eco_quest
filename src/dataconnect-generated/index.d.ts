import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

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

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateCharacterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCharacterVariables): MutationRef<CreateCharacterData, CreateCharacterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCharacterVariables): MutationRef<CreateCharacterData, CreateCharacterVariables>;
  operationName: string;
}
export const createCharacterRef: CreateCharacterRef;

export function createCharacter(vars: CreateCharacterVariables): MutationPromise<CreateCharacterData, CreateCharacterVariables>;
export function createCharacter(dc: DataConnect, vars: CreateCharacterVariables): MutationPromise<CreateCharacterData, CreateCharacterVariables>;

interface ListAllQuestsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllQuestsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllQuestsData, undefined>;
  operationName: string;
}
export const listAllQuestsRef: ListAllQuestsRef;

export function listAllQuests(options?: ExecuteQueryOptions): QueryPromise<ListAllQuestsData, undefined>;
export function listAllQuests(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllQuestsData, undefined>;

interface SubmitQuestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitQuestVariables): MutationRef<SubmitQuestData, SubmitQuestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SubmitQuestVariables): MutationRef<SubmitQuestData, SubmitQuestVariables>;
  operationName: string;
}
export const submitQuestRef: SubmitQuestRef;

export function submitQuest(vars: SubmitQuestVariables): MutationPromise<SubmitQuestData, SubmitQuestVariables>;
export function submitQuest(dc: DataConnect, vars: SubmitQuestVariables): MutationPromise<SubmitQuestData, SubmitQuestVariables>;

