// // This file should contain your functions relating to:
// // - adminAuth*
// // - adminControlUser*

import { DataStore, getData, setData, Session } from './dataStore';
import { controlUserIdGen, passwordValidity, nameValidity, emailValidity } from './helpers';
import { controlUserSessionIdGen } from './helpers';
import crypto from 'crypto';
import HTTPError from 'http-errors';

/**
  * Registers a new mission control user and creates an authenticated user session.
  *
  * @param email - The email address that the controlUser uses to register
  * @param password - The password that the controlUser sets to register and later logins
  * @param nameFirst - The first name of the controlUser
  * @param nameLast - The last name of the controlUser
  *
  * @returns An object containing the generated controlUserSessionId if the controlUser is successfully registered.
  * @throws {HTTPError} 400 - Error case: if the email, name or password is invalid.
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
  * Logs in an existing mission control user and creates an authenticated user session.
  *
  * @param email - The email address that the controlUser uses to log in
  * @param password - The password that the controlUser uses to log in
  *
  * @returns An object containing the generated controlUserSessionId if the controlUser is successfully logged in.
  * @throws {HTTPError} 400 - Error case: if no user is found, the email does not exist, or the password is incorrect.
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
  * Returns the full details of an existing mission control user.
  *
  * @param controlUserId - The unique identifier of the controlUser
  *
  * @returns An object containing the controlUser's id, name, email, successful login count and failed password count.
  * @throws {HTTPError} 401 - Error case: if the controlUserId is invalid.
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
  * Updates the email and name details of an existing mission control user.
  *
  * @param controlUserId - The unique identifier of the controlUser
  * @param email - The new email address for the controlUser
  * @param nameFirst - The new first name of the controlUser
  * @param nameLast - The new last name of the controlUser
  *
  * @returns An empty object if the controlUser details are successfully updated.
  * @throws {HTTPError} 400 - Error case: if the email or name is invalid.
  * @throws {HTTPError} 401 - Error case: if the controlUserId is invalid.
*/
export function adminControlUserDetailsUpdate(controlUserId: number, email: string, nameFirst: string, nameLast: string): Record<string, never> {
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
  * @param controlUserId - The unique identifier of the controlUser
  * @param oldPassword - The current password of the controlUser
  * @param newPassword - The new password to be set for the controlUser
  *
  * @returns An empty object if the controlUser password is successfully updated.
  * @throws {HTTPError} 400 - Error case: if the old password is incorrect, the new password is invalid, matches the old password, or has already been used.
  * @throws {HTTPError} 401 - Error case: if the controlUserId is invalid.
*/
export function adminControlUserPasswordUpdate(controlUserId: number, oldPassword: string, newPassword: string): Record<string, never> {
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
  * Logs out an authenticated mission control user session.
  *
  * @param controlUserSessionId - The session ID of the controlUser to log out
  *
  * @returns An empty object if the controlUser is successfully logged out.
  * @throws {HTTPError} 401 - Error case: if the controlUserSessionId is invalid.
*/
export function adminAuthLogout(controlUserSessionId: string): Record<string, never> {
  const data: DataStore = getData();
  const findIdx = data.controlUserSessionsArray.findIndex(i => i.controlUserSession.controlUserSessionId === controlUserSessionId);
  if (findIdx === -1) throw HTTPError(401, 'Invalid session');
  data.controlUserSessionsArray.splice(findIdx, 1);
  setData(data);
  return {};
}
