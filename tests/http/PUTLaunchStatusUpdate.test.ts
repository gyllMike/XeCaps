import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  requestAdminAstronautAssign,
  requestAstronautCreate,
  adminLaunchStateUpdateRequest,
  adminLaunchInfoRequest,
  requestlaunchAllocate
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleMission1,
  sampleAstronaut1,
  sampleLaunchVehicle1,
  sampleLaunch1
} from './sampleTestData';

describe('GET LaunchStatusUpdate', () => {
  let sessionId: string;
  let missionId: number;
  let astronautId: number;
  let lvId: number;
  let lId: number;
  beforeEach(() => {
    // clear
    // adminAuthRegister
    // adminMissionCreate
    // adminLaunchVehicleCreate
    // adminAstronautCreate
    // adminAstronautAssign
    // adminLaunchCreate
    // adminAstronautAllocate
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
    requestAdminAstronautAssign(sessionId, astronautId, missionId);
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

  describe('Success tests', () => {
    test('correct output - expect {}', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF; expect LAUNCHING', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('LAUNCHING');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3; expect MANEUVERING', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('MANEUVERING');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, CORRECTION; expect LAUNCHING', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('LAUNCHING');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, CORRECTION, wait 3; expect MANEUVERING', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      expect(res.statusCode).toBe(200);
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('MANEUVERING');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, FIRE_THRUSTERS; expect COASTING', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('COASTING');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, FIRE_THRUSTERS, DEPLOY_PAYLOAD; expect MISSION_COMPLETE', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'DEPLOY_PAYLOAD');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('MISSION_COMPLETE');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, FIRE_THRUSTERS, DEPLOY_PAYLOAD, GO_HOME; expect RE_ENTRY', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'DEPLOY_PAYLOAD');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'GO_HOME');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('RE_ENTRY');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, FIRE_THRUSTERS, DEPLOY_PAYLOAD, GO_HOME, RETURN; expect ON_EARTH', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'DEPLOY_PAYLOAD');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'GO_HOME');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'RETURN');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('ON_EARTH');
    });
    test('Launch READY_TO_LAUNCH with action chain FAULT; expect ON_EARTH', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('ON_EARTH');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, FAULT, RETURN; expect ON_EARTH', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'RETURN');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('ON_EARTH');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, FAULT, RETURN; expect ON_EARTH', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'RETURN');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('ON_EARTH');
    });
    test('Launch READY_TO_LAUNCH with action chain LIFTOFF, wait 3, FIRE_THRUSTERS, FAULT, RETURN; expect ON_EARTH', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'RETURN');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('ON_EARTH');
    });
  });

  describe('Expected Error tests', () => {
    test('Test invalid controlUserSessionId session - launch status update', () => {
      const res = adminLaunchStateUpdateRequest('', missionId, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(401);
    });
    test('Test invalid missionId - launch status update', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, 444, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(403);
    });
    test('Test invalid launchId - launch status update', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, 444, 'LIFTOFF');
      expect(res.statusCode).toBe(400);
    });
    test('Launch READY_TO_LAUNCH with invalid actions', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'INVALID');
      expect(res.statusCode).toBe(400);
    });
    test('Launch LAUNCHING with invalid actions', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(400);
    });
    test('Launch SKIP_WAITING with invalid actions', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      expect(res.statusCode).toBe(400);
    });
    test('Launch CORRECTION with invalid actions', () => {
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      expect(res.statusCode).toBe(400);
    });
    test('Launch DEPLOY_PAYLOAD with invalid actions', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'DEPLOY_PAYLOAD');
      expect(res.statusCode).toBe(400);
    });
    test('Launch COASTING with invalid actions', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      expect(res.statusCode).toBe(400);
    });
    test('Launch MISSION_COMPLETE with invalid actions', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'GO_HOME');
      expect(res.statusCode).toBe(400);
    });
    test('Launch RE_ENTRY with invalid actions', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'DEPLOY_PAYLOAD');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'RETURN');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      expect(res.statusCode).toBe(400);
    });
    test('Attempted LIFTOFF with unreachable launch parameters', () => {
      const blres = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: {
            description: 'UNSW Cubesat',
            weight: 999999999999999
          },
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      lId = JSON.parse(blres.body.toString()).launchId;
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(400);
    });
    test('Attempted CORRECTION with insufficient maneuvering fuel', () => {
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
      requestAdminAstronautAssign(sessionId, missionId, astronautId);
      const lvres = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        11
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
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      expect(res.statusCode).toBe(400);
    });
    test('Attempted FIRE_THRUSTERS with insufficient maneuvering fuel', () => {
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
      requestAdminAstronautAssign(sessionId, missionId, astronautId);
      const lvres = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        11
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
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'CORRECTION');
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'SKIP_WAITING');
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FIRE_THRUSTERS');
      expect(res.statusCode).toBe(400);
    });
    test('over weight', () => {
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
      requestAdminAstronautAssign(sessionId, astronautId, missionId);
      const lvres = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        11
      );
      lvId = JSON.parse(lvres.body.toString()).launchVehicleId;
      const lres = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: {
            targetDistance: 270000,
            fuelBurnRate: 20,
            thrustFuel: 1000,
            activeGravityForce: 9.8,
            maneuveringDelay: 2
          }
        }
      );
      lId = JSON.parse(lres.body.toString()).launchId;
      requestlaunchAllocate(sessionId, missionId, lId, astronautId);
      const res = adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
      expect(res.statusCode).toBe(400);
      const inres = adminLaunchInfoRequest(sessionId, missionId, lId);
      const info = JSON.parse(inres.body.toString());
      expect(info.state).toBe('ON_EARTH');
    });
  });
});
