// import { getData } from './dataStore';
// import { errorCategories } from './testSamples';

/**
 * Transfers a space mission from one control User to another controlUser
 *
 * @param {number} controlUserId - The controlUserId of the current user
 * @param {number} missionId - The missionId of the mission to be transfered
 * @param {string} userEmail - the email address of the target controlUser who will be the new owner of the space mission
 *
 * @returns
 *  {}
 */
// export function adminMissionTransfer(controlUserId: number, missionId: number, userEmail: string) {
//   // assumes a dataModel of { controlUsers: [], missions: []}
//   // potential errors:
//   //   userEmail is not a real control user
//   //   userEmail is the current logged in control user
//   //   missionId refers to a space mission that has a name that is already used by the target user
//   const data = getData();

//   const targetUser = data.controlUsers.find((user) => user.userEmail === userEmail);
//   if (!targetUser) {
//     return { error: `Can not find a control user with email: ${userEmail}`, errorCategory: errorCategories.BAD_INPUT };
//   }

//   const thisUser = data.controlUsers.find((user) => user.controlUserId === controlUserId);
//   // not a required check, just a legacy check from Iteration 1
//   if (!thisUser) {
//     return { error: `Can not find this control user with controlUserId: ${controlUserId}`, errorCategory: errorCategories.INVALID_CREDENTIALS };
//   } else if (thisUser.email === userEmail) {
//     return { error: `Can not transfer a mission to the same user: ${thisUser.email} -> ${userEmail}`, errorCategory: errorCategories.BAD_INPUT };
//   }

//   const targetMission = data.missions.find((mission) => mission.controlUserId === controlUserId);

//   // not a required check, just a legacy from Iteration 1
//   if (!targetMission) {
//     return { error: `Invalid mission to access: ${missiondId}`, errorCategory: errorCategories.INACCESSIBLE_VALUE };
//   } else {
//     const missionNameConflict = data.missions.find((mission) => mission.controlUserId === targetUser.controlUserId && mission.name === targetMission.name);
//     if (missionNameConflict) {
//       return { error: `Can not transfer a mission to user: ${targetUser.email} as they they own a mission with the same name: ${targetMission.name}`, errorCategory: errorCategories.BAD_INPUT };
//     }
//   }

//   targetMission.controlUserId = targetUser.controlUserId;
//   saveData(data);
//   return {};
// }
