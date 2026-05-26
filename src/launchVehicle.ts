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

/**
  * Creates a new launch vehicle.
  *
  * @param name - The name of the launch vehicle
  * @param description - The description of the launch vehicle
  * @param maxCrewWeight - The maximum crew weight that the launch vehicle can carry
  * @param maxPayloadWeight - The maximum payload weight that the launch vehicle can carry
  * @param launchVehicleWeight - The weight of the launch vehicle
  * @param thrustCapacity - The thrust capacity of the launch vehicle
  * @param maneuveringFuel - The starting maneuvering fuel of the launch vehicle
  *
  * @returns An object containing the generated launchVehicleId if the launch vehicle is successfully created.
  * @throws {HTTPError} 400 - Error case: if any launch vehicle details are invalid.
*/
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

/**
  * Returns the full details of an existing launch vehicle.
  *
  * @param launchVehicleId - The unique identifier of the launch vehicle
  *
  * @returns An object containing the launch vehicle details and launch history summary.
  * @throws {HTTPError} 400 - Error case: if the launchVehicleId is invalid.
*/
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
  * Returns a list of all non-retired launch vehicles.
  *
  * @param controlUserSessionId - The session ID of the controlUser requesting the launch vehicle list
  *
  * @returns An object containing each launch vehicle's id, name and assignment status.
  * @throws {HTTPError} 401 - Error case: if the controlUserSessionId is invalid.
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

/**
  * Retires an existing launch vehicle.
  *
  * @param launchVehicleId - The unique identifier of the launch vehicle
  *
  * @returns An empty object if the launch vehicle is successfully retired.
  * @throws {HTTPError} 400 - Error case: if the launchVehicleId is invalid or the launch vehicle is assigned to an active launch.
*/
export function launchVehicleRetire(launchVehicleId: number): Record<string, never> {
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

/**
  * Updates the details of an existing launch vehicle.
  *
  * @param launchVehicleId - The unique identifier of the launch vehicle
  * @param name - The new name of the launch vehicle
  * @param description - The new description of the launch vehicle
  * @param maxCrewWeight - The new maximum crew weight that the launch vehicle can carry
  * @param maxPayloadWeight - The new maximum payload weight that the launch vehicle can carry
  * @param launchVehicleWeight - The new weight of the launch vehicle
  * @param thrustCapacity - The new thrust capacity of the launch vehicle
  * @param maneuveringFuel - The new starting maneuvering fuel of the launch vehicle
  *
  * @returns An empty object if the launch vehicle details are successfully updated.
  * @throws {HTTPError} 400 - Error case: if the launchVehicleId is invalid, the launch vehicle is assigned to an active launch, or any launch vehicle details are invalid.
*/
export function launchVehicleUpdate(launchVehicleId: number, name: string, description: string, maxCrewWeight: number, maxPayloadWeight: number, launchVehicleWeight: number, thrustCapacity: number, maneuveringFuel: number): Record<string, never> {
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
