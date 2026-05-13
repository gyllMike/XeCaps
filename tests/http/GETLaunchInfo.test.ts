// checks all the values for 400 errors ::
// launchVehicleId is valid

// checks for 401 errors::
// controlUserSessionId is not valid or is empty

// Test Structure

// setup (beforeEach)
//  use clearRequest to reset the dataStore
//  use adminAuthRegisterRequest to create a user
//  use that controlUserSessionId to manage the rest of our tests
//  use adminLaunchVehicleCreate to create a launchVehicle

// additional functions
// None

// Success tests
//  1. check valid output with valid input
//  2. No dataStore modification checks needed as we are doing a GET request

// Error tests
// at least 1 for each of the conditions in the swagger
// make sure to check for the appropriate status code in the error
// three types of tests:
// strings:
// 1. content is made of expected characters
// 2. length of string is within expected length
// numbers:
// 1. numbers fall within expected boundaries

import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  adminLaunchInfoRequest,
  requestAdminAstronautAssign,
  requestAstronautCreate,
  requestlaunchAllocate
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleMission1,
  sampleLaunchVehicle1,
  sampleLaunch1,
  sampleAstronaut1
} from './sampleTestData';

describe('GET LaunchInfo', () => {
  let sessionId: string;
  let missionId: number;
  let lvId: number;
  let lId: number;
  let astronautId: number;
  beforeEach(() => {
    // clear
    // adminAuthRegister
    // adminMissionCreate
    // adminLaunchVehicleCreate
    // adminLaunchCreate
    requestClear();
    const user = requestAdminAuthRegister(
      sampleUser1.email,
      sampleUser1.password,
      sampleUser1.nameFirst,
      sampleUser1.nameLast
    );
    sessionId = user.body.controlUserSessionId;
    const mission = requestadminMissionCreate(
      sessionId,
      sampleMission1.name,
      sampleMission1.description,
      sampleMission1.target
    );
    missionId = mission.body.missionId;
    const ares = requestAstronautCreate(
      sessionId,
      sampleAstronaut1.nameFirst,
      sampleAstronaut1.nameLast,
      sampleAstronaut1.rank,
      sampleAstronaut1.age,
      sampleAstronaut1.weight,
      sampleAstronaut1.height
    );
    astronautId = ares.body.astronautId;
    const a = requestAdminAstronautAssign(sessionId, astronautId, missionId);
    const lvres = adminLaunchVehicleCreateRequest(
      sessionId,
      sampleLaunchVehicle1.name,
      sampleLaunchVehicle1.description,
      sampleLaunchVehicle1.maxCrewWeight,
      sampleLaunchVehicle1.maxPayloadWeight,
      sampleLaunchVehicle1.launchVehicleWeight,
      sampleLaunchVehicle1.thrustCapacity,
      sampleLaunchVehicle1.maneuveringFuel
    );
    lvId = JSON.parse(lvres.body.toString()).launchVehicleId;
    const lres = adminLaunchCreateRequest(
      sessionId,
      missionId,
      {
        launchVehicleId: lvId,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters
      }
    );
    lId = JSON.parse(lres.body.toString()).launchId;
  });

  describe('Success Tests', () => {
    test('Correct output', () => {
      const allocateRes = requestlaunchAllocate(sessionId, missionId, lId, astronautId);
      expect(allocateRes.statusCode).toBe(200);
      const res = adminLaunchInfoRequest(sessionId, missionId, lId);
      expect(res.statusCode).toBe(200);
      const info = JSON.parse(res.body.toString());
      expect(info.missionCopy.assignedAstronauts[0]).toHaveProperty('designation')
      expect(info).toMatchObject({
        launchId: lId,
        launchVehicle: {
          launchVehicleId: lvId
        },
        missionCopy: {
          missionId: missionId
        }
      });
    });
    // use adminLaunchInfo and the sampleData to check
  });

  describe('Expected Error Tests', () => {
    test('Valid ControlUserSessionId', () => {
      const res = adminLaunchInfoRequest('', missionId, lId);
      expect(res.statusCode).toBe(401);
    });
    test('Valid missionId', () => {
      const res = adminLaunchInfoRequest(sessionId, 11, lId);
      expect(res.statusCode).toBe(403);
    });
    test('Valid launchId', () => {
      const res = adminLaunchInfoRequest(sessionId, missionId, 22);
      expect(res.statusCode).toBe(400);
    });
  });
});
