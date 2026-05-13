import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  adminLaunchStateUpdateRequest,
  requestLaunchList, // Our request helper!
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleMission1,
  sampleLaunchVehicle1,
  sampleLaunch1,
} from './sampleTestData';

describe('GET /v1/admin/launch/list', () => {
  let sessionId: string;
  let missionId: number;
  let lvId: number;

  beforeEach(() => {
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
  });

  describe('Error Tests', () => {
    test('401 Error: controlUserSessionId is invalid', () => {
      const res = requestLaunchList('invalid-session-id');
      expect(res.statusCode).toBe(401);
    });

    test('401 Error: controlUserSessionId is empty', () => {
      const res = requestLaunchList('');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Success Tests', () => {
    test('200 OK: Correct return for no launches', () => {
      const res = requestLaunchList(sessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        activeLaunches: [],
        completedLaunches: [],
      });
    });

    test('200 OK: Correct return for one active launch', () => {
      const lres = adminLaunchCreateRequest(sessionId, missionId, {
        launchVehicleId: lvId,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters,
      });
      expect(lres.statusCode).toBe(200);
      const launchId1 = JSON.parse(lres.body.toString()).launchId;

      const res = requestLaunchList(sessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        activeLaunches: [launchId1],
        completedLaunches: [],
      });
    });

    test('200 OK: Correct return for one completed launch', () => {
      // Create one launch
      const lres = adminLaunchCreateRequest(sessionId, missionId, {
        launchVehicleId: lvId,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters,
      });
      expect(lres.statusCode).toBe(200);
      const launchId1 = JSON.parse(lres.body.toString()).launchId;
      // Move it to a completed state
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId1, 'FAULT');
      const res = requestLaunchList(sessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        activeLaunches: [],
        completedLaunches: [launchId1],
      });
    });

    test('200 OK: Correct return for multiple active and completed launches', () => {
      const lres1 = adminLaunchCreateRequest(sessionId, missionId, {
        launchVehicleId: lvId,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters,
      });
      expect(lres1.statusCode).toBe(200);
      const launchId1 = JSON.parse(lres1.body.toString()).launchId;
      const lvres2 = adminLaunchVehicleCreateRequest(
        sessionId,
        'Another LV',
        'desc',
        500,
        1000,
        4000,
        1000000,
        10
      );
      expect(lvres2.statusCode).toBe(200);
      const lvId2 = JSON.parse(lvres2.body.toString()).launchVehicleId;
      const lres2 = adminLaunchCreateRequest(sessionId, missionId, {
        launchVehicleId: lvId2,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters,
      });
      const launchId2 = JSON.parse(lres2.body.toString()).launchId;
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId2, 'LIFTOFF');

      // Launch 3: Completed (ON_EARTH)
      const lvres3 = adminLaunchVehicleCreateRequest(
        sessionId,
        'Third LV',
        'desc',
        500,
        1000,
        4000,
        1000000,
        10
      );
      const lvId3 = JSON.parse(lvres3.body.toString()).launchVehicleId;
      const lres3 = adminLaunchCreateRequest(sessionId, missionId, {
        launchVehicleId: lvId3,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters,
      });
      const launchId3 = JSON.parse(lres3.body.toString()).launchId;
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId3, 'FAULT');
      const res = requestLaunchList(sessionId);
      expect(res.statusCode).toBe(200);

      // Check the arrays
      expect(res.body.activeLaunches).toEqual(
        expect.arrayContaining([launchId1, launchId2])
      );
      expect(res.body.activeLaunches).toHaveLength(2);
      expect(res.body.completedLaunches).toEqual(
        expect.arrayContaining([launchId3])
      );
      expect(res.body.completedLaunches).toHaveLength(1);
    });
  });
});
