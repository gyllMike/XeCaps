import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  adminLaunchStateUpdateRequest,
  requestPayloadDeployedList,
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

describe('GET /v1/admin/payload/deployedList', () => {
  let sessionId: string;
  let missionId: number;
  let lvId: number;
  let launchId: number;
  let astronautId: number;

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
    const astro = requestAstronautCreate(
      sessionId,
      sampleAstronaut1.nameFirst,
      sampleAstronaut1.nameLast,
      sampleAstronaut1.rank,
      sampleAstronaut1.age,
      sampleAstronaut1.weight,
      sampleAstronaut1.height
    );
    astronautId = astro.body.astronautId;
    requestAdminAstronautAssign(sessionId, astronautId, missionId);
    const lres = adminLaunchCreateRequest(sessionId, missionId, {
      launchVehicleId: lvId,
      payload: sampleLaunch1.payload,
      launchParameters: sampleLaunch1.launchParameters,
    });
    launchId = JSON.parse(lres.body.toString()).launchId;
    requestlaunchAllocate(sessionId, missionId, launchId, astronautId);
  });

  describe('Error Tests', () => {
    test('401 controlUserSessionId is invalid', () => {
      const res = requestPayloadDeployedList('invalid-session-id');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
    });

    test('401 controlUserSessionId empty', () => {
      const res = requestPayloadDeployedList('');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Success Tests', () => {
    test('200 Correct return for no deployed payloads', () => {
      const res = requestPayloadDeployedList(sessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        deployedPayloads: [],
      });
    });

    test('200 Correct return for one deployed payload', () => {
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'FIRE_THRUSTERS');
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'DEPLOY_PAYLOAD');
      // Let's gooooo

      const res = requestPayloadDeployedList(sessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body.deployedPayloads).toHaveLength(1);
      expect(res.body).toStrictEqual({
        deployedPayloads: [
          {
            payloadId: expect.any(Number),
            description: sampleLaunch1.payload.description,
            weight: sampleLaunch1.payload.weight,
            speed: expect.any(Number),
            timeOfDeployment: expect.any(Number),
            relativePosition: {
              orbitDistance: expect.any(Number),
              angleOfDeviation: expect.any(Number),
            },
          },
        ],
      });
    });

    test('200 Non-deployed launches not list payloads', () => {
      const lvres2 = adminLaunchVehicleCreateRequest(
        sessionId,
        'Other LV',
        'desc',
        500,
        1000,
        4000,
        1000000,
        10
      );
      const lvId2 = JSON.parse(lvres2.body.toString()).launchVehicleId;
      adminLaunchCreateRequest(sessionId, missionId, {
        launchVehicleId: lvId2,
        payload: { description: 'Satelite 93', weight: 150 },
        launchParameters: sampleLaunch1.launchParameters,
      });
      // However i ve never reach there
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'LIFTOFF');
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'SKIP_WAITING');
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'FIRE_THRUSTERS');
      adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'DEPLOY_PAYLOAD');

      const res = requestPayloadDeployedList(sessionId);
      expect(res.statusCode).toBe(200);

      // We should only get the first payload
      expect(res.body.deployedPayloads).toHaveLength(1);
      expect(res.body.deployedPayloads[0].description).toBe(sampleLaunch1.payload.description);
    });
  });
});
