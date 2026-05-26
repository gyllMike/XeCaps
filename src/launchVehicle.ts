// You can change these import targets when you adapt this code into your own
import { LaunchVehicle, missionLaunchState } from './dataStore';
import { getData, setData } from './dataStore';
import { findControlUserIdFromSessionId, validLaunchVehicle } from './helpers';
import {
  launchVehicleNameValidityCheck,
  launchVehicleDescriptionValidityCheck,
  launchVehicleCrewWeightValidityCheck,
  launchVehiclePayloadWeightValidityCheck,
  launchVehicleWeightValidityCheck,
  launchVehicleThrustCapacityValidityCheck,
  launchVehicleManeuveringFuelValidityCheck,
  genLVID,
  getTime,
  genLVLaunchSummary,
  launchVehicleIdCheck,
  // payloadWeightValidCheck
} from './newHelpers';

import HTTPError from 'http-errors';

export function launchVehicleCreate(
  name: string,
  description: string,
  maxCrewWeight: number,
  maxPayloadWeight: number,
  launchVehicleWeight: number,
  thrustCapacity: number,
  maneuveringFuel: number) {
  // 401 check should have been done in a call from the server before we got to the logic - so we do not need to do it here.

  if (!launchVehicleNameValidityCheck(name)) {
    throw HTTPError(400, `${name} is not a valid name for a launch Vehicle`);
  }
  if (!launchVehicleDescriptionValidityCheck(description)) {
    throw HTTPError(400, `${description} is not a valid description for a launch Vehicle`);
  }
  if (!launchVehicleCrewWeightValidityCheck(maxCrewWeight)) {
    throw HTTPError(400, `${maxCrewWeight} is not a valid crew weight for a launch Vehicle`);
  }
  if (!launchVehiclePayloadWeightValidityCheck(maxPayloadWeight)) {
    throw HTTPError(400, `${maxPayloadWeight} is not a valid payload weight for a launch Vehicle`);
  }
  if (!launchVehicleWeightValidityCheck(launchVehicleWeight)) {
    throw HTTPError(400, `${launchVehicleWeight} is not a valid launch vehicle weight for a launch Vehicle`);
  }
  if (!launchVehicleThrustCapacityValidityCheck(thrustCapacity)) {
    throw HTTPError(400, `${thrustCapacity} is not a valid thrustCapacity for a launch Vehicle`);
  }
  if (!launchVehicleManeuveringFuelValidityCheck(maneuveringFuel)) {
    throw HTTPError(400, `${maneuveringFuel} is not a valid maneuveringFuel for a launch vehicle`);
  }

  const data = getData();

  const launchVehicleId = genLVID();

  const currentTime = getTime();

  const newLaunchVehicle: LaunchVehicle = {
    launchVehicleId,
    name,
    description,
    maxCrewWeight,
    maxPayloadWeight,
    launchVehicleWeight,
    thrustCapacity,
    maneuveringFuel,
    timeAdded: currentTime,
    timeLastEdited: currentTime,
    retired: false
  };

  data.launchVehiclesArray.push({ launchVehicle: newLaunchVehicle });
  setData(data);

  return { launchVehicleId };
}

export function launchVehicleInfo(launchVehicleId: number) {
  // check if launchVehicleId is valid
  if (!launchVehicleIdCheck(launchVehicleId)) {
    throw HTTPError(400, `${launchVehicleId} is not a valid launch vehicle id`);
  }

  const data = getData();
  const thisLaunchVehicle = data.launchVehiclesArray.find((lv) => lv.launchVehicle.launchVehicleId === launchVehicleId).launchVehicle;

  return {
    launchVehicleId: thisLaunchVehicle.launchVehicleId,
    name: thisLaunchVehicle.name,
    timeAdded: thisLaunchVehicle.timeAdded,
    timeLastEdited: thisLaunchVehicle.timeLastEdited,
    maxCrewWeight: thisLaunchVehicle.maxCrewWeight,
    maxPayloadWeight: thisLaunchVehicle.maxPayloadWeight,
    launchVehicleWeight: thisLaunchVehicle.launchVehicleWeight,
    thrustCapacity: thisLaunchVehicle.thrustCapacity,
    startingManeuveringFuel: thisLaunchVehicle.maneuveringFuel,
    retired: thisLaunchVehicle.retired,
    launches: genLVLaunchSummary(launchVehicleId)
  };
}

