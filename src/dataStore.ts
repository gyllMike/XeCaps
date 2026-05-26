// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
// It should be informed by your data model walkthrough from Iteration 0

import fs from 'fs';

export interface MissionControlUser {
  controlUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  oldPasswordArray: string[];
  newPassword: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface SpaceMission {
  controlUserId: number;
  missionId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  target: string;
  isMissionActive: boolean;
  assignedAstronauts: ({ astronautId: number, designation: string } | Record<string, never>)[];
}

export interface Session {
  controlUserSessionId: string;
  controlUserId: number;
}

export interface Astronaut {
  astronautId: number;
  timeAdded: number;
  timeLastEdited: number;
  nameFirst: string;
  nameLast: string;
  rank: string;
  age: number;
  weight: number;
  height: number;
  assignedMission: { missionId: number } | Record<string, never>;
}

export interface AstronautListItem {
  astronautId: number;
  designation: string;
  assigned: boolean;
}

export interface MessageLog {
  astronautId: number;
  messageId: number;
  chatbotResponse: boolean;
  messageContent: string;
  timeSent: number;
}

export enum missionLaunchState {
  READY_TO_LAUNCH = 'READY_TO_LAUNCH',
  LAUNCHING = 'LAUNCHING',
  MANEUVERING = 'MANEUVERING',
  COASTING = 'COASTING',
  MISSION_COMPLETE = 'MISSION_COMPLETE',
  REENTRY = 'RE_ENTRY',
  ON_EARTH = 'ON_EARTH'
}

export enum missionLaunchAction {
  LIFTOFF = 'LIFTOFF',
  CORRECTION = 'CORRECTION',
  FIRE_THRUSTERS = 'FIRE_THRUSTERS',
  DEPLOY_PAYLOAD = 'DEPLOY_PAYLOAD',
  GO_HOME = 'GO_HOME',
  FAULT = 'FAULT',
  RETURN = 'RETURN',
  SKIP_WAITING = 'SKIP_WAITING'
}
export interface LaunchVehicle {
  launchVehicleId: number; // an id for this entity
  name: string; // a name for this launch vehicle
  description: string; // a description for this launch vehicle
  maxCrewWeight: number; // maximum weight (kg) of astronauts this launch vehicle can carry
  maxPayloadWeight: number; // maximum weight (kg) of payload this launch vehicle can carry
  launchVehicleWeight: number; // weight (kg) of this launch vehicle without payload or crew
  thrustCapacity: number; // amount of force this launch vehicle generates when it burns thrustFuel
  maneuveringFuel: number; // amount of maneuvering fuel (units) this launch vehicle has to start each launch
  timeAdded: number; // created time in seconds
  timeLastEdited: number; // last time a value was edited in seconds
  retired: boolean; // is this launch vehicle active or not
  // launches?: LaunchSummary // this is computed value so it does not need to be stored
}

export interface Payload {
  payloadId: number; // an id for this entity
  description: string; // a description for this payload
  weight: number; // a weight (kg) for this payload
  deployed: boolean; // has this payload been deployed or not?
  // extra properties can be added to this payload to help with the bonus tasks
}

export interface PayloadInput {
    description: string,
    weight: number
}

export interface LaunchCalcParameters {
  targetDistance: number; // distance (m) to the target destination for this launch
  thrustFuel: number; // amount of fuel that is allocated to the launch vehicle for this launch
  fuelBurnRate: number; // rate at which the launch vehicle burns its `thrustFuel`
  activeGravityForce: number; // downward force of gravity acting against the thrust capacity of the launch vehicle
  maneuveringDelay: number; // how long does the launch wait before automatically going from `MANEUVERING` state to `COASTING` state
}

export interface Launch {
  launchId: number; // an id for this entity
  missionCopy: SpaceMission; // copy of the mission that this launch is based on. Note - it must be deep copy so that if the original mission is changed, this copy remains unchanged
  launchCreationTime: number; // time in seconds that this launch was created
  timeLastEdited: number; // time in seconds that this launch was last editted
  state: missionLaunchState; // what is the current state of this launch, always begins at 'READY_TO_LAUNCH'
  assignedLaunchVehicleId: number; // launch vehicle assigned to this launch
  remainingLaunchVehicleManeuveringFuel: number // how much maneuvering fuel is left in the launch vehicle currently assigned to this launch
  payloadId: number; // payload assigned to this launch
  allocatedAstronauts: number[] // array of astronautId's that are allocated to this launch
  launchCalculationParameters: LaunchCalcParameters
  messageLog: MessageLog[];
}

export interface LaunchInput {
    launchVehicleId: number,
    payload: PayloadInput,
    launchParameters: LaunchCalcParameters
}

export interface DataStore {
  missionControlUsersArray: { missionControlUser: MissionControlUser }[];
  spaceMissionsArray: { spaceMission: SpaceMission }[];
  controlUserSessionsArray: { controlUserSession: Session }[];
  astronautsArray: { astronaut: Astronaut }[];
  launchesArray: { launch: Launch }[];
  payloadsArray: { payload: Payload }[],
  launchVehiclesArray: { launchVehicle: LaunchVehicle }[];
}

let data: DataStore = {
  missionControlUsersArray: [],
  spaceMissionsArray: [],
  controlUserSessionsArray: [],
  astronautsArray: [],
  launchesArray: [],
  payloadsArray: [],
  launchVehiclesArray: []
};

const databaseFileName = 'database.json';

const save = () => {
  // format change
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(databaseFileName, jsonString);
};

const load = () => {
  const jsonString = String(fs.readFileSync(databaseFileName));
  data = JSON.parse(jsonString);
};

// Use get() to access the data
function getData(): DataStore {
  load();
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore): void {
  data = newData;
  save();
}

export { getData, setData };
