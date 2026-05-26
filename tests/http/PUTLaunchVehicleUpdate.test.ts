import { requestlaunchVehicleUpdate, adminLaunchVehicleCreateRequest, adminLaunchVehicleInfoRequest, requestClear, requestAdminAuthRegister, adminLaunchStateUpdateRequest, adminLaunchCreateRequest, requestadminMissionCreate } from '../../src/requestHelpers';
import { sampleUser1, sampleLaunchVehicle1, sampleLaunchVehicle2, sampleLaunchVehicle3, sampleLaunchVehicle4, sampleMission1, sampleLaunch1 } from './sampleTestData';

describe('/v1/admin/launchvehicle/:launchvehicleid - HTTP layer via requestHelper', () => {
  let sessionId: string;
  let launchVehicleId1: number;
  let missionId: number;

  beforeEach(() => {
    requestClear();
    const user = requestAdminAuthRegister(sampleUser1.email, sampleUser1.password, sampleUser1.nameFirst, sampleUser1.nameLast);
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

  test('update launchVehicle information succsessfully', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(200);
    expect(UpdateRes.body).toStrictEqual({});

    const getLaunchVehicleInfo = adminLaunchVehicleInfoRequest(sessionId, launchVehicleId1);
    expect(JSON.parse(getLaunchVehicleInfo.body.toString()).name).toBe(sampleLaunchVehicle2.name);
    expect(JSON.parse(getLaunchVehicleInfo.body.toString()).maxCrewWeight).toBe(sampleLaunchVehicle2.maxCrewWeight);
    expect(JSON.parse(getLaunchVehicleInfo.body.toString()).maxPayloadWeight).toBe(sampleLaunchVehicle2.maxPayloadWeight);
    expect(JSON.parse(getLaunchVehicleInfo.body.toString()).launchVehicleWeight).toBe(sampleLaunchVehicle2.launchVehicleWeight);
    expect(JSON.parse(getLaunchVehicleInfo.body.toString()).thrustCapacity).toBe(sampleLaunchVehicle2.thrustCapacity);
    expect(JSON.parse(getLaunchVehicleInfo.body.toString()).startingManeuveringFuel).toBe(sampleLaunchVehicle2.maneuveringFuel);
  });

  test('LaunchVehicleId is already active', () => {
    const missionRes = requestadminMissionCreate(sessionId, sampleMission1.name, sampleMission1.description, sampleMission1.target);
    missionId = missionRes.body.missionId;

    const launchRes = adminLaunchCreateRequest(sessionId, missionId,
      {
        launchVehicleId: launchVehicleId1,
        payload: sampleLaunch1.payload,
        launchParameters: sampleLaunch1.launchParameters
      }
    );
    expect(launchRes.statusCode).toBe(200);
    const launchId = (JSON.parse(launchRes.body.toString()).launchId);

    const updateLaunchStateRes = adminLaunchStateUpdateRequest(sessionId, missionId, launchId, 'LIFTOFF');
    expect(updateLaunchStateRes.statusCode).toBe(200);

    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('SessionId Invalidity', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name.repeat(520),
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('vehicleId Invalidity', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1 + 1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('name Invalidity - name too long', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name.repeat(520),
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('name Invalidity - name contains invalid character', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle4.name,
      sampleLaunchVehicle4.description,
      sampleLaunchVehicle4.maxCrewWeight,
      sampleLaunchVehicle4.maxPayloadWeight,
      sampleLaunchVehicle4.launchVehicleWeight,
      sampleLaunchVehicle4.thrustCapacity,
      sampleLaunchVehicle4.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('description Invalidity - description too long', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description.repeat(520),
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('description Invalidity - description contains invalid character', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle3.name,
      sampleLaunchVehicle3.description,
      sampleLaunchVehicle3.maxCrewWeight,
      sampleLaunchVehicle3.maxPayloadWeight,
      sampleLaunchVehicle3.launchVehicleWeight,
      sampleLaunchVehicle3.thrustCapacity,
      sampleLaunchVehicle3.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('MaxCreWeight Invalidiy', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      10000000,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('MaxPayloadWeight Invalidity', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      1000000,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('LaunchVehicleWeight Invalidity', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      10,
      sampleLaunchVehicle2.thrustCapacity,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('Thrust Cpacity Invalidity', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      10,
      sampleLaunchVehicle2.maneuveringFuel
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });

  test('ManeveringFuel Invalidity', () => {
    const UpdateRes = requestlaunchVehicleUpdate(
      sessionId,
      launchVehicleId1,
      sampleLaunchVehicle2.name,
      sampleLaunchVehicle2.description,
      sampleLaunchVehicle2.maxCrewWeight,
      sampleLaunchVehicle2.maxPayloadWeight,
      sampleLaunchVehicle2.launchVehicleWeight,
      sampleLaunchVehicle2.thrustCapacity,
      2
    );

    expect(UpdateRes.stausCode).toBe(400);
    expect(UpdateRes.body).toHaveProperty('error');
  });
});
