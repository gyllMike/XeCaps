import { requestAdminAuthRegister, requestadminMissionCreate, adminLaunchVehicleCreateRequest, requestAstronautCreate, requestAdminAstronautAssign, adminLaunchCreateRequest, requestlaunchAllocate, requestLaunchDeallocate, adminLaunchInfoRequest, adminLaunchStateUpdateRequest, requestClear } from '../../src/requestHelpers';
import { sampleUser1, sampleMission1, sampleLaunchVehicle1, sampleAstronaut1, sampleLaunch1 } from './sampleTestData';
import { missionLaunchAction } from '../../src/dataStore';

describe('launchAstronautDeallocate test', () => {
  let sessionId1: string;
  let missionId1: number;
  let launchId1: number;
  let astronautId1: number;
  let launchVehicleId1: number;
  beforeEach(() => {
    requestClear();
    // create a user
    const registerRes = requestAdminAuthRegister(
      sampleUser1.email,
      sampleUser1.password,
      sampleUser1.nameFirst,
      sampleUser1.nameLast
    );
    sessionId1 = registerRes.body.controlUserSessionId;

    // create a mission
    const missionRes = requestadminMissionCreate(
      sessionId1,
      sampleMission1.name,
      sampleMission1.description,
      sampleMission1.target
    );
    missionId1 = missionRes.body.missionId;

    // create a launch vehicle
    const launchVehicleRes = adminLaunchVehicleCreateRequest(
      sessionId1,
      sampleLaunchVehicle1.name,
      sampleLaunchVehicle1.description,
      sampleLaunchVehicle1.maxCrewWeight,
      sampleLaunchVehicle1.maxPayloadWeight,
      sampleLaunchVehicle1.launchVehicleWeight,
      sampleLaunchVehicle1.thrustCapacity,
      sampleLaunchVehicle1.maneuveringFuel
    );
    launchVehicleId1 = JSON.parse(launchVehicleRes.body.toString()).launchVehicleId;

    // create an astronaut
    const astronautRes = requestAstronautCreate(
      sessionId1,
      sampleAstronaut1.nameFirst,
      sampleAstronaut1.nameLast,
      sampleAstronaut1.rank,
      sampleAstronaut1.age,
      sampleAstronaut1.weight,
      sampleAstronaut1.height
    );
    astronautId1 = astronautRes.body.astronautId;

    // assign astronaut
    requestAdminAstronautAssign(sessionId1, astronautId1, missionId1);

    // create a launch
    const launchRes = adminLaunchCreateRequest(
      sessionId1,
      missionId1,
      {
        launchVehicleId: launchVehicleId1,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters
      }
    );
    launchId1 = JSON.parse(launchRes.body.toString()).launchId;
  });

  describe('error case', () => {
    describe('error - HTTP statusCode 400', () => {
      test('error - astronautId is invalid', () => {
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const res = requestLaunchDeallocate(sessionId1, astronautId1 + 1, missionId1, launchId1);
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });

      test('error - launchId is invalid', () => {
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const res = requestLaunchDeallocate(sessionId1, astronautId1, missionId1, launchId1 + 1);
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });

      test('error - astronaut not allocated to this launch', () => {
        const res = requestLaunchDeallocate(sessionId1, astronautId1, missionId1, launchId1);
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });

      test('error - launch has started and still in progress', () => {
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        adminLaunchStateUpdateRequest(sessionId1, missionId1, launchId1, missionLaunchAction.LIFTOFF);
        const res = requestLaunchDeallocate(sessionId1, astronautId1, missionId1, launchId1);
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });
    });

    describe('error - HTTP statusCode 401', () => {
      test('error - controlUserSessionId is empty', () => {
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const res = requestLaunchDeallocate('', astronautId1, missionId1, launchId1);
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });

      test('error - controlUserSessionId is invalid', () => {
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const res = requestLaunchDeallocate(sessionId1 + 'abc', astronautId1, missionId1, launchId1);
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });
    });

    describe('error - HTTP statusCode 403', () => {
      test('error - controlUser is not an owner of the mission', () => {
        const session2 = requestAdminAuthRegister('email2@gmail.com', 'Password2!@#', 'Zhen', 'CAO');
        // const session2 = requestadminAuthLogin('email2@gmail.com', 'Password2!@#');
        const sessionId2 = session2.body.controlUserSessionId;
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const res = requestLaunchDeallocate(sessionId2, astronautId1, missionId1, launchId1);
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });

      test('error - missionId does not exist', () => {
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const res = requestLaunchDeallocate(sessionId1, astronautId1, missionId1 + 1, launchId1);
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });
    });
  });

  describe('success case', () => {
    test('success - has correct return type', () => {
      requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
      const res = requestLaunchDeallocate(sessionId1, astronautId1, missionId1, launchId1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });

    test('success - correctly unallocate an astronaut from a launch', () => {
      requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
      const launchInfoRes1 = adminLaunchInfoRequest(sessionId1, missionId1, launchId1);
      expect(JSON.parse(launchInfoRes1.body.toString()).allocatedAstronauts).toStrictEqual([
        {
          astronautId: astronautId1,
          designation: `${sampleAstronaut1.rank} ${sampleAstronaut1.nameFirst} ${sampleAstronaut1.nameLast}`
        }
      ]);
      requestLaunchDeallocate(sessionId1, astronautId1, missionId1, launchId1);
      const launchInfoRes2 = adminLaunchInfoRequest(sessionId1, missionId1, launchId1);
      expect(JSON.parse(launchInfoRes2.body.toString()).allocatedAstronauts).toStrictEqual([]);
    });
  });
});
