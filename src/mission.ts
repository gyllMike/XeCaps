// // This file should contain your functions relating to:
// // - adminMission*
import { DataStore, getData, setData, SpaceMission } from './dataStore';
import { missionIdGen, missionNameValidity, missionDescriptionValidity, missionTargetValidity, findControlUserIdFromSessionId, isAstronautAssigned } from './helpers';
import { missionIdCheck } from './helpers';
import HTTPError from 'http-errors';

interface MissionListItem {
  missionId: number;
  name: string;
}

interface MissionListSuccess {
  missions: MissionListItem[];
}

export function adminMissionTargetUpdate(sessionId: string, missionId: number, target: string) {
  const controlUserId = findControlUserIdFromSessionId(sessionId);

  // 1. Verify the mission exists and the user owns it.
  if (!missionIdCheck(missionId, controlUserId)) {
    throw HTTPError(403, 'Mission ID does not exist');
  }

  // 2. Validate the new target's length.
  if (!missionTargetValidity(target)) {
    throw HTTPError(400, 'Target is more than 100 characters');
  }

  // 3. Find and update the mission.
  const data: DataStore = getData();
  const missionObject = data.spaceMissionsArray.find(m => m.spaceMission.missionId === missionId);

  // Update the target and the last edited timestamp.
  missionObject.spaceMission.target = target;
  missionObject.spaceMission.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};
}

/**
  *  Returns a list of all space missions that are owned by the currently logged in control user.
  *
  * @param {number} controlUserId - use to find the target user
  *
  * @return {missionId} - the mission id number
  * @return {name} - the mission name
*/
export function adminMissionList (controlUserId: number): MissionListSuccess | { error: string, errorCategory: string } {
  const data = getData();
  return {
    missions: data.spaceMissionsArray.filter(i => i.spaceMission.controlUserId === controlUserId && i.spaceMission.isMissionActive)
      .map(i => ({
        missionId: i.spaceMission.missionId,
        name: i.spaceMission.name,
      })),
  };
}

/* Given basic details about a new space mission, create one for the logged in control user. */
export function adminMissionCreate (sessionId: string, name: string, description: string, target: string): { missionId: number } | { error: string, errorCategory: string } {
  const controlUserId = findControlUserIdFromSessionId(sessionId);

  // 1. BAD_INPUT Checks for Mission Name
  if (missionNameValidity(name, controlUserId) !== true) {
    throw HTTPError(400, 'Mission name is invalid.');
  }

  // 2. BAD_INPUT Check for Description length
  if (description.length > 400) {
    throw HTTPError(400, 'Description is more than 400 characters in length.');
  }

  // 3. BAD_INPUT Check for Target length
  if (!missionTargetValidity(target)) {
    throw HTTPError(400, 'Target is more than 100 characters in length.');
  }

  // 4. Create the new mission.
  const data: DataStore = getData();
  const newMissionId: number = missionIdGen();
  const currentTime: number = Math.floor(Date.now() / 1000); // Current time as a Unix timestamp in seconds

  const newMission: SpaceMission = {
    controlUserId: controlUserId,
    missionId: newMissionId,
    name: name,
    timeCreated: currentTime,
    timeLastEdited: currentTime,
    description: description,
    target: target,
    isMissionActive: true,
    assignedAstronauts: [],
  };

  data.spaceMissionsArray.push({ spaceMission: newMission });
  setData(data);

  // 5. Return mission's ID.
  return { missionId: newMissionId };
}

/**  Given a particular missionId, permanently remove the space mission.
 *
 * @param {number} controlUserId - the target mission's user ID
 * @param {number} missionId - the target mission ID
 *
 * @return {} - return empty if remove successfully
*/
export function adminMissionRemove(controlUserId: number, missionId: number): Record<string, never> {
  const data: DataStore = getData();
  if (!missionIdCheck(missionId, controlUserId)) throw HTTPError(403, 'Invalid missionID');
  const missionObj = data.spaceMissionsArray.find(m => m.spaceMission.missionId === missionId && m.spaceMission.controlUserId === controlUserId);
  if (missionObj.spaceMission.assignedAstronauts.some(a => Object.keys(a).length > 0)) {
    throw HTTPError(400, 'Astronaut assigned to mission');
  }
  if (!missionObj.spaceMission.isMissionActive) throw HTTPError(403, 'Mission already remove');
  missionObj.spaceMission.isMissionActive = false;
  setData(data);
  return { };
}

