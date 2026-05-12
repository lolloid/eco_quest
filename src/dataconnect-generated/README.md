# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllQuests*](#listallquests)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*CreateCharacter*](#createcharacter)
  - [*SubmitQuest*](#submitquest)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllQuests
You can execute the `ListAllQuests` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllQuests(options?: ExecuteQueryOptions): QueryPromise<ListAllQuestsData, undefined>;

interface ListAllQuestsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllQuestsData, undefined>;
}
export const listAllQuestsRef: ListAllQuestsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllQuests(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllQuestsData, undefined>;

interface ListAllQuestsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllQuestsData, undefined>;
}
export const listAllQuestsRef: ListAllQuestsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllQuestsRef:
```typescript
const name = listAllQuestsRef.operationName;
console.log(name);
```

### Variables
The `ListAllQuests` query has no variables.
### Return Type
Recall that executing the `ListAllQuests` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllQuestsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAllQuests`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllQuests } from '@dataconnect/generated';


// Call the `listAllQuests()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllQuests();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllQuests(dataConnect);

console.log(data.quests);

// Or, you can use the `Promise` API.
listAllQuests().then((response) => {
  const data = response.data;
  console.log(data.quests);
});
```

### Using `ListAllQuests`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllQuestsRef } from '@dataconnect/generated';


// Call the `listAllQuestsRef()` function to get a reference to the query.
const ref = listAllQuestsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllQuestsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.quests);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.quests);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  username: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  username: ..., 
  email: ..., 
  displayName: ..., // optional
  avatarUrl: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ username: ..., email: ..., displayName: ..., avatarUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  username: ..., 
  email: ..., 
  displayName: ..., // optional
  avatarUrl: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ username: ..., email: ..., displayName: ..., avatarUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateCharacter
You can execute the `CreateCharacter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCharacter(vars: CreateCharacterVariables): MutationPromise<CreateCharacterData, CreateCharacterVariables>;

interface CreateCharacterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCharacterVariables): MutationRef<CreateCharacterData, CreateCharacterVariables>;
}
export const createCharacterRef: CreateCharacterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCharacter(dc: DataConnect, vars: CreateCharacterVariables): MutationPromise<CreateCharacterData, CreateCharacterVariables>;

interface CreateCharacterRef {
  ...
  (dc: DataConnect, vars: CreateCharacterVariables): MutationRef<CreateCharacterData, CreateCharacterVariables>;
}
export const createCharacterRef: CreateCharacterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCharacterRef:
```typescript
const name = createCharacterRef.operationName;
console.log(name);
```

### Variables
The `CreateCharacter` mutation requires an argument of type `CreateCharacterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCharacterVariables {
  characterName: string;
  characterClass: string;
  health?: number | null;
  mana?: number | null;
  strength?: number | null;
  intelligence?: number | null;
  agility?: number | null;
}
```
### Return Type
Recall that executing the `CreateCharacter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCharacterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCharacterData {
  character_insert: Character_Key;
}
```
### Using `CreateCharacter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCharacter, CreateCharacterVariables } from '@dataconnect/generated';

// The `CreateCharacter` mutation requires an argument of type `CreateCharacterVariables`:
const createCharacterVars: CreateCharacterVariables = {
  characterName: ..., 
  characterClass: ..., 
  health: ..., // optional
  mana: ..., // optional
  strength: ..., // optional
  intelligence: ..., // optional
  agility: ..., // optional
};

// Call the `createCharacter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCharacter(createCharacterVars);
// Variables can be defined inline as well.
const { data } = await createCharacter({ characterName: ..., characterClass: ..., health: ..., mana: ..., strength: ..., intelligence: ..., agility: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCharacter(dataConnect, createCharacterVars);

console.log(data.character_insert);

// Or, you can use the `Promise` API.
createCharacter(createCharacterVars).then((response) => {
  const data = response.data;
  console.log(data.character_insert);
});
```

### Using `CreateCharacter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCharacterRef, CreateCharacterVariables } from '@dataconnect/generated';

// The `CreateCharacter` mutation requires an argument of type `CreateCharacterVariables`:
const createCharacterVars: CreateCharacterVariables = {
  characterName: ..., 
  characterClass: ..., 
  health: ..., // optional
  mana: ..., // optional
  strength: ..., // optional
  intelligence: ..., // optional
  agility: ..., // optional
};

// Call the `createCharacterRef()` function to get a reference to the mutation.
const ref = createCharacterRef(createCharacterVars);
// Variables can be defined inline as well.
const ref = createCharacterRef({ characterName: ..., characterClass: ..., health: ..., mana: ..., strength: ..., intelligence: ..., agility: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCharacterRef(dataConnect, createCharacterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.character_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.character_insert);
});
```

## SubmitQuest
You can execute the `SubmitQuest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
submitQuest(vars: SubmitQuestVariables): MutationPromise<SubmitQuestData, SubmitQuestVariables>;

interface SubmitQuestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitQuestVariables): MutationRef<SubmitQuestData, SubmitQuestVariables>;
}
export const submitQuestRef: SubmitQuestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
submitQuest(dc: DataConnect, vars: SubmitQuestVariables): MutationPromise<SubmitQuestData, SubmitQuestVariables>;

interface SubmitQuestRef {
  ...
  (dc: DataConnect, vars: SubmitQuestVariables): MutationRef<SubmitQuestData, SubmitQuestVariables>;
}
export const submitQuestRef: SubmitQuestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the submitQuestRef:
```typescript
const name = submitQuestRef.operationName;
console.log(name);
```

### Variables
The `SubmitQuest` mutation requires an argument of type `SubmitQuestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SubmitQuestVariables {
  questId: UUIDString;
  answers: string;
}
```
### Return Type
Recall that executing the `SubmitQuest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SubmitQuestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SubmitQuestData {
  questSubmission_insert: QuestSubmission_Key;
}
```
### Using `SubmitQuest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, submitQuest, SubmitQuestVariables } from '@dataconnect/generated';

// The `SubmitQuest` mutation requires an argument of type `SubmitQuestVariables`:
const submitQuestVars: SubmitQuestVariables = {
  questId: ..., 
  answers: ..., 
};

// Call the `submitQuest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await submitQuest(submitQuestVars);
// Variables can be defined inline as well.
const { data } = await submitQuest({ questId: ..., answers: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await submitQuest(dataConnect, submitQuestVars);

console.log(data.questSubmission_insert);

// Or, you can use the `Promise` API.
submitQuest(submitQuestVars).then((response) => {
  const data = response.data;
  console.log(data.questSubmission_insert);
});
```

### Using `SubmitQuest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, submitQuestRef, SubmitQuestVariables } from '@dataconnect/generated';

// The `SubmitQuest` mutation requires an argument of type `SubmitQuestVariables`:
const submitQuestVars: SubmitQuestVariables = {
  questId: ..., 
  answers: ..., 
};

// Call the `submitQuestRef()` function to get a reference to the mutation.
const ref = submitQuestRef(submitQuestVars);
// Variables can be defined inline as well.
const ref = submitQuestRef({ questId: ..., answers: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = submitQuestRef(dataConnect, submitQuestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.questSubmission_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.questSubmission_insert);
});
```

