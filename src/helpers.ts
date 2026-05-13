import { SpaceMission, DataStore, getData, Astronaut } from './dataStore';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';

/**
 *  Creating a new control user ID
 *
 * @returns {countid} - ID produce by controlUserIdGen
 */
export function controlUserIdGen(): number {
  const timeid: number = Date.now() / 10000;
  let countid: number = Math.floor(timeid);
  const id: number[] = getData().missionControlUsersArray.map(i => i.missionControlUser.controlUserId);
  while (id.includes(countid)) {
    countid += 1;
  }

  return countid;
}

/**
 * Checks whether the given password is valid.
 *
 * @param { character } password - The password of the user.
 *
 * @returns { boolean }  - Successful case: when the given password is valid.
 * @returns { boolean } - Error case: when the given password is not valid.
 */
export function passwordValidity(password : string) : boolean {
  const length : boolean = (password.length >= 8);
  const letters : boolean = /[a-zA-Z]/.test(password);
  const numbers : boolean = /\d/.test(password);

  if (length && letters && numbers) {
    return true;
  } else {
    return false;
  }
}

// set the help function of name validity
/**
  * <Check whether the name input is correct>
  *
  * @param {Char} name_first - The first name
  * @param {Char} name_last - The last name
  *
  * @returns {true} -  If is valid input true
  * @returns {false} - If is invalid input, false
*/
export function nameValidity(nameFirst: string, nameLast: string): boolean {
  if (nameFirst.length > 20 || nameLast.length > 20 ||
    nameFirst.length < 2 || nameLast.length < 2) {
    return false;
  } else if (!(/^[A-Za-z' -]+$/.test(nameFirst)) ||

    !(/^[A-Za-z' -]+$/.test(nameLast))) {
    return false;
  }

  return true;
}

/**
  * <creating a new missionId>
  *
  * @returns {countid} the random number of missionidGen
*/
export function missionIdGen(): number {
  const timeid = Date.now() / 10000;

  let countid = Math.floor(timeid);

  const id = getData().spaceMissionsArray.map(i => i.spaceMission.missionId);

  while (id.includes(countid)) {
    countid += 1;
  }

  return countid;
}

/**
 *  set the help function of mission name validity
 *  check the missionName id valid or not
 *
 * @param {string} - the name
 * @param {number} - the contorl cuser id
 *
* @returns {true}  - Successful case: when the given name is valid.
 * @returns {false} - Error case: when the given name is not valid.
 */
export function missionNameValidity(name: string, id: number): boolean {
  if (!name) return false;
  if (name.length < 3 || name.length > 30) return false;
  if (!/^[A-Za-z0-9 ]+$/.test(name)) return false;
  const data = getData();
  const checkName = data.spaceMissionsArray;
  const checkResult = checkName.find(n =>
    n.spaceMission.controlUserId === id &&
    n.spaceMission.name === name &&
    n.spaceMission.isMissionActive
  );
  if (checkResult) return false;
  return true;
}

/**
 * Checks whether the given mission description is valid.
 *
 * @param { string } description - The mission description text to validate.
 *
 * @returns { boolean }  - Successful case: the length of description not over 400 characters.
 * @returns { boolean } - Error case: the length of description is over 400 characters.
 */
export function missionDescriptionValidity(description : string) : boolean {
  const length : boolean = (description.length <= 400);

  if (length) {
    return true;
  } else {
    return false;
  }
}

/**
 * Checks whether the given mission target is valid.
 *
 * @param { string } target - The mission target text to validate.
 *
 * @returns { boolean }  - Successful case: the target is a string with length not over 100 characters.
 * @returns { boolean } - Error case: the target is not a string or the length is over 100 characters.
 */
export function missionTargetValidity(target : string) : boolean {
  const length : boolean = (target.length <= 100);

  if (length) {
    return true;
  } else {
    return false;
  }
}

export function emailValidity(email: string, currentUserId: number | null = null): string | null {
  // Check the email format.
  if (!validator.isEmail(email)) {
    return 'Wrong format';
  }
  const data = getData();
  const usersArray = data.missionControlUsersArray;
  const isEmailInUse = usersArray.some(element => {
    const user = element.missionControlUser;
    return user.email === email && user.controlUserId !== currentUserId;
  });
  if (isEmailInUse) {
    return 'Email in use';
  }
  // If both checks pass, the email is valid.
  return null;
}

// /**
//  * Checks whether the given controlUserId already exists in the data.
//  *
//  * @param {number} controlUserId - The unique controlUserId of the user, generated when the user first registers
//  *
//  * @returns {true}  - Successful case: when the given controlUserId exists.
//  * @returns {false} - Error case: when the given controlUserId does not exists.
//  */
// export function controlUserIdCheck(controlUserId: number): boolean {
//   const data: DataStore = getData();
//   const usersArray: {missionControlUser: MissionControlUser}[] = data.missionControlUsersArray;

//   const isControlUserIdExist = usersArray.some((user) => {
//     return user.missionControlUser.controlUserId === controlUserId;
//   });

//   return isControlUserIdExist;
// }

/**
 * Checks whether the given missionId already exists in the data.
 *
 * @param {number} missionId - The unique missionId of the space mission, generated when the mission was first created
 * @param {number} controlUserId - The unique controlUserId of the user, generated when the user first registers
 *
 * @returns {true}  - Successful case: when the given missionId exists and matches the given controlUserId at the same time.
 * @returns {false} - Error case: when the given missionId or (and) controlUserId do(es) not exists, or the missionId does not match the controlUserId.
 */
export function missionIdCheck(missionId: number, controlUserId: number): boolean {
  const data: DataStore = getData();
  const missionsArray: { spaceMission: SpaceMission }[] = data.spaceMissionsArray;

  const isMissionIdMatch: boolean = missionsArray.some((mission) => {
    return mission.spaceMission.missionId === missionId && mission.spaceMission.controlUserId === controlUserId;
  });

  return isMissionIdMatch;
}

/**
 * Create a controUserSessionId
 * @returns {string}  - a random string for controlUserSessionId
 */

export function controlUserSessionIdGen(): string {
  const controlUserSessionId = uuidv4();
  return controlUserSessionId;
}

/**
 * Find the userid from sessionid
 *
 * @param {string} controlUserSessionId - via unique controuserid to find its controluserId
 *
 * @returns {number} controUserId  - Successful find controuserid which match its unique controlUserSessionId
 */

export function findControlUserIdFromSession(controlUserSessionId: string): number | null {
  const data: DataStore = getData();

  const findControlUserId = data.controlUserSessionsArray.find(f => f.controlUserSession.controlUserSessionId === controlUserSessionId);
  if (!findControlUserId) {
    return null;
  }
  return findControlUserId.controlUserSession.controlUserId;
}

export function findControlUserIdFromSessionId(controlUserSessionId: string): number | null {
  if (controlUserSessionId === '') {
    throw HTTPError(401, 'Invalid controlUserSessionId');
  }

  const data: DataStore = getData();

  const findControlUserId = data.controlUserSessionsArray.find(f => f.controlUserSession.controlUserSessionId === controlUserSessionId);

  if (!findControlUserId) {
    throw HTTPError(401, 'Invalid controlUserSessionId');
  }

  return findControlUserId.controlUserSession.controlUserId;
}

/**
  * <creating a new AstronautId>
  *
  * @returns {astronautid} the random number of Astronaut
*/
export function astronautIdGen(): number {
  const timeid = Date.now() / 10000;
  let astronautId = Math.floor(timeid);
  const id = getData().astronautsArray.map(i => i.astronaut.astronautId);
  while (id.includes(astronautId)) {
    astronautId += 1;
  }
  return astronautId;
}

/**
 * Validates the specific details
 * @param rank - Must be 5-50 chars, lowercase letters, uppercase letters, spaces, hyphens, round brackets or apostrophes
 * @param age - Must be between 20 and 60
 * @param weight - Must not exceed 100 kg(not on moon)
 * @param height - Must be between 150 and 200 cm
 * @returns Error message string if invalid, null if valid.
 */

export function validateAstronautDetails(rank: string, age: number, weight: number, height: number): string | null {
  if (typeof rank !== 'string' || rank.length < 5 || rank.length > 50) {
    return 'Rank must be a string between 5 and 50 characters.';
  }

  if (!/^[A-Za-z' ()-]+$/.test(rank)) {
    return 'Rank contains invalid characters.';
  }
  if (typeof age !== 'number' || age < 20 || age > 60) {
    return 'Age must be a number between 20 and 60.';
  }
  if (typeof weight !== 'number' || weight <= 0 || weight > 100) {
    return 'Weight cannot exceed 100 kg.';
  }
  if (typeof height !== 'number' || height < 150 || height > 200) {
    return 'Height must between 150 and 200 cm.';
  }
  return null; // got a new astronaut!
}

/**
 * Finds an astronaut by their first and last name.
 * @param nameFirst
 * @param nameLast
 * @returns The astronaut object if found, otherwise null.
 */
export function findAstronautByName(nameFirst: string, nameLast: string): Astronaut | null {
  const data = getData();
  const astronautObject = data.astronautsArray.find(a =>
    a.astronaut.nameFirst === nameFirst && a.astronaut.nameLast === nameLast
  );
  return astronautObject ? astronautObject.astronaut : null;
}

/**
 * Finds an astronaut by their Id.
 * @param astronautId
 * @returns The astronaut object if found, otherwise null.
 */
export function findAstronautById(astronautId: number): Astronaut |null {
  const data = getData();
  const astronautObject = data.astronautsArray.find(a => a.astronaut.astronautId === astronautId);
  return astronautObject ? astronautObject.astronaut : null;
}

/**
 * Checks if an astronaut is currently assigned to a mission by checking their record.
 * @param astronautId The ID of the astronaut to check.
 * @returns True if assigned, false otherwise.
 */
export function isAstronautAssigned(astronautId: number): boolean {
  const astronaut = findAstronautById(astronautId);
  // if (!astronaut) {
  //   return false;
  // }
  if (astronaut.assignedMission && 'missionId' in astronaut.assignedMission) {
    // Check if the astronaut is assigned.
    return true;
  }
  return false;
}

/**
 * Validates the specific details
 * @param Name - contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes Name is less than 2 characters or more than 20 characters
 * @param description - Description contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes Description is less than 2 characters or more than 50 characters
 * @param maximumCrewWeigh - < 100 or > 1000
 * @param maximumPayloadWeight - < 100 or > 1000
 * @param launchVehicleWeight - < 1000 or > 100000
 * @param thrustCapacity  - < 100000 or > 10000000
 * @param maneuveringFuel - < 10 or > 100
 * @returns Error message string if invalid, null if valid.
 */
export function validLaunchVehicle(name: string, description: string, maxCrewWeight: number, maxPayloadWeight: number, launchVehicleWeight: number, thrustCapacity: number, maneuveringFuel: number): string | null {
  if (/[^A-Za-z '-]/.test(name)) {
    return 'Name contains invalid characters. ';
  }
  if (name.length > 20 || name.length < 2) {
    return 'Name contains invalid length.';
  }
  if (/[^A-Za-z '-]/.test(description)) {
    return 'Description contans invalid characters.';
  }
  if (description.length > 50 || description.length < 2) {
    return 'Description contains invalid length.';
  }
  if (typeof (maxCrewWeight) !== 'number' || maxCrewWeight > 1000 || maxCrewWeight < 100) {
    return 'Max crew weight is invalid.';
  }
  if (typeof (maxPayloadWeight) !== 'number' || maxPayloadWeight > 1000 || maxPayloadWeight < 100) {
    return 'Max pay load weight is invalid';
  }
  if (typeof (launchVehicleWeight) !== 'number' || launchVehicleWeight > 100000 || launchVehicleWeight < 1000) {
    return 'launch vehicleweight is invalid';
  }
  if (typeof (thrustCapacity) !== 'number' || thrustCapacity > 10000000 || thrustCapacity < 100000) {
    return 'thrust Capacity is invalid';
  }
  if (typeof (maneuveringFuel) !== 'number' || maneuveringFuel > 100 || maneuveringFuel < 10) {
    return 'maneuvering fuel is invalid';
  }

  return null;
}
