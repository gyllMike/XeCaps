// // This file should contain your functions relating to:
// // - adminAuth*
// // - adminControlUser*

import { DataStore, getData, setData, Session } from './dataStore';
import { controlUserIdGen, passwordValidity, nameValidity, emailValidity } from './helpers';
import { controlUserSessionIdGen } from './helpers';
import crypto from 'crypto';
import HTTPError from 'http-errors';

/**
  * Given the email, password and name to registers a mission control user and returns the generated controlUserId.
  *
  * @param {string} email - The email address that the controlUser uses to register
  * @param {string} password - The password that the controlUser sets to register and later logins
  * @param {string} nameFirst - The first name of the controlUser
  * @param {string} nameLast - The last name of the controlUser
  *
  * @returns { controlUserSessionId: string } - Successful case: when register successfully
  * @throws {HTTPError} 400 - Error case: bad input
*/
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { controlUserSessionId: string } {
  // check email validity
  if (emailValidity(email) !== null) {
    throw HTTPError(400, 'Email Invalid');
  }

  // check name validity
  if (nameValidity(nameFirst, nameLast) !== true) {
    throw HTTPError(400, 'Name Invalid');
  }

  // check password validity
  if (passwordValidity(password) !== true) {
    throw HTTPError(400, 'Password Invalid');
  }

  // get some data
  const data: DataStore = getData();
  const controlUserId: number = controlUserIdGen();
  const controlUserSessionId: string = controlUserSessionIdGen();
  const hashPassword = crypto.createHash('sha256').update(password).digest('hex');

  // push the information of the control user into controlUserArray of data
  data.missionControlUsersArray.push({
    missionControlUser: {
      controlUserId: controlUserId,
      nameFirst: nameFirst,
      nameLast: nameLast,
      email: email,
      oldPasswordArray: [],
      newPassword: hashPassword,
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0
    }
  });

  // push the information of the control user into controlUserSessionArray of data
  data.controlUserSessionsArray.push({
    controlUserSession: {
      controlUserSessionId: controlUserSessionId,
      controlUserId: controlUserId
    }
  });

  setData(data);

  // return controlUserSessionId
  return { controlUserSessionId: controlUserSessionId };
}

/**
  * Given the email, password and name to registers a mission control user and returns the generated controlUserId.
  *
  * @param {string} email - The email address that use to login
  * @param {string} password - The password use to login
  *
  * @returns { controlUserId: number } - Successful case: when login successfully
  * @returns { error: 'Wrong password', errorCategory: errorCategories.BAD_INPUT } - Error case: when password is incorrect
  * @returns { error: 'Email does not exist', errorCategory: errorCategories.BAD_INPUT } - Error case: when the email not exist
*/
export function adminAuthLogin(email: string, password: string): { controlUserSessionId: string } {
  const data = getData();
  if (!data.missionControlUsersArray || data.missionControlUsersArray.length === 0) {
    throw HTTPError(400, 'No user found');
  }

  const userObject = data.missionControlUsersArray.find(f => f.missionControlUser.email === email);
  if (!userObject) {
    throw HTTPError(400, 'Email does not exist');
  }
  const user = userObject.missionControlUser;
  const hashPassword = crypto.createHash('sha256').update(password).digest('hex');

  if (user.newPassword !== hashPassword) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw HTTPError(400, 'Wrong password');
  }

  user.numSuccessfulLogins++;
  user.numFailedPasswordsSinceLastLogin = 0;
  setData(data);
  const newData = getData();
  const newSessionId = controlUserSessionIdGen();

  const newSession: Session = {
    controlUserSessionId: newSessionId,
    controlUserId: user.controlUserId,
  };

  const controlUserSession = { controlUserSessionId: newSessionId };

  newData.controlUserSessionsArray.push({ controlUserSession: newSession });
  setData(newData);

  return controlUserSession;
}

/**
  * <Checking Error input of control user id, and return full details of control user>
  *
  * @param {NUMBER} ControlUserId - The ID of user, return in random number
  *
  * @returns { user :
  *  {
  *   controlUserId: find_userId.controlUserId,
  *    name: `${find_userId.nameFirst} ${find_userId.nameLast}`,
  *    email: find_userId.email,
  *    numSuccessfulLogins: find_userId.numSuccessfulLogins,
  *   numFailedPasswordsSinceLastLogin: find_userId.numFailedPasswordsSinceLastLogin,
  *  }
  * }
  * @returns {401, 'Wrong ControlUserId'} when controluserid in is error
  * return a valid details of specific control user
*/
export function adminControlUserDetails(controlUserId: number): {user:
    {
        controlUserId: number;
        name: string;
        email: string;
        numSuccessfulLogins: number;
        numFailedPasswordsSinceLastLogin: number
    }
    } {
  const data = getData();

  const userObj = data.missionControlUsersArray.find(f => f.missionControlUser.controlUserId === controlUserId);

  const findUserId = userObj.missionControlUser;
  // return valid details
  return {
    user:
    {
      controlUserId: findUserId.controlUserId,
      name: `${findUserId.nameFirst} ${findUserId.nameLast}`,
      email: findUserId.email,
      numSuccessfulLogins: findUserId.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: findUserId.numFailedPasswordsSinceLastLogin,
    },
  };
}

