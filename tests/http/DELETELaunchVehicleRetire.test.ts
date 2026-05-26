import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  requestAdminAstronautAssign,
  requestAstronautCreate,
  adminLaunchStateUpdateRequest,
  launchVehicleRetireRequest,
  adminLaunchVehicleInfoRequest,
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
  test('Retire success test', () => {
    adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
    const res = launchVehicleRetireRequest(sessionId, lvId);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });
  test('Retire success test', () => {
    adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
    const res = launchVehicleRetireRequest(sessionId, lvId);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    const info = adminLaunchVehicleInfoRequest(sessionId, lvId);
    expect(info.statusCode).toBe(200);
    const resParse = JSON.parse(info.body.toString());
    expect(resParse.retired).toBe(true);
  });
  test('launch vehicle still active test', () => {
    const res = launchVehicleRetireRequest(sessionId, lvId);
    expect(res.statusCode).toBe(400);
  });
  test('bad session Id test', () => {
    const res = launchVehicleRetireRequest('sessionId', lvId);
    expect(res.statusCode).toBe(401);
  });
  test('bad luanch vechile Id test', () => {
    const res = launchVehicleRetireRequest(sessionId, 999);
    expect(res.statusCode).toBe(400);
  });
});
