import {
  PayloadInput,
  LaunchCalcParameters,
  Launch,
  missionLaunchState,
  Payload,
  missionLaunchAction
} from './dataStore';

import {
  payloadDescriptionValidCheck,
  payloadWeightValidCheck,
  genPayloadId,
  genLaunchId,
  launchVehicleIdCheck,
  getTime,
  genAllocatedAstronautSummary,
  checkLaunchIdValidity,
  checkManeuveringFuel,
  canThisLaunchReachTargetDistanceCheck,
  badActionForStateError,
  initializeLaunching,
  initializeManeuvering,
  initializeCoasting,
  initializeMissionComplete,
  initializeReentry,
  initializeOnEarth,
  deployPayload
} from './newHelpers';
import { findControlUserIdFromSessionId } from './helpers';
import { getData, setData } from './dataStore';

import HTTPError from 'http-errors';
const EARTH_RADIUS = 6378000;

// payloadCreate
function payloadCreate(description: string, weight: number, launchVehicleId: number) {
  // 400 check to see if payload description is valid
  if (!payloadDescriptionValidCheck(description)) {
    throw HTTPError(400, `Payload Description: ${description} is not valid`);
  }
  // 400 check to see if payload weight is valid
  if (!payloadWeightValidCheck(weight, launchVehicleId)) {
    throw HTTPError(400, `Payload Weight: ${description} is not valid for Launch Vehicle: ${launchVehicleId}`);
  }
  // add a payload to dataStore
  const payloadId = genPayloadId();
  const newPayload: Payload = {
    payloadId: payloadId,
    description: description,
    weight: weight,
    deployed: false
  };
  // return a new payload
  return { newPayload };
}

// launchCreate
export function launchCreate(controlUserId: number,
  missionId: number,
  launchVehicleId: number,
  payload: PayloadInput,
  launchParams: LaunchCalcParameters
) {
  // 401 check to see if controlUserSessionId is valid - should be done in server call
  // 403 check to see if this controlUser has access to this mission - should be done in server call
  // 400 check to see if launchVehicleId is valid
  // - check if it is a value that exists in the datastore
  // - check that it is not in a retired state
  // - check that is is not in another launch that is in any state other than 'ON_EARTH' <- which means the launch is completed.
  if (!launchVehicleIdCheck(launchVehicleId)) {
    throw HTTPError(400, `LaunchVehicleId ${launchVehicleId} is not valid`);
  }
  const data = getData();
  const l = data.launchVehiclesArray.find(l => l.launchVehicle.launchVehicleId === launchVehicleId);
  if (l.launchVehicle.retired === true) throw HTTPError(400, `LaunchVehicleId ${launchVehicleId} is retired`);
  const active = data.launchesArray.some(l => l.launch.assignedLaunchVehicleId === launchVehicleId && l.launch.state !== missionLaunchState.ON_EARTH);
  if (active) throw HTTPError(400, 'Assigned launch vehicle');
  const lv = data.launchVehiclesArray.find(l => l.launchVehicle.launchVehicleId === launchVehicleId).launchVehicle;
  if (launchParams.thrustFuel < 0 ||
    launchParams.fuelBurnRate < 0 ||
    launchParams.activeGravityForce < 0 ||
    launchParams.targetDistance < 0
  ) {
    throw HTTPError(400, 'Input < 0');
  }
  if (launchParams.maneuveringDelay < 1) {
    throw HTTPError(400, 'maneuveringDelay < 1');
  }
  if (launchParams.fuelBurnRate > launchParams.thrustFuel) {
    throw HTTPError(400, 'fuelBurnRate > thrustFuel');
  }
  const w1 = payload.weight;
  const w2 = lv.launchVehicleWeight;
  const g = launchParams.activeGravityForce;
  const T = lv.thrustCapacity;
  const F = launchParams.fuelBurnRate;
  const M = launchParams.thrustFuel;
  const t = M / F;
  const Fnet = T - (w1 + w2) * g;
  const a = Fnet / (w1 + w2);
  const h = 0.5 * a * t * t;
  if (h < launchParams.targetDistance) {
    throw HTTPError(400, 'targetDistance not reachable');
  }

  // 400 check to see if any launchCalcParameters < 0
  // 400 check to see if maneuveringDelay < 1
  // 400 check to see if fuelBurnRate > thrustFuel
  // 400 check to see if your target distance is reachable with these parameters (and crewWeight of 0)

  // everything ok, now you can create a launch
  // first create a payload and use that payloadId
  const payloadObject = payloadCreate(payload.description, payload.weight, launchVehicleId);
  // need a DEEP COPY of your Mission so that if a mission gets changed, then the Launch Copy does not change
  data.payloadsArray.push({ payload: payloadObject.newPayload });
  const launchId = genLaunchId();
  const creationTime = getTime();
  const newLaunch: Launch = {
    launchId: launchId,
    missionCopy: structuredClone(data.spaceMissionsArray.find((m) => m.spaceMission.missionId === missionId).spaceMission),
    launchCreationTime: creationTime,
    timeLastEdited: creationTime,
    state: missionLaunchState.READY_TO_LAUNCH,
    assignedLaunchVehicleId: launchVehicleId,
    remainingLaunchVehicleManeuveringFuel: structuredClone(data.launchVehiclesArray.find((lv) => lv.launchVehicle.launchVehicleId === launchVehicleId).launchVehicle.maneuveringFuel),
    payloadId: payloadObject.newPayload.payloadId,
    allocatedAstronauts: [],
    launchCalculationParameters: launchParams,
    messageLog: []
  };

  data.launchesArray.push({ launch: newLaunch });
  setData(data);
  return { launchId: launchId };
}

