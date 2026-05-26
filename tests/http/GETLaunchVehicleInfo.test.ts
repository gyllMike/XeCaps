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

describe('GET LVInfo', () => {
  let sessionId: string;
  let lvId: number;
  beforeEach(() => {
    // clear
    // adminAuthRegister
    // adminLVCreate
    requestClear();
    const user = requestAdminAuthRegister(
      sampleUser1.email,
      sampleUser1.password,
      sampleUser1.nameFirst,
      sampleUser1.nameLast
    );
    sessionId = user.body.controlUserSessionId;
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
  });

  describe('Expected Error Tests', () => {
    test('Valid ControlUserSessionId', () => {
      const res = adminLaunchVehicleInfoRequest('DJDJDKFF', lvId);
      expect(res.statusCode).toBe(401);
    });
    test('Valid launchVehicleId', () => {
      const res = adminLaunchVehicleInfoRequest(sessionId, 999);
      expect(res.statusCode).toBe(400);
    });
  });
});
