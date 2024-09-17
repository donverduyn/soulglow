import type { GroupState, GroupStateCommands } from '__generated/api';

// TODO: we really shouldn't couple our dto with the api types
export type Device = GroupState & GroupStateCommands;
