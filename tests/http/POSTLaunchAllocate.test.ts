import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  adminLaunchInfoRequest,
  requestAstronautCreate,
  requestAdminAstronautAssign,
  requestlaunchAllocate,
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleMission1,
  sampleLaunchVehicle1,
  sampleLaunch1,
  sampleAstronaut1
} from './sampleTestData';

describe('POST /v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid', () => {
  let sessionId: string;
  let missionId: number;
  let launchId: number;
  let astronautId: number;
  let lvId: number;

  beforeEach(() => {
    requestClear();

    // register session
    const user = requestAdminAuthRegister(
      sampleUser1.email,
      sampleUser1.password,
      sampleUser1.nameFirst,
      sampleUser1.nameLast
    );
    sessionId = user.body.controlUserSessionId;

    // create mission
    const mission = requestadminMissionCreate(
      sessionId,
      sampleMission1.name,
      sampleMission1.description,
      sampleMission1.target
    );
    missionId = mission.body.missionId;

    // create vehicle
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

    // create astronaut
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

    // assign astronaut
    requestAdminAstronautAssign(sessionId, astronautId, missionId);

    // create launch
    const launch = adminLaunchCreateRequest(
      sessionId,
      missionId,
      {
        launchVehicleId: lvId,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters
      }
    );
    launchId = JSON.parse(launch.body.toString()).launchId;
  });

  describe('Success Tests', () => {
    test('Correct output on valid allocation', () => {
      const res = requestlaunchAllocate(sessionId, missionId, launchId, astronautId);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({});
    });

    test('Correct datastore update after allocation', () => {
      requestlaunchAllocate(sessionId, missionId, launchId, astronautId);

      const res = adminLaunchInfoRequest(sessionId, missionId, launchId);

      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body.toString());

      expect(body.allocatedAstronauts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            astronautId: astronautId,
            designation: `${sampleAstronaut1.rank} ${sampleAstronaut1.nameFirst} ${sampleAstronaut1.nameLast}`
          })
        ])
      );
      expect(body.allocatedAstronauts.length).toBe(1);
    });
  });

  describe('Expected Error Tests', () => {
    test('401: Invalid controlUserSessionId', () => {
      const res = requestlaunchAllocate('', missionId, launchId, astronautId);
      expect(res.statusCode).toBe(401);
    });

    test('403: Session user does not own mission', () => {
      // register user2
      const user2 = requestAdminAuthRegister('user2@email.com', 'password123', 'User', 'Two');
      const sessionId2 = user2.body.controlUserSessionId;

      const res = requestlaunchAllocate(sessionId2, missionId, launchId, astronautId);
      expect(res.statusCode).toBe(403);
    });

    test('400: astronautid is invalid', () => {
      const invalidAstroId = astronautId + 999;
      const res = requestlaunchAllocate(sessionId, missionId, launchId, invalidAstroId);
      expect(res.statusCode).toBe(400);
    });

    test('400: launchid is invalid', () => {
      const invalidLaunchId = launchId + 999;
      const res = requestlaunchAllocate(sessionId, missionId, invalidLaunchId, astronautId);
      expect(res.statusCode).toBe(400);
    });

    test('400: Astronaut is not assigned to the mission', () => {
      const astro2 = requestAstronautCreate(sessionId, 'Buzz', 'Aldrin', 'Colonel', 35, 75, 178);
      const astronautId2 = astro2.body.astronautId;

      const res = requestlaunchAllocate(sessionId, missionId, launchId, astronautId2);
      expect(res.statusCode).toBe(400);
    });

    test('400: Astronaut is already allocated to another active launch', () => {
      // assign astroaut1
      requestlaunchAllocate(sessionId, missionId, launchId, astronautId);

      const lvres2 = adminLaunchVehicleCreateRequest(
        sessionId,
        'Lvres Two',
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      const lvId2 = JSON.parse(lvres2.body.toString()).launchVehicleId;

      const launch2 = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId2,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      const launchId2 = JSON.parse(launch2.body.toString()).launchId;

      const res = requestlaunchAllocate(sessionId, missionId, launchId2, astronautId);
      expect(res.statusCode).toBe(400);
    });

    test('400: Total astronaut weight exceeds maxCrewWeight', () => {
      const astroIds: number[] = [];

      // 70 for each
      for (let i = 0; i < 8; i++) {
        const letter = String.fromCharCode(65 + i);
        const astro = requestAstronautCreate(sessionId, `Astro ${letter}`, 'Test', 'Crewman', 30, 70, 170);
        const newAstroId = astro.body.astronautId;
        astroIds.push(newAstroId);
        requestAdminAstronautAssign(sessionId, newAstroId, missionId);
      }

      const lvres3 = adminLaunchVehicleCreateRequest(
        sessionId,
        'Lvres Three',
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      const lvId3 = JSON.parse(lvres3.body.toString()).launchVehicleId;

      const launch3 = adminLaunchCreateRequest(
        sessionId,
        missionId,
        {
          launchVehicleId: lvId3,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      const launchId3 = JSON.parse(launch3.body.toString()).launchId;

      for (let i = 0; i < 7; i++) {
        const res = requestlaunchAllocate(sessionId, missionId, launchId3, astroIds[i]);
        expect(res.statusCode).toBe(200);
      }
      const res = requestlaunchAllocate(sessionId, missionId, launchId3, astroIds[7]);

      expect(res.statusCode).toBe(400);
    });
  });
});
