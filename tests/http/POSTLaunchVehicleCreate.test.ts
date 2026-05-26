import {
  requestClear,
  adminLaunchVehicleInfoRequest,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleLaunchVehicle1
} from './sampleTestData';

describe('POST LVCreate', () => {
  let sessionId: string;
  beforeEach(() => {
    // clear
    // adminAuthRegister
    requestClear();
    const user = requestAdminAuthRegister(
      sampleUser1.email,
      sampleUser1.password,
      sampleUser1.nameFirst,
      sampleUser1.nameLast
    );
    sessionId = user.body.controlUserSessionId;
  });

  describe('Success Tests', () => {
    test('Correct output', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(200);
    });
    // use adminLaunchVehicleCreate

    test('Correct datastore update', () => {
      const lres = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(lres.statusCode).toBe(200);
      const lvId = JSON.parse(lres.body.toString()).launchVehicleId;
      const res = adminLaunchVehicleInfoRequest(sessionId, lvId);
      expect(res.statusCode).toBe(200);
      const resParse = JSON.parse(res.body.toString());
      expect(resParse.name).toBe(sampleLaunchVehicle1.name);
      expect(resParse.maxCrewWeight).toBe(sampleLaunchVehicle1.maxCrewWeight);
      expect(resParse.maxPayloadWeight).toBe(sampleLaunchVehicle1.maxPayloadWeight);
      expect(resParse.startingManeuveringFuel).toBe(sampleLaunchVehicle1.maneuveringFuel);
      expect(resParse.launchVehicleWeight).toBe(sampleLaunchVehicle1.launchVehicleWeight);
      expect(resParse.thrustCapacity).toBe(sampleLaunchVehicle1.thrustCapacity);
    });
    // use adminLaunchVehicleCreate and adminLaunchVehicleInfo
  });

  describe('Expected Error Tests', () => {
    test('Valid ControlUserSessionId', () => {
      const res = adminLaunchVehicleCreateRequest(
        'DJDJDKFF',
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(401);
    });
    test('Valid name content test', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        'Ericcc@@',
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Valid name length test', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        'E',
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Valid description content test', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        'GOGOGO&',
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Valid description length test', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        'E'.repeat(51),
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Crew weight boundary tests', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        99,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Payload weight boundary tests', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        1001,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('launch vehicle weight boundary tests', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        999,
        sampleLaunchVehicle1.thrustCapacity,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Thrust capacity boundary tests', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        50000,
        sampleLaunchVehicle1.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
    });
    test('Maneuvering fuel boundary tests', () => {
      const res = adminLaunchVehicleCreateRequest(
        sessionId,
        sampleLaunchVehicle1.name,
        sampleLaunchVehicle1.description,
        sampleLaunchVehicle1.maxCrewWeight,
        sampleLaunchVehicle1.maxPayloadWeight,
        sampleLaunchVehicle1.launchVehicleWeight,
        sampleLaunchVehicle1.thrustCapacity,
        101
      );
      expect(res.statusCode).toBe(400);
    });
  });
});
