import { requestClear, requestAdminLaunchVechileList, requestAdminAuthRegister, adminLaunchVehicleCreateRequest, requestadminMissionCreate, adminLaunchCreateRequest, requestAdminAstronautAssign, requestAstronautCreate, requestlaunchAllocate } from "../../src/requestHelpers";
import { sampleMission1, sampleUser1, sampleLaunchVehicle1, sampleLaunchVehicle2, sampleLaunch1, sampleAstronaut1 } from './sampleTestData';

beforeEach(() => {
  requestClear();
});

describe('launchVehicleList tests', () => {
  let sessionId: string;
  let launchVehicleId1: number;
  beforeEach(() => {
    const user = requestAdminAuthRegister(
      sampleUser1.email,
      sampleUser1.password,
      sampleUser1.nameFirst,
      sampleUser1.nameLast
    );
    sessionId = user.body.controlUserSessionId;
    const launchVehicleRes1 = adminLaunchVehicleCreateRequest(
      sessionId,
      sampleLaunchVehicle1.name,
      sampleLaunchVehicle1.description,
      sampleLaunchVehicle1.maxCrewWeight,
      sampleLaunchVehicle1.maxPayloadWeight,
      sampleLaunchVehicle1.launchVehicleWeight,
      sampleLaunchVehicle1.thrustCapacity,
      sampleLaunchVehicle1.maneuveringFuel
    );
    launchVehicleId1 = JSON.parse(launchVehicleRes1.body.toString()).launchVehicleId;
  });

  describe('error case', () => {
    test('error - controlUserSessionId is empty', () => {
      const result = requestAdminLaunchVechileList('');
      expect(result.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(result.statusCode).toBe(401);
    });

    test('error - controlUserSessionId is invalid', () => {
      const result = requestAdminLaunchVechileList(sessionId + 'abc');
      expect(result.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(result.statusCode).toBe(401);
    });
  });

  describe('success case', () => {
    test('success - has correct return type', () => {
      const result = requestAdminLaunchVechileList(sessionId);
      expect(result.body).toStrictEqual({
        launchVehicles: [
          {
            launchVehicleId: expect.any(Number),
            name: expect.any(String),
            assigned: expect.any(Boolean)
          }
        ]
      });
      expect(result.statusCode).toBe(200);
    });

    test('success - correctly list one launchVehicle', () => {
      const result = requestAdminLaunchVechileList(sessionId);
      expect(result.body).toStrictEqual({
        launchVehicles: [
          {
            launchVehicleId: launchVehicleId1,
            name: sampleLaunchVehicle1.name,
            assigned: false
          }
        ]
      });
      expect(result.statusCode).toBe(200);
    });

    test('success - correctly list multiple launchVehicles', () => {
      const launchVehicleRes2 = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle2.name,
        sampleLaunchVehicle2.description,
        sampleLaunchVehicle2.maxCrewWeight,
        sampleLaunchVehicle2.maxPayloadWeight,
        sampleLaunchVehicle2.launchVehicleWeight,
        sampleLaunchVehicle2.thrustCapacity,
        sampleLaunchVehicle2.maneuveringFuel
      );
      const launchVehicleId2 = JSON.parse(launchVehicleRes2.body.toString()).launchVehicleId;
      const listRes = requestAdminLaunchVechileList(sessionId);
      expect(listRes.statusCode).toBe(200);
      expect(listRes.body).toStrictEqual({
        launchVehicles: [
          {
            launchVehicleId: launchVehicleId1,
            name: sampleLaunchVehicle1.name,
            assigned: false
          },
          {
            launchVehicleId: launchVehicleId2,
            name: sampleLaunchVehicle2.name,
            assigned: false
          }
        ]
      });
    });

    test('success - correctly list one launchVehicle that are assigned', () => {
      const mission = requestadminMissionCreate(
        sessionId,
        sampleMission1.name,
        sampleMission1.description,
        sampleMission1.target
      );
      const missionId1 = mission.body.missionId;
      const launchCreateRes = adminLaunchCreateRequest(
        sessionId,
        missionId1,
        {
          launchVehicleId: launchVehicleId1,
          payload: sampleLaunch1.payload,
          launchParameters: sampleLaunch1.launchParameters
        }
      );
      const launchId1 = JSON.parse(launchCreateRes.body.toString()).launchId;
      // const astronaut = requestAstronautCreate(
      //   sessionId,
      //   sampleAstronaut1.nameFirst,
      //   sampleAstronaut1.nameLast,
      //   sampleAstronaut1.rank,
      //   sampleAstronaut1.age,
      //   sampleAstronaut1.weight,
      //   sampleAstronaut1.height
      // );
      // const astronautId1 = astronaut.body.astronautId;
      // requestAdminAstronautAssign(sessionId, astronautId1, missionId1);
      // requestlaunchAllocate(sessionId, missionId1, launchId1, astronautId1);
      const result = requestAdminLaunchVechileList(sessionId);
      expect(result.body).toStrictEqual({
        launchVehicles: [
          {
            launchVehicleId: launchVehicleId1,
            name: sampleLaunchVehicle1.name,
            assigned: true
          }
        ]
      });
      expect(result.statusCode).toBe(200);
    });
  });
});