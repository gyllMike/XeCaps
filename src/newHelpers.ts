import { getData, setData, missionLaunchAction, missionLaunchState } from './dataStore';
import HTTPError from 'http-errors';

export const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function deleteTime(launchId: number) {
  if (timers.has(launchId)) {
    clearTimeout(timers.get(launchId));
    timers.delete(launchId);
  }
}

export function checkMissionId(missionId: number, controlUserId: number) {
  // expect our dataStore to have 'missions' property
  const data = getData();
  // this assumes you have stored the 'owner' of a mission as 'controlUserId'
  const thisMission = data.spaceMissionsArray.find((m) => m.spaceMission.missionId === missionId && m.spaceMission.controlUserId === controlUserId);

  if (!thisMission) {
    throw HTTPError(403, `${missionId} is not a valid missionId for this user: ${controlUserId}`);
  }

  return true;
}

export function getTime() {
  return Math.floor(Date.now() / 1000);
}

export function genLVID() {
  // check existing LVIDs
  // then return a new ID
  // replace the next line with your code:
  const timeid = Date.now() / 10000;
  let countid = Math.floor(timeid);
  const id = getData().launchVehiclesArray.map(i => i.launchVehicle.launchVehicleId);
  while (id.includes(countid)) {
    countid += 1;
  }
  return countid;
}

export function genLaunchId() {
  // check existing LaunchIds
  // then return a new ID
  // replace the next line with your code:
  const timeid = Date.now() / 10000;
  let countid = Math.floor(timeid);
  const id = getData().launchesArray.map(i => i.launch.launchId);
  while (id.includes(countid)) {
    countid += 1;
  }
  return countid;
}

export function genPayloadId() {
  // check existing payloadIds
  // then return a new ID
  // replace the next line with your code:
  const timeid = Date.now() / 10000;
  let countid = Math.floor(timeid);
  const id = getData().payloadsArray.map(i => i.payload.payloadId);
  while (id.includes(countid)) {
    countid += 1;
  }
  return countid;
}

export function genLVLaunchSummary(launchVehicleId: number) {
  const data = getData();
  return data.launchesArray
    .filter((l) => l.launch.assignedLaunchVehicleId === launchVehicleId)
    .map((l) => ({
      launch: `[${l.launch.missionCopy.target}] ${l.launch.missionCopy.name} - ${l.launch.launchCreationTime}`,
      state: l.launch.state,
    }));
}

export function genAllocatedAstronautSummary(allocatedAstronautList: number[]) {
  const data = getData();
  const summary = [];
  for (const astronautId of allocatedAstronautList) {
    // assumes you have a property called astronauts
    const currentAstronaut = data.astronautsArray.find((a) => a.astronaut.astronautId === astronautId).astronaut;
    summary.push({ astronautId: currentAstronaut.astronautId, designation: `${currentAstronaut.rank} ${currentAstronaut.nameFirst} ${currentAstronaut.nameLast}` });
  }
  return summary;
}