/**
 * Given controlUserId and missionId to get access to all of the information of that specific space mission.
 *
 * @param {number} controlUserId - The unique controlUserId of the user, generated when the user first registers
 * @param {number} missionId - The unique missionId of the space mission, generated when the mission was first created
 *
 * @returns {{ missionId: number, name: string, timeCreated: number, timeLastEdited: number, description: string, target: string, assignedAstronauts: { astronautId: number, designation: string }[] }} - Successful case: when the space mission exists and matches the controlUser
 * @throws {HTTPError} 401 - Error case: when the controlUserId is invalid
 * @throws {HTTPError} 403 - Error case: when the missionId does not exist or does not match this controlUserId.
 */
export function adminMissionInfo(controlUserId: number, missionId: number): { missionId: number, name: string, timeCreated: number, timeLastEdited: number, description: string, target: string, assignedAstronauts: { astronautId: number, designation: string }[] } {
  const data: DataStore = getData();
  const missionArray: { spaceMission: SpaceMission }[] = data.spaceMissionsArray;

  // missionId is invalid
  if (!missionIdCheck(missionId, controlUserId)) {
    throw HTTPError(403, 'Invalid missionId');
  }

  // get target mission
  const mission: { spaceMission: SpaceMission } = missionArray.find((missionObj) => {
    return missionObj.spaceMission.missionId === missionId && missionObj.spaceMission.controlUserId === controlUserId;
  });

  // get array of astronautIds
  const idArray = mission.spaceMission.assignedAstronauts;

  // get information about the target astronaut
  const astronautsArray = idArray.filter(idObject => idObject.astronautId !== undefined).map(idObject => {
    const astronaut = data.astronautsArray.find(astronaut => astronaut.astronaut.astronautId === idObject.astronautId);
    const designation = `${astronaut.astronaut.rank} ${astronaut.astronaut.nameFirst} ${astronaut.astronaut.nameLast}`;
    return {
      astronautId: idObject.astronautId,
      designation: designation
    };
  });

  // return the final information of the target mission
  return {
    missionId: mission.spaceMission.missionId,
    name: mission.spaceMission.name,
    timeCreated: mission.spaceMission.timeCreated,
    timeLastEdited: mission.spaceMission.timeLastEdited,
    description: mission.spaceMission.description,
    target: mission.spaceMission.target,
    assignedAstronauts: astronautsArray
  };
}

/**
  * <Checking Error input of ControlUserId, MissionId and name>
  *
  * @param {NUMBER} controlUserId - The ID of user, return in random number
  * @param {NUMBER} missionId - The ID of mission id above specific ControlUserId
  * @param {Char} name - The name of mission
  *
  * @returns {{}} - Return a empty object
  * @returns {401, 'Control User Id Invalidity'} invalid_credentials when controluserid is in error type
  * @return {403, 'Mission Id Invalidity'} inaccessible_value when missionid is in error
  * @return {400, 'mission name Invalidity'}  bad_input when name is in error
*/
export function adminMissionNameUpdate(controlUserId: number, missionId: number, name: string): Record<string, never> {
  if (missionIdCheck(missionId, controlUserId) === false || !missionId) {
    throw HTTPError(403, 'badinput');
  }

  if (missionNameValidity(name, controlUserId) === false || !name) {
    throw HTTPError(400, 'badinput');
  }

  const data = getData();
  const mission = data.spaceMissionsArray.find(m => m.spaceMission.missionId === missionId);

  // update name
  mission.spaceMission.name = name;
  mission.spaceMission.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
}

/**
  * <Checking Error input of ControlUserId, MissionId and Description>
  *
  * @param {number} controlUserId - The ID of user, return in random number
  * @param {number} missionId - The ID of mission id above specific ControlUserId
  * @param {char} description - The description of specific mission
  *
  * @returns {{}} - Return a empty object
  * @returns {401, 'Control User Id Invalidity'} invalid_credentials when controluserid is in error type
  * @return {402, 'Mission Id Invalidity'} inaccessible_value when missionid is in error
  * @return {403, 'mission description Invalidity'}  bad_input when descripition is in error
*/

export function adminMissionDescriptionUpdate(controlUserId: number, missionId: number, description: string): Record<string, never> {
  if (!missionId || missionIdCheck(missionId, controlUserId) === false) {
    throw HTTPError(403, 'badinput');
  }

  if (missionDescriptionValidity(description) === false) {
    throw HTTPError(400, 'badinput');
  }

  const data = getData();
  const mission = data.spaceMissionsArray.find(m => m.spaceMission.missionId === missionId);

  mission.spaceMission.description = description;
  mission.spaceMission.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
}

/**
 * Given the sessionId, missionId and astronautId, assign the astronaut (referred by astronautId) to the mission (referred by missionId).
 *
 * @param {string} controlUserSessionId - The unique sessionId of the control user
 * @param {number} missionId - The unique missionId of the target mission that the astronaut will assign to
 * @param {number} astronautId - The unique astronautId of the target astronaut that will be assigned
 * @returns {Record<string, never>} - Successful case: return empty object when assigning the astronaut to the mission successfully
 * @throws {HTTPError} 400 - astronautId is invalid, or the astronaut is already assigned to another mission
 * @throws {HTTPError} 401 - controlUserSessionId is empty or invalid
 * @throws {HTTPError} 403 - missionId does not exist, or the controlUser is not the owner of the mission
 */