/**
 * Updates the details of an existing mission control user.
 *
 * @param { string } controlUserId - The unique identifier of the mission control user.
 * @param { string } email - The new email address for the mission control user.
 * @param { string } nameFirst - The new first name of the mission control user.
 * @param { string } nameLast - The new last name of the mission control user.
 *
 * @returns { } - Successful case: when the details are updated successfully.
 * @returns {{ error: string, errorCategory: 'BAD_INPUT' }} - Error case: invalid email or name input.
 * @returns {{ error: string, errorCategory: 'INVALID_CREDENTIALS' }} - Error case: invalid controlUserId.
 */
export function adminControlUserDetailsUpdate(controlUserId: number, email: string, nameFirst: string, nameLast: string): Record <string, never> | {error: string; errorCategory: string} {
  const data = getData();

  const user = data.missionControlUsersArray.find(
    (u) => u.missionControlUser.controlUserId === controlUserId
  );

  const emailCheck = emailValidity(email, controlUserId);
  if (emailCheck === 'Wrong format') {
    throw HTTPError(400, 'Email does not satisfy format.');
  } else if (emailCheck === 'Email in use') {
    throw HTTPError(400, 'Email is currently used by another user.');
  }

  if (!nameValidity(nameFirst, nameLast)) {
    throw HTTPError(400, 'NameFirst or NameLast is invalid.');
  }

  user.missionControlUser.email = email;
  user.missionControlUser.nameFirst = nameFirst;
  user.missionControlUser.nameLast = nameLast;

  setData(data);

  return {};
}

/**
 * Updates the password of an existing mission control user.
 *
 * @param { string } controlUserId - The unique identifier of the mission control user.
 * @param { string } oldPassword - The user's current password to verify identity.
 * @param { string } newPassword - The new password to be set for the user.
 *
 * @returns { } - Successful case: when the password is updated successfully.
 * @returns {{ error: string, errorCategory: 'INVALID_CREDENTIALS' }} - Error case: invalid controlUserId.
 * @returns {{ error: string, errorCategory: 'BAD_INPUT' }} - Error case: invalid password input, including wrong old password, reused new password, or identical old and new passwords.
 */
export function adminControlUserPasswordUpdate(controlUserId: number, oldPassword: string, newPassword: string): Record <string, never> | { error: string, errorCategory: string } {
  const data = getData();

  if (oldPassword === newPassword) {
    throw HTTPError(400, 'Old Password and New Password match exactly.');
  }

  const user = data.missionControlUsersArray.find(
    (u) => u.missionControlUser.controlUserId === controlUserId
  );

  if (passwordValidity(newPassword) === false) {
    throw HTTPError(400, 'New Password is not valid.');
  }

  const oldPasswords = user.missionControlUser.oldPasswordArray;
  const oldHashPassword = crypto.createHash('sha256').update(oldPassword).digest('hex');
  const newHashPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

  if (
    !oldPasswords.includes(oldHashPassword) &&
    user.missionControlUser.newPassword !== oldHashPassword
  ) {
    throw HTTPError(400, 'Old Password is not the correct old password.');
  }

  if (
    oldPasswords.includes(newHashPassword) ||
    user.missionControlUser.newPassword === newHashPassword
  ) {
    throw HTTPError(400, 'New Password has already been used before.');
  }

  oldPasswords.push(user.missionControlUser.newPassword);

  user.missionControlUser.newPassword = newHashPassword;

  setData(data);

  return {};
}

/**
 * Logs out the user
 * @param controlUserSessionId - The session ID of the user to log out.
 * @returns An empty object on success, or an error object.
 */

export function adminAuthLogout(controlUserSessionId: string): Record<string, never> | { error: string, errorCategory: string } {
  const data: DataStore = getData();
  const findIdx = data.controlUserSessionsArray.findIndex(i => i.controlUserSession.controlUserSessionId === controlUserSessionId);
  if (findIdx === -1) throw HTTPError(401, 'Invalid session');
  data.controlUserSessionsArray.splice(findIdx, 1);
  setData(data);
  return {};
}