// launchInfo
export function launchInfo(controlUserId: number,
  missionId: number,
  launchId: number
) {
  // these checks can be done in server.ts
  // 401 check to see if controlUserId is valid
  // 403 check to see if this controlUser has access to this mission

  // everything is ok
  // prepare the launchInfo
  // return the launchInfo object
  const data = getData();
  const thisLaunch = data.launchesArray.find(l => l.launch.launchId === launchId)?.launch;
  if (!thisLaunch) {
    throw HTTPError(400, 'Invalid Id');
  }
  const thislaunchVehicle = data.launchVehiclesArray.find(lv => lv.launchVehicle.launchVehicleId === thisLaunch.assignedLaunchVehicleId).launchVehicle;
  const thisPayload = data.payloadsArray.find(p => p.payload.payloadId === thisLaunch.payloadId).payload;

  return {
    launchId: thisLaunch.launchId,
    missionCopy: thisLaunch.missionCopy,
    timeCreated: thisLaunch.launchCreationTime,
    state: thisLaunch.state,
    launchVehicle: {
      launchVehicleId: thisLaunch.assignedLaunchVehicleId,
      name: thislaunchVehicle.name,
      maneuveringFuelRemaining: thisLaunch.remainingLaunchVehicleManeuveringFuel
    },
    payload: thisPayload,
    allocatedAstronauts: genAllocatedAstronautSummary(thisLaunch.allocatedAstronauts),
    launchCalculationParameters: thisLaunch.launchCalculationParameters
  };
}