export function adminAstronautAssign(controlUserSessionId: string, missionId: number, astronautId: number): Record<string, never> {
  const data = getData();

  // sessionId is empty
  if (controlUserSessionId === '') {
    throw HTTPError(401, 'controlUserSessionId is empty');
  }

  // get controlUserId
  const controlUserId = findControlUserIdFromSessionId(controlUserSessionId);

  // get target mission and handle error
  const targetMission = data.spaceMissionsArray.find(mission => mission.spaceMission.missionId === missionId);
  if (targetMission === undefined || targetMission.spaceMission.isMissionActive === false) {
    throw HTTPError(403, 'mission does not exist');
  }

  // control user does not correspond with the mission
  if (targetMission.spaceMission.controlUserId !== controlUserId) {
    throw HTTPError(403, 'the control user is not an owner of this mission');
  }

  // get target astronaut and handle error
  const targetAstronaut = data.astronautsArray.find(astronaut => astronaut.astronaut.astronautId === astronautId);
  if (targetAstronaut === undefined) {
    throw HTTPError(400, 'astronautId is invalid');
  }

  // check whether the target astronaut has already been assigned to another mission and handle error
  const isAstronautAlreadyAssigned = data.spaceMissionsArray.some(mission => mission.spaceMission.missionId !== missionId && mission.spaceMission.assignedAstronauts.some(id => id.astronautId === astronautId));
  if (isAstronautAlreadyAssigned === true) {
    throw HTTPError(400, 'astronaut already assigned in another mission');
  }

  // get astronaut
  const astronaut = data.astronautsArray.find(a => a.astronaut.astronautId === astronautId).astronaut;

  // push information into both astronaut and mission
  targetMission.spaceMission.assignedAstronauts.push({ astronautId, designation: `${astronaut.rank} ${astronaut.nameFirst} ${astronaut.nameLast}` });
  targetAstronaut.astronaut.assignedMission = { missionId };

  setData(data);

  return {};
}

/**
 * Given the sessionId, missionId and astronautId, unassign the astronaut (referred by astronautId) to the mission (referred by missionId).
 *
 * @param {string} controlUserSessionId - The unique sessionId of the control user
 * @param {number} missionId - The unique missionId of the target mission that the astronaut will assign to
 * @param {number} astronautId - The unique astronautId of the target astronaut that will be assigned
 * @returns {Record<string, never>} - Successful case: return empty object when assigning the astronaut to the mission successfully
 * @throws {HTTPError} 400 - astronautId is invalid, or the astronaut is not assigned to this mission
 * @throws {HTTPError} 401 - controlUserSessionId is empty or invalid
 * @throws {HTTPError} 403 - missionId does not exist, or the controlUser is not the owner of the mission
 */
export function adminAstronautUnassign(controlUserSessionId: string, missionId: number, astronautId: number): Record<string, never> {
  const data = getData();

  if (controlUserSessionId === '') {
    throw HTTPError(401, 'controlUserSessionId is empty');
  }

  const controlUserId = findControlUserIdFromSessionId(controlUserSessionId);

  const targetMission = data.spaceMissionsArray.find(mission => mission.spaceMission.missionId === missionId);

  if (targetMission === undefined) {
    throw HTTPError(403, 'mission does not exist');
  }

  if (targetMission.spaceMission.isMissionActive === false || targetMission.spaceMission.controlUserId !== controlUserId) {
    throw HTTPError(403, 'the control user is not an owner of this mission');
  }

  const targetAstronaut = data.astronautsArray.find(astronaut => astronaut.astronaut.astronautId === astronautId);

  if (targetAstronaut === undefined) {
    throw HTTPError(400, 'astronautId is invalid');
  }

  const isAstronautAssignedAlready = isAstronautAssigned(astronautId);

  if (isAstronautAssignedAlready === false) {
    throw HTTPError(400, 'astronaut not assigned in the mission');
  }

  for (const currentLaunch of data.launchesArray) {
    const isAstronautInLaunch = currentLaunch.launch.allocatedAstronauts.some(id => id === astronautId);
    if (isAstronautInLaunch === true) {
      throw HTTPError(400, 'astronaut already allocated to a launch');
    }
  }

  targetMission.spaceMission.assignedAstronauts = targetMission.spaceMission.assignedAstronauts.filter(ast => ast.astronautId !== astronautId);
  delete targetAstronaut.astronaut.assignedMission.missionId;

  setData(data);

  return {};
}