export function launchVehicleNameValidityCheck(name:string) : boolean {
  // Name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
  // Name is less than 2 characters or more than 20 characters

  // TODO - add your code and fix the code below

  return /^[A-Za-z\s'-]{2,20}$/.test(name); // we can throw a HTTP error here
  // throw HTTPError(400, `${name} is not a valid name for a launch vehicle`);
}

export function launchVehicleDescriptionValidityCheck(description:string) : boolean {
  // Description contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
  // Description is less than 2 characters or more than 50 characters

  // TODO - add your code and fix the code below
  return /^[A-Za-z\s'-]{2,50}$/.test(description);
}

export function launchVehicleCrewWeightValidityCheck(maxCrewWeight: number) : boolean {
  // maximumCrewWeight < 100 or > 1000

  // TODO - add your code and fix the code below
  return maxCrewWeight >= 100 && maxCrewWeight <= 1000;
}

export function launchVehiclePayloadWeightValidityCheck(maxPayloadWeight: number) : boolean {
  // maximumPayloadWeight < 100 or > 1000
  // TODO - add your code and fix the code below
  return maxPayloadWeight >= 100 && maxPayloadWeight <= 1000;
}

export function launchVehicleWeightValidityCheck(launchVehicleWeight: number) : boolean {
  // launchVehicleWeight < 1000 or > 100000
  // TODO - add your code and fix the code below
  return launchVehicleWeight >= 1000 && launchVehicleWeight <= 100000;
}

export function launchVehicleThrustCapacityValidityCheck(thrustCapacity: number) : boolean {
  // thrustCapacity < 100000 or > 10000000
  // TODO - add your code and fix the code below
  return thrustCapacity >= 100000 && thrustCapacity <= 10000000;
}

export function launchVehicleManeuveringFuelValidityCheck(maneuveringFuel: number) : boolean {
  // maneuveringFuel < 10 or > 100
  // TODO - add your code and fix the code below
  return maneuveringFuel >= 10 && maneuveringFuel <= 100;
}

export function launchVehicleIdCheck(launchVehicleId: number) {
  // check if the ID is valid and exists in your dataStore
  // TODO - add your code and fix the code below
  const data = getData();
  return data.launchVehiclesArray.some(l => l.launchVehicle.launchVehicleId === launchVehicleId);
}

export function checkLaunchIdValidity(launchId: number) {
  // a helper function that checks to see if the launchId is valid etc.

  // TODO - you must complete this helper function
  const data = getData();
  return data.launchesArray.some(l => l.launch.launchId === launchId);
}

export function payloadDescriptionValidCheck(description: string) {
  // a helper function that checks for length of payload and content if needed.

  // TODO - you must complete this helper function

  return /^[A-Za-z\s'-]{2,50}$/.test(description);
}

export function payloadWeightValidCheck(payloadWeight: number, launchVehicleId: number) {
  // a helper function that checks for payload weight falling into parameters

  // TODO - You must complete this helper function
  const data = getData();
  const launchVehicle = data.launchVehiclesArray.find(l => l.launchVehicle.launchVehicleId === launchVehicleId).launchVehicle;
  return payloadWeight > 0 && payloadWeight <= launchVehicle.maxPayloadWeight;
}

export function checkManeuveringFuel(launchId: number) {
  // a helper function that checks if there is at least 3 units of fuel left

  // TODO - you must complete this helper function
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  if (launch.remainingLaunchVehicleManeuveringFuel < 3) return false;
  launch.remainingLaunchVehicleManeuveringFuel -= 3;
  setData(data);
  return true;
}

export function canThisLaunchReachTargetDistanceCheck(launchId: number) : boolean {
  // a helper function that does calculations using the launchParameters to see if this launch can go ahead.

  // TODO - you must complete this helper function
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  const lv = data.launchVehiclesArray.find(l => l.launchVehicle.launchVehicleId === launch.assignedLaunchVehicleId).launchVehicle;
  const payload = data.payloadsArray.find(p => p.payload.payloadId === launch.payloadId).payload;
  const astronautWeight = data.astronautsArray.filter(a => launch.allocatedAstronauts.includes(a.astronaut.astronautId)).reduce((s, a) => s + a.astronaut.weight, 0);

  const weight = astronautWeight + payload.weight + lv.launchVehicleWeight;
  const T = lv.thrustCapacity;
  const F = launch.launchCalculationParameters.fuelBurnRate;
  const M = launch.launchCalculationParameters.thrustFuel;
  const g = launch.launchCalculationParameters.activeGravityForce;
  const t = M / F;
  const Fnet = T - weight * g;
  const a = Fnet / weight;
  const h = 0.5 * a * t * t;
  return h >= launch.launchCalculationParameters.targetDistance;
}

// error constant defined becuase it is used frequently
export const badActionForStateError = (action:missionLaunchAction, state: missionLaunchState) => {
  throw HTTPError(400, `invalid action: Cannot do action ${action} in state ${state}`);
};

// helper functions to initialize states
export function initializeLaunching(launchId: number) {
  // assumes a valid launchId since this can only be accessed from other functions that have done the check
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  launch.state = missionLaunchState.LAUNCHING;
  deleteTime(launchId);
  const timer = setTimeout(() => initializeManeuvering(launchId), 3000);
  timers.set(launchId, timer);
  setData(data);
  // TODO - you must complete this helper function
  // Carry out the launch update steps:
  //  1. Set state to LAUNCHING
  //  2. Clear existing timers for this launch
  //  3. Create a timer for 3 seconds to execute initializeManevuring()

  // You do not need to return anything, you can use this for checks to see if something has gone wrong
}

export function initializeManeuvering(launchId: number) {
  // assumes a valid launchId since this can only be accessed from other functions that have done the check
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  launch.state = missionLaunchState.MANEUVERING;
  deleteTime(launchId);
  const timer = setTimeout(() => initializeCoasting(launchId), launch.launchCalculationParameters.maneuveringDelay * 1000);
  timers.set(launchId, timer);
  setData(data);
  // TODO - you must complete this helper function
  // Carry out the launch update steps:
  //  1. Set state to MANEUVERING
  //  2. Clear existing timers for this launch
  //  3. Create a timer for n seconds to execute initializeCoasting() where n is defined in the launchParameters.

  // You do not need to return anything, you can use this for checks to see if something has gone wrong
}

export function initializeCoasting(launchId: number) {
  // assumes a valid launchId since this can only be accessed from other functions that have done the check
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  launch.state = missionLaunchState.COASTING;
  deleteTime(launchId);
  setData(data);
  // TODO - you must complete this helper function
  // Carry out the launch update steps:
  //  1. Set state to COASTING
  //  2. Clear existing timers for this launch

  // You do not need to return anything, you can use this for checks to see if something has gone wrong
}

export function initializeMissionComplete(launchId: number) {
  // assumes a valid launchId since this can only be accessed from other functions that have done the check
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  launch.state = missionLaunchState.MISSION_COMPLETE;
  deleteTime(launchId);
  setData(data);
  // TODO - you must complete this helper function
  // Carry out the launch update steps:
  //  1. Set state to MISSION_COMPLETE
  //  2. Clear existing timers for this launch

  // You do not need to return anything, you can use this for checks to see if something has gone wrong
}

export function initializeReentry(launchId: number) {
  // assumes a valid launchId since this can only be accessed from other functions that have done the check
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  launch.state = missionLaunchState.REENTRY;
  deleteTime(launchId);
  setData(data);
  // TODO - you must complete this helper function
  // Carry out the launch update steps:
  //  1. Set state to REENTRY
  //  2. Clear existing timers for this launch

  // You do not need to return anything, you can use this for checks to see if something has gone wrong
}

export function initializeOnEarth(launchId: number) {
  // assumes a valid launchId since this can only be accessed from other functions that have done the check
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  launch.state = missionLaunchState.ON_EARTH;
  deleteTime(launchId);
  launch.allocatedAstronauts = [];
  setData(data);
  // TODO - you must complete this helper function
  // Carry out the launch update steps:
  //  1. Set state to ON_EARTH
  //  2. Clear existing timers for this launch
  //  3. De-allocate astronauts (and launch vehicle)

  // You do not need to return anything, you can use this for checks to see if something has gone wrong
}

export function deployPayload(launchId: number) {
  // this function helps deploy the payload
  // assumes a valid launchId since this can only be accessed from other functions that have done the check

  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const data = getData();
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId).launch;
  const payload = data.payloadsArray.find(p => p.payload.payloadId === launch.payloadId).payload;
  payload.deployed = true;
  setData(data);
  // TODO - you must complete this helper function
  // Set the deployed flag of the payload for this launch to true
}
