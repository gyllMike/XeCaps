import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  adminLaunchInfoRequest,
  requestAstronautCreate,
  requestAdminAstronautAssign,
  adminLaunchStateUpdateRequest,
  launchVehicleRetireRequest
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleMission1,
  sampleLaunchVehicle1,
  sampleLaunch1,
  sampleAstronaut1,
  sampleLaunchVehicle2,
  sampleMission2
} from './sampleTestData';

describe('POST LaunchCreate', () => {
  let sessionId: string;
  let missionId: number;
  let lvId: number;
  beforeEach(() => {
    // clear
    // adminAuthRegister
    // adminMissionCreate
    // adminLaunchVehicleCreate
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

  describe('Success Tests', () => {
    test('Correct output', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString()).launchId).toEqual(expect.any(Number));
    });
    test('Multiple correct output', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      const lvres1 = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle2.name,
        sampleLaunchVehicle2.description,
        sampleLaunchVehicle2.maxCrewWeight,
        sampleLaunchVehicle2.maxPayloadWeight,
        sampleLaunchVehicle2.launchVehicleWeight,
        sampleLaunchVehicle2.thrustCapacity,
        sampleLaunchVehicle2.maneuveringFuel
      );
      const lvId1 = JSON.parse(lvres1.body.toString()).launchVehicleId;
      const mission1 = requestadminMissionCreate(
        sessionId,
        sampleMission2.name,
        sampleMission2.description,
        sampleMission2.target
      );
      const missionId1 = mission1.body.missionId;
      const res1 = adminLaunchCreateRequest(
        sessionId,
        missionId1,
        {
          launchVehicleId: lvId1,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(200);
      expect(res1.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString()).launchId).toEqual(expect.any(Number));
    });
    // use adminLaunchCreate

    test('Correct datastore update', () => {
      const cres = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(cres.statusCode).toBe(200);
      const lId = JSON.parse(cres.body.toString()).launchId;
      const res = adminLaunchInfoRequest(sessionId, missionId, lId);
      expect(res.statusCode).toBe(200);
      const info = JSON.parse(res.body.toString());
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
    // use adminLaunchCreate and adminLaunchInfo
  });

  describe('Expected Error Tests', () => {
    test('Valid ControlUserSessionId', () => {
      const res = adminLaunchCreateRequest(
        '',
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(401);
    });
    test('Valid missionId', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        1,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(403);
    });
    test('Valid launchVehicleId', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: 1,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('launchVehicleId is not in an active launch', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(200);
      const res2 = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res2.statusCode).toBe(400);
    });
    test('launchVehicleId is not retired', () => {
      const ares = requestAstronautCreate(
        sessionId,
        sampleAstronaut1.nameFirst,
        sampleAstronaut1.nameLast,
        sampleAstronaut1.rank,
        sampleAstronaut1.age,
        sampleAstronaut1.weight,
        sampleAstronaut1.height
      );
      const astronautId = ares.body.astronautId;
      requestAdminAstronautAssign(sessionId, missionId, astronautId);
      const lres = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      const lId = JSON.parse(lres.body.toString()).launchId;
      adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
      launchVehicleRetireRequest(sessionId, lvId);
      const cres = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(cres.statusCode).toBe(400);
    });
    test('Valid payload description length test', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: {
            description: 'a'.repeat(51),
            weight: 400
          },
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('Payload weight less than maxPayloadWeight for the launchVehicle', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: {
            description: 'UNSW Cubesat',
            weight: -1
          },
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('launch calc parameters > 0 tests', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: {
            targetDistance: 0,
            fuelBurnRate: 20,
            thrustFuel: -1,
            activeGravityForce: 9.8,
            maneuveringDelay: 2
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('maneuvering delay < 1', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: {
            targetDistance: 12000,
            fuelBurnRate: 20,
            thrustFuel: 1000,
            activeGravityForce: 9.8,
            maneuveringDelay: 0
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('fuel rate > thrustfuel', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: {
            targetDistance: 12000,
            fuelBurnRate: 99999,
            thrustFuel: 1000,
            activeGravityForce: 9.8,
            maneuveringDelay: 2
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('is the target distance reachable', () => {
      const res = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId,
          payload: sampleLaunch1.payload,
          launchParameters: {
            targetDistance: 12000999,
            fuelBurnRate: 20,
            thrustFuel: 1000,
            activeGravityForce: 9.8,
            maneuveringDelay: 2
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
  });
});