// launchStateUpdate -> in updateSessionState.ts file
export function updateLaunchState(newAction: missionLaunchAction, launchId: number) {
  // check to make sure the launch id exists
  if (!checkLaunchIdValidity(launchId)) {
    throw HTTPError(400, 'invalid launchId');
  }

  // big switch statement to check if action is permitted in current state and if it is, what to do
  const data = getData();
  // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
  const launch: Launch = data.launchesArray.find((singleLaunch) => singleLaunch.launch.launchId === launchId).launch;

  switch (newAction) {
    case missionLaunchAction.LIFTOFF:
      if (launch.state === missionLaunchState.READY_TO_LAUNCH) {
        // this is ok, lets proceed with the actions
        if (!canThisLaunchReachTargetDistanceCheck(launchId)) {
          // bad launch, abort!
          initializeOnEarth(launchId);
          throw HTTPError(400, 'Unreachable distance');
        } else {
          // good launch move to LAUNCHING
          initializeLaunching(launchId);
        }
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.SKIP_WAITING:
      if (launch.state === missionLaunchState.LAUNCHING) {
        // this is ok, proceed with actions
        initializeManeuvering(launchId);
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.CORRECTION:
      if (launch.state === missionLaunchState.MANEUVERING) {
        // this is ok, lets proceed with the actions
        if (!checkManeuveringFuel(launchId)) {
          // not enough fuel, abort!
          initializeReentry(launchId);
          throw HTTPError(400, 'No enough fuel');
        } else {
          // enough fuel, move back to launching
          initializeLaunching(launchId);
        }
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.FIRE_THRUSTERS:
      if (launch.state === missionLaunchState.MANEUVERING) {
        // this is ok, lets proceed with the actions
        if (!checkManeuveringFuel(launchId)) {
          // not enough fuel, abort!
          initializeReentry(launchId);
          throw HTTPError(400, 'No enough fuel');
        } else {
          // enough fuel, moving to COASTING
          initializeCoasting(launchId);
        }
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.DEPLOY_PAYLOAD:
      if (launch.state === missionLaunchState.COASTING) {
        // this is ok, lets proceed with the actions
        deployPayload(launchId);
        initializeMissionComplete(launchId);
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.GO_HOME:
      if (launch.state === missionLaunchState.MISSION_COMPLETE) {
        // this is ok, lets proceed with the actions
        initializeReentry(launchId);
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.RETURN:
      if (launch.state === missionLaunchState.REENTRY) {
        // this is ok, lets proceed with the actions
        initializeOnEarth(launchId);
      } else {
        badActionForStateError(newAction, launch.state);
      }
      break;
    case missionLaunchAction.FAULT:
      if (launch.state === missionLaunchState.REENTRY || launch.state === missionLaunchState.MISSION_COMPLETE) {
        // this is an unpermitted action in this state.
        badActionForStateError(newAction, launch.state);
      } else if (launch.state === missionLaunchState.READY_TO_LAUNCH) {
        initializeOnEarth(launchId);
      } else {
        // this can proceed.
        initializeReentry(launchId);
      }
      break;
    default:
      throw HTTPError(400, `unkown action: ${newAction}`);
  }
  return {};
}

// launchList
export function launchList(sessionId: string): { activeLaunches: number[], completedLaunches: number[] } {
  // 1. Check for valid session (401 Error)
  findControlUserIdFromSessionId(sessionId);
  // 2. Get data and make lists
  const data = getData();
  const activeLaunches: number[] = [];
  const completedLaunches: number[] = [];

  for (const launchWrapper of data.launchesArray) {
    const launch = launchWrapper.launch;
    if (launch.state === missionLaunchState.ON_EARTH) {
      completedLaunches.push(launch.launchId);
    } else {
      activeLaunches.push(launch.launchId);
    }
  }

  // 3. Got the list!
  return { activeLaunches, completedLaunches };
}

// launchAstronautAllocate
export function launchAstronautAllocate(
  controlUserId: number,
  missionId: number,
  launchId: number,
  astronautId: number
) {
  const data = getData();

  // check 1: launchid is invalid
  const launch = data.launchesArray.find(l => l.launch.launchId === launchId)?.launch;
  if (!launch) {
    throw HTTPError(400, 'launchId is invalid.');
  }

  // check 2: astronautid is invalid
  const astronaut = data.astronautsArray.find(a => a.astronaut.astronautId === astronautId)?.astronaut;
  if (!astronaut) {
    throw HTTPError(400, 'astronautId is invalid.');
  }

  // check 3: The astronaut has not been assigned to the current mission
  const isAssignedToMission = launch.missionCopy.assignedAstronauts.some(
    a => a.astronautId === astronautId
  );
  if (!isAssignedToMission) {
    throw HTTPError(400, 'Astronaut is not assigned to this mission.');
  }

  // check 4: The astronaut is already allocated to another launch that has not ended
  const isActiveInAnotherLaunch = data.launchesArray.some(l =>
    l.launch.state !== missionLaunchState.ON_EARTH &&
    l.launch.allocatedAstronauts.includes(astronautId)
  );
  if (isActiveInAnotherLaunch) {
    throw HTTPError(400, 'Astronaut is already allocated to an active launch.');
  }

  // check 5: The total weight of all allocated astronauts would exceed the maxCrewWeight
  const launchVehicle = data.launchVehiclesArray.find(
    lv => lv.launchVehicle.launchVehicleId === launch.assignedLaunchVehicleId
  ).launchVehicle;

  const maxCrewWeight = launchVehicle.maxCrewWeight;

  let currentCrewWeight = 0;
  for (const id of launch.allocatedAstronauts) {
    const astro = data.astronautsArray.find(a => a.astronaut.astronautId === id).astronaut;
    currentCrewWeight += astro.weight;
  }

  const newAstronautWeight = astronaut.weight;

  if ((currentCrewWeight + newAstronautWeight) > maxCrewWeight) {
    throw HTTPError(400, 'Adding astronaut weight would exceed max crew weight');
  }

  launch.allocatedAstronauts.push(astronautId);
  launch.timeLastEdited = getTime();
  setData(data);

  return {};
}

/**
 * Given controlUserSessionId, astronautId, missionId and launchId, unallocate the astronaut from the launch
 *
 * @param controlUserSessionId - The unique sessionId of the control user
 * @param astronautId - The unique astronautId of the target astronaut that will be unallocated
 * @param missionId - The unique missionId of the target mission that the launch belongs to
 * @param launchId - The unique launchId of the target launch that the astronaut will unallocate from
 * @returns {Recore<string, never>} - Successful case: return an empty object when unallocate the astronaut from the launch successfully
 * @throws {HTTPError} 400 - astronautId or launchId is invalid, or the astronaut has not been allocated to the launch, or the launch has already started and still in progress
 * @throws {HTTPError} 401 - controlUserSessionId is empty or invalid
 * @throws {HTTPError} 403 - missionId does not exist or the control user is not an owner of the mission
 */
export function launchAstronautDeallocate(controlUserSessionId: string, astronautId: number, missionId: number, launchId: number) {
  const data = getData();

  // check controlUserSessionId
  const controlUserId = findControlUserIdFromSessionId(controlUserSessionId);

  // missionId does not exist
  const targetMission = data.spaceMissionsArray.find(m => m.spaceMission.missionId === missionId);

  if (targetMission === undefined) {
    throw HTTPError(403, 'missionId does not exist');
  }

  // controlUser is not the owner of the mission
  if (targetMission.spaceMission.controlUserId !== controlUserId) {
    throw HTTPError(403, 'control user is not an owner of this mission');
  }

  // astronautId is invalid
  const targetAstronaut = data.astronautsArray.find(a => a.astronaut.astronautId === astronautId);

  if (targetAstronaut === undefined) {
    throw HTTPError(400, 'astronautId is invalid');
  }

  // launchId is invalid
  const targetLaunch = data.launchesArray.find(l => l.launch.launchId === launchId);

  if (targetLaunch === undefined) {
    throw HTTPError(400, 'launchId is invalid');
  }

  // astronaut has not been allocated to this launch
  const isAstronautAllocated = targetLaunch.launch.allocatedAstronauts.some(id => id === astronautId);

  if (isAstronautAllocated === false) {
    throw HTTPError(400, 'astronaut not allocated to this launch');
  }

  // launch started and still in progress
  const launchStatus = launchInfo(controlUserId, missionId, launchId);
  if (launchStatus.state !== 'READY_TO_LAUNCH' && launchStatus.state !== 'ON_EARTH') {
    throw HTTPError(400, 'launch has started and still in progress');
  }

  // remove the astronaut
  const targetIndex = targetLaunch.launch.allocatedAstronauts.indexOf(astronautId);
  targetLaunch.launch.allocatedAstronauts.splice(targetIndex, 1);
  setData(data);

  return {};
}

/**
 * @param controlUserSessionId - The session ID of the user (must be valid).
 * @returns An object containing a list of deployed payload details.
 */
export function payloadDeployedList(controlUserSessionId: string) {
  // 401 Check
  findControlUserIdFromSessionId(controlUserSessionId);

  const data = getData();
  const currentTime = Math.floor(Date.now() / 1000);
  const deployedPayloads = data.payloadsArray.filter(p => p.payload.deployed === true);
  const deployedPayloadDetails = deployedPayloads.map(wrapper => {
    const payload = wrapper.payload;
    // find correspond la and lv
    const launchWrapper = data.launchesArray.find(l => l.launch.payloadId === payload.payloadId);
    const launch = launchWrapper.launch;
    const lvWrapper = data.launchVehiclesArray.find(v => v.launchVehicle.launchVehicleId === launch.assignedLaunchVehicleId);
    const lv = lvWrapper.launchVehicle;
    // calculation part
    const timeOfDeployment = launch.timeLastEdited;

    const launchDistance = launch.launchCalculationParameters.targetDistance;
    const orbitDistance = launchDistance + EARTH_RADIUS;
    const params = launch.launchCalculationParameters;
    const astronautWeight = data.astronautsArray.filter(a => launch.allocatedAstronauts.includes(a.astronaut.astronautId)).reduce((sum, a) => sum + a.astronaut.weight, 0);

    const totalWeight = astronautWeight + payload.weight + lv.launchVehicleWeight;

    const netForce = lv.thrustCapacity - (totalWeight * params.activeGravityForce);
    const acceleration = netForce / totalWeight;
    const burnTime = params.thrustFuel / params.fuelBurnRate;

    // Speed
    const speed = acceleration * burnTime;

    // Angle of Deviation
    const timeSinceDeployment = currentTime - timeOfDeployment;
    const distanceTraveled = speed * timeSinceDeployment;
    const fullOrbitRadians = 2 * Math.PI;
    const angleOfDeviation = (distanceTraveled / orbitDistance) % fullOrbitRadians;

    return {
      payloadId: payload.payloadId,
      description: payload.description,
      weight: payload.weight,
      speed: speed,
      timeOfDeployment: timeOfDeployment,
      relativePosition: {
        orbitDistance: orbitDistance,
        angleOfDeviation: angleOfDeviation,
      }
    };
  });

  return { deployedPayloads: deployedPayloadDetails };
}