/**
 * Given controlUserSessionId, list all launch vehicles.
 *
 * @param {string} controlUserSessionId - The unique sessionId of the control user
 * @returns {launchVehicles: {launchVehicleId: number, name: string, assigned: boolean}[]} - Successful case: when listing all launch vehicles successfully
 * @throws {HTTPError} 401 - controlUserSessionId is empty or invalid
 */
export function launchVehicleList(controlUserSessionId: string) {
  // Use helper function to handle error
  findControlUserIdFromSessionId(controlUserSessionId);

  // get data
  const data = getData();

  // get information about all launch vehicles
  const newArray = data.launchVehiclesArray.filter(target => target.launchVehicle.retired === false).map(v => {
    return {
      launchVehicleId: v.launchVehicle.launchVehicleId,
      name: v.launchVehicle.name,
      assigned: data.launchesArray.some(l => l.launch.assignedLaunchVehicleId === v.launchVehicle.launchVehicleId)
    };
  });

  // return all information about launch vehicles
  return { launchVehicles: newArray };
}

// launchVehicleRetire
/**
 *  Given a particular launch vehicle, remove it from the list of available launch vehicles by setting its retired status to true.
 *
 * @param launchVehicleId
 * @returns
 */
export function launchVehicleRetire(launchVehicleId: number) {
  const data = getData();
  const lv = data.launchVehiclesArray.find(lv => lv.launchVehicle.launchVehicleId === launchVehicleId && !lv.launchVehicle.retired)?.launchVehicle;
  if (!lv) {
    throw HTTPError(400, 'Invalid launchVehicle Id');
  }
  const active = data.launchesArray.find(l =>
    l.launch.assignedLaunchVehicleId === launchVehicleId &&
    l.launch.state !== missionLaunchState.ON_EARTH
  );
  if (active) {
    throw HTTPError(400, 'Launch vehicle is active');
  }
  lv.retired = true;
  setData(data);
  return {};
}

// launchVehicleUpdate
/**
 *  Given a particular launch vehicle, remove it from the list of available launch vehicles by setting its retired status to true.
 *
 * @param launchVehicleId
 * @param name
 * @param description
 * @param maxCrewWeight
 * @param maxPayloadWeight
 * @param thrustCapacity
 * @param maneuveringFuel
 * @returns {}
 */
export function launchVehicleUpdate(launchVehicleId: number, name: string, description: string, maxCrewWeight: number, maxPayloadWeight: number, launchVehicleWeight: number, thrustCapacity: number, maneuveringFuel: number): Record<string, never> | { error: string, errorCategory: string } {
  const data = getData();

  const validVehicleError = validLaunchVehicle(name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel);

  if (validVehicleError !== null) {
    throw HTTPError(400, 'bad input');
  }

  const checkLaunchID = data.launchesArray.find(l => l.launch.assignedLaunchVehicleId === launchVehicleId && l.launch.state !== missionLaunchState.ON_EARTH);
  if (checkLaunchID) {
    throw HTTPError(400, 'this launchivehicleId is already active');
  }

  const updateInfo = data.launchVehiclesArray.find(f => f.launchVehicle.launchVehicleId === launchVehicleId);

  if (!updateInfo) {
    throw HTTPError(400, 'Invalid LaunchvehicleId');
  }

  updateInfo.launchVehicle.name = name;
  updateInfo.launchVehicle.description = description;
  updateInfo.launchVehicle.maxCrewWeight = maxCrewWeight;
  updateInfo.launchVehicle.maxPayloadWeight = maxPayloadWeight;
  updateInfo.launchVehicle.launchVehicleWeight = launchVehicleWeight;
  updateInfo.launchVehicle.thrustCapacity = thrustCapacity;
  updateInfo.launchVehicle.maneuveringFuel = maneuveringFuel;
  updateInfo.launchVehicle.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}
