import { CreateUserData, CreateUserVariables, CreateCharacterData, CreateCharacterVariables, ListAllQuestsData, SubmitQuestData, SubmitQuestVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useCreateCharacter(options?: useDataConnectMutationOptions<CreateCharacterData, FirebaseError, CreateCharacterVariables>): UseDataConnectMutationResult<CreateCharacterData, CreateCharacterVariables>;
export function useCreateCharacter(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCharacterData, FirebaseError, CreateCharacterVariables>): UseDataConnectMutationResult<CreateCharacterData, CreateCharacterVariables>;

export function useListAllQuests(options?: useDataConnectQueryOptions<ListAllQuestsData>): UseDataConnectQueryResult<ListAllQuestsData, undefined>;
export function useListAllQuests(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllQuestsData>): UseDataConnectQueryResult<ListAllQuestsData, undefined>;

export function useSubmitQuest(options?: useDataConnectMutationOptions<SubmitQuestData, FirebaseError, SubmitQuestVariables>): UseDataConnectMutationResult<SubmitQuestData, SubmitQuestVariables>;
export function useSubmitQuest(dc: DataConnect, options?: useDataConnectMutationOptions<SubmitQuestData, FirebaseError, SubmitQuestVariables>): UseDataConnectMutationResult<SubmitQuestData, SubmitQuestVariables>;
