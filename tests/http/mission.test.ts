import {
  requestClear, requestAdminAuthRegister, requestadminMissionCreate, requestadminAuthLogin, requestadminMissionList, requestadminMissionRemove, requestadminMissionNameUpdate, requestadminMissionDescriptionUpdate,
  requestAdminMissionInfo, requestadminMissionTargetUpdate,
  requestAstronautCreate,
  requestAdminAstronautAssign, requestAdminAstronautUnassign,
  adminLaunchVehicleCreateRequest,
  adminLaunchCreateRequest,
  requestlaunchAllocate, requestAdminAstronautUnassignOld
} from '../../src/requestHelpers';
import {
  sampleLaunchVehicle1,
  sampleLaunch1,
} from './sampleTestData';

describe('requestadminMissionCreate tests', () => {
  let user1SessionId: string; // To store the first registered user's ID
  beforeEach(() => {
    requestClear();
    const user1Auth = requestAdminAuthRegister('zhen@gmail.com', 'supersafepass123', 'Zhen', 'Cao');
    user1SessionId = user1Auth.body.controlUserSessionId;
  });

  test('should create a mission successfully with valid inputs', () => {
    const result = requestadminMissionCreate(user1SessionId, 'Aname', 'Description', 'Target');
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({
      missionId: expect.any(Number)
    });
  });

  test('should allow empty strings for description and target', () => {
    const result = requestadminMissionCreate(user1SessionId, 'A Simple Mission', '', '');
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({
      missionId: expect.any(Number)
    });
  });

  test('should return 401 error for a invalid sessionid', () => {
    const nonExistentSessionId = '999session';
    const result = requestadminMissionCreate(nonExistentSessionId, 'Iwillfail', 'This should fail', '');
    expect(result.statusCode).toBe(401);
    expect(result.body).toStrictEqual({
      error: expect.any(String),
    });
  });

  describe('BAD_INPUT 400 error tests', () => {
    test('should return an error for a mission name that is too short or too long', () => {
      // Too short
      const res1 = requestadminMissionCreate(user1SessionId, 'Go', '', '');
      expect(res1.statusCode).toBe(400);
      expect(res1.body).toMatchObject({ error: expect.any(String) });

      // Too long
      const longName = 'This Mission Name Is Definitely Way Toooooooooooooooo Long To Be Valid';
      const res2 = requestadminMissionCreate(user1SessionId, longName, '', '');
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for a duplicate mission name for the same user', () => {
      requestadminMissionCreate(user1SessionId, 'Duplicate Test Mission', '', '');
      const res3 = requestadminMissionCreate(user1SessionId, 'Duplicate Test Mission', '', '');
      expect(res3.statusCode).toBe(400);
      expect(res3.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for an invalid mission name', () => {
      const res3 = requestadminMissionCreate(user1SessionId, 'Mission!@#', '', '');
      expect(res3.statusCode).toBe(400);
      expect(res3.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for a description longer than 400 characters', () => {
      const longDescription = 'a'.repeat(401);
      const res4 = requestadminMissionCreate(user1SessionId, 'Long Description Test', longDescription, '');
      expect(res4.statusCode).toBe(400);
      expect(res4.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for a target longer than 100 characters', () => {
      const longTarget = 'a'.repeat(101);
      const res5 = requestadminMissionCreate(user1SessionId, 'Long Target Test', '', longTarget);
      expect(res5.statusCode).toBe(400);
      expect(res5.body).toMatchObject({ error: expect.any(String) });
    });
  });
});

/* adminMissionList tests
 * return an empty array when the user has no missions
 * return error when userid is invalid
 */
describe('adminMissionList tests', () => {
  let session1: string;
  let session2: string;
  beforeEach(() => {
    requestClear();
    requestAdminAuthRegister('eric@gmail.com', 'Ericccc123', 'Eric', 'Wang');
    requestAdminAuthRegister('alan@gmail.com', 'alannnn456', 'Alan', 'Guo');

    const login1 = requestadminAuthLogin('eric@gmail.com', 'Ericccc123');
    const login2 = requestadminAuthLogin('alan@gmail.com', 'alannnn456');

    session1 = login1.body.controlUserSessionId;
    session2 = login2.body.controlUserSessionId;
  });
  test('no missions test', () => {
    const result = requestadminMissionList(session1);
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({ missions: [] });
  });
  test('error test', () => {
    const result = requestadminMissionList('invalidSessionId');
    expect(result.statusCode).toBe(401);
  });
  test('return missions test1', () => {
    const mission1 = requestadminMissionCreate(session1, 'Mission111', 'fly', '111');
    const mission2 = requestadminMissionCreate(session1, 'Mission222', 'run', '222');
    const result = requestadminMissionList(session1);
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({
      missions: [
        { missionId: mission1.body.missionId, name: 'Mission111' },
        { missionId: mission2.body.missionId, name: 'Mission222' }
      ]
    });
  });
  test('return missions test2', () => {
    const mission1 = requestadminMissionCreate(session1, 'Mission111', 'fly', '111');
    const mission2 = requestadminMissionCreate(session2, 'Mission222', 'run', '222');
    const result1 = requestadminMissionList(session1);
    const result2 = requestadminMissionList(session2);
    expect(result1.body).toStrictEqual({
      missions: [
        { missionId: mission1.body.missionId, name: 'Mission111' },
      ]
    });
    expect(result2.body).toStrictEqual({
      missions: [
        { missionId: mission2.body.missionId, name: 'Mission222' },
      ]
    });
  });
});

// HTTP adminMissionNameUpdate
/*
  Set the sessionuser_id and mission_id
  401 - invalid sessionid
  403 - invalid missionid
  404 - invalid missionname
*/
describe('PUT /v1/admin/mission/:missionid/name - HTTP layer via requestHelper', () => {
  let SessionId: string;

  beforeEach(() => {
    requestClear();

    const register = requestAdminAuthRegister('alan@gmail.com', 'LOVECHRIS520', 'Alan', 'Guo');
    SessionId = register.body.controlUserSessionId;
  });

  test('update new mission name sunccessfully', () => {
    const missionRes = requestadminMissionCreate(SessionId, 'mission1', 'MissionChris520', 'kissChris');
    const missionId = missionRes.body.missionId;

    const newName = 'mission2';
    const updateRes = requestadminMissionNameUpdate(SessionId, missionId, newName);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toStrictEqual({});

    const MissionResponse = requestAdminMissionInfo(SessionId, missionId);
    const checkName = MissionResponse.body.name;
    expect(checkName).toBe(newName);
  });

  test('Invalid controlUserSessionId should return 401', () => {
    const missionRes = requestadminMissionCreate(SessionId, 'mission1', 'MissionChris520', 'kissChris');
    const missionId = missionRes.body.missionId;
    const newName = 'mission2';

    const res = requestadminMissionNameUpdate('', missionId, newName);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Invalid missionId should return 403', () => {
    const newName = 'mission2';
    const res = requestadminMissionNameUpdate(SessionId, 5.201314, newName);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('Invalid missionname should return 400', () => {
    const missionRes = requestadminMissionCreate(SessionId, 'mission1', 'MissionChris520', 'kissChris');
    const missionId = missionRes.body.missionId;
    const newName = '';

    const res = requestadminMissionNameUpdate(SessionId, missionId, newName);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// HTTP adminMissionDescriptionUpdate
/*
  Set the sessionuser_id and mission_id
  401 - invalid sessionid
  403 - invalid missionid
  404 - invalid missionname
*/
describe('PUT /v1/admin/mission/:missionid/description - HTTP layer via requestHelper', () => {
  let SessionId: string;

  beforeEach(() => {
    requestClear();

    const register = requestAdminAuthRegister('alan@gmail.com', 'LOVECHRIS520', 'Alan', 'Guo');
    SessionId = register.body.controlUserSessionId;
  });

  test('update new mission description successfully', () => {
    const missionRes = requestadminMissionCreate(SessionId, 'mission1', 'MissionChris520', 'kissChris');
    const missionId = missionRes.body.missionId;
    const newDescription = 'HUGCHRIS';

    const updateRes = requestadminMissionDescriptionUpdate(SessionId, missionId, newDescription);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toStrictEqual({});

    const MissionResponse = requestAdminMissionInfo(SessionId, missionId);
    const checkDescription = MissionResponse.body.description;
    expect(checkDescription).toBe(newDescription);
  });

  test('Invalid controlUserSessionId should return 401', () => {
    const missionRes = requestadminMissionCreate(SessionId, 'mission1', 'MissionChris520', 'kissChris');
    const missionId = missionRes.body.missionId;
    const newDescription = 'HUGCHRIS';

    const res = requestadminMissionDescriptionUpdate('', missionId, newDescription);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Invalid missionId should return 403', () => {
    const newDescription = 'HUGCHRIS';
    const res = requestadminMissionDescriptionUpdate(SessionId, 5.201314, newDescription);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('Invalid missiondescription should return 400', () => {
    const missionRes = requestadminMissionCreate(SessionId, 'mission1', 'MissionChris520', 'kissChris');
    const missionId = missionRes.body.missionId;
    const newDescription = 'a'.repeat(1000);

    const res = requestadminMissionDescriptionUpdate(SessionId, missionId, newDescription);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('adminMissionInfo tests', () => {
  let user1: ReturnType<typeof requestAdminAuthRegister>;
  let user2: ReturnType<typeof requestAdminAuthRegister>;
  let user3: ReturnType<typeof requestAdminAuthRegister>;
  let sessionId1: string, sessionId2: string, sessionId3: string;
  let mission1: ReturnType<typeof requestadminMissionCreate>;
  let mission2: ReturnType<typeof requestadminMissionCreate>;
  let mission3: ReturnType<typeof requestadminMissionCreate>;
  let missionId1: number, missionId2: number, missionId3: number;
  beforeEach(() => {
    requestClear();
    user1 = requestAdminAuthRegister('chrislee@gmail.com', 'abcd1234!@#', 'Chris', 'Li');
    user2 = requestAdminAuthRegister('alan@gmail.com', 'xyz123@@', 'Alan', 'Guo');
    user3 = requestAdminAuthRegister('harrypotter@gmail.com', 'qwert789~~', 'harry', 'potter');

    sessionId1 = user1.body.controlUserSessionId;
    sessionId2 = user2.body.controlUserSessionId;
    sessionId3 = user3.body.controlUserSessionId;

    mission1 = requestadminMissionCreate(sessionId1, 'abcdefg', 'This is a description message. hahahaha.', 'moon');
    mission2 = requestadminMissionCreate(sessionId2, 'xyzxyzxyz', 'asdfasdfasdfsadfasdf', 'oewufwoeufwoeuf');
    mission3 = requestadminMissionCreate(sessionId2, 'zxcvbnm', 'descriptiondescriptiondescription', 'earth');

    missionId1 = mission1.body.missionId;
    missionId2 = mission2.body.missionId;
    missionId3 = mission3.body.missionId;
  });

  describe('error cases', () => {
    test('empty controlUserSessionId', () => {
      expect(requestAdminMissionInfo('', missionId1).body).toStrictEqual({
        error: expect.any(String)
      });
      expect(requestAdminMissionInfo('', missionId1).statusCode).toBe(401);
    });

    test('invalid controlUserSessionId', () => {
      expect(requestAdminMissionInfo('a', missionId1).body).toStrictEqual({
        error: expect.any(String)
      });
      expect(requestAdminMissionInfo('a', missionId1).statusCode).toBe(401);
    });

    describe('invalid missionId', () => {
      test('missionId does not refer to a valid mission', () => {
        expect(requestAdminMissionInfo(sessionId1, 0).body).toStrictEqual({
          error: expect.any(String)
        });
        expect(requestAdminMissionInfo(sessionId1, 0).statusCode).toBe(403);
      });

      test('missionId does not refer to a mission that this controlUser owns', () => {
        expect(requestAdminMissionInfo(sessionId1, missionId2).body).toStrictEqual({
          error: expect.any(String)
        });
        expect(requestAdminMissionInfo(sessionId1, missionId2).statusCode).toBe(403);
        expect(requestAdminMissionInfo(sessionId3, missionId3).body).toStrictEqual({
          error: expect.any(String)
        });
        expect(requestAdminMissionInfo(sessionId3, missionId3).statusCode).toBe(403);
      });
    });
  });

  describe('success cases', () => {
    test('has correct return type', () => {
      expect(requestAdminMissionInfo(sessionId1, missionId1).body).toStrictEqual({
        missionId: expect.any(Number),
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        target: expect.any(String),
        assignedAstronauts: []
      });
      expect(requestAdminMissionInfo(sessionId1, missionId1).statusCode).toBe(200);
    });

    test('correctly get mission info', () => {
      expect(requestAdminMissionInfo(sessionId1, missionId1).body).toStrictEqual({
        missionId: missionId1,
        name: 'abcdefg',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is a description message. hahahaha.',
        target: 'moon',
        assignedAstronauts: []
      });
      expect(requestAdminMissionInfo(sessionId1, missionId1).statusCode).toBe(200);
    });
  });
});

describe('PUT /v1/admin/mission/:missionid/target', () => {
  let user1SessionId: string;
  let user2SessionId: string;
  let mission1: ReturnType<typeof requestadminMissionCreate>;
  beforeEach(() => {
    requestClear();
    const user1Auth = requestAdminAuthRegister('zhen@gmail.com', 'supersafepass123', 'Zhen', 'Cao');
    user1SessionId = user1Auth.body.controlUserSessionId;
    const user2Auth = requestAdminAuthRegister('chris@gmail.com', 'supersafepass123', 'Chris', 'LI');
    user2SessionId = user2Auth.body.controlUserSessionId;
    mission1 = requestadminMissionCreate(user1SessionId, 'Aname', 'Description', 'Target');
  });

  test('should update target successfully', () => {
    const newTarget = 'Updated Target';
    const { statusCode, body } = requestadminMissionTargetUpdate(user1SessionId, mission1.body.missionId, newTarget);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({});
    const info = requestAdminMissionInfo(user1SessionId, mission1.body.missionId);
    expect(info.body.target).toBe(newTarget);
    expect(info.body.timeLastEdited).toBeGreaterThanOrEqual(info.body.timeCreated);
  });

  test('should return 401 for invalid session', () => {
    const { statusCode } = requestadminMissionTargetUpdate('invalidid', mission1.body.missionId, 'New Target');
    expect(statusCode).toBe(401);
  });

  test('should return 403 if user does not own the mission', () => {
    const { statusCode } = requestadminMissionTargetUpdate(user2SessionId, mission1.body.missionId, 'New Target');
    expect(statusCode).toBe(403);
  });

  test('should return 400 for target too long', () => {
    const { statusCode } = requestadminMissionTargetUpdate(user1SessionId, mission1.body.missionId, 'a'.repeat(101));
    expect(statusCode).toBe(400);
  });
});
/*
 * adminMissionRemove test
 * successfully remove a mission once
 * return error if mission already being remove or id error
 */
describe(('adminMissionRemove test'), () => {
  let session1: string;
  let astronautId1: number;
  let missionId1: number;
  beforeEach(() => {
    requestClear();
    requestAdminAuthRegister('eric@gmail.com', 'Ericccc123', 'Eric', 'Wang');
    const login = requestadminAuthLogin('eric@gmail.com', 'Ericccc123');
    session1 = login.body.controlUserSessionId;
  });
  test('remove one test', () => {
    const mission = requestadminMissionCreate(session1, 'Mission111', 'fly', '111');
    const result = requestadminMissionRemove(session1, mission.body.missionId);
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({});
  });
  test('remove error test', () => {
    const mission = requestadminMissionCreate(session1, 'Mission111', 'fly', '111');
    const result1 = requestadminMissionRemove(session1, mission.body.missionId);
    expect(result1.statusCode).toBe(200);
    expect(result1.body).toStrictEqual({});
    const result2 = requestadminMissionRemove(session1, mission.body.missionId);
    expect(result2.statusCode).toBe(403);
    expect(result2.body).toHaveProperty('error');
  });
  test('control user id error test', () => {
    const mission = requestadminMissionCreate(session1, 'Mission111', 'fly', '111');
    const result = requestadminMissionRemove('114514', mission.body.missionId);
    expect(result.statusCode).toBe(401);
  });
  test('control mission id error test', () => {
    const result = requestadminMissionRemove(session1, 114514);
    expect(result.statusCode).toBe(403);
  });
  test('400 test', () => {
    const astronaut1 = requestAstronautCreate(session1, 'Yulin', 'Guo', 'rankrank', 25, 60, 183);
    astronautId1 = astronaut1.body.astronautId;
    const mission1 = requestadminMissionCreate(session1, 'name1', 'description1', 'target1');
    missionId1 = mission1.body.missionId;
    const assignresult = requestAdminAstronautAssign(session1, astronautId1, missionId1);
    expect(assignresult.statusCode).toBe(200);
    const result = requestadminMissionRemove(session1, missionId1);
    expect(result.statusCode).toBe(400);
    expect(result.body).toHaveProperty('error');
  });
});

describe('adminAstronautAssign test', () => {
  let sessionId1: string;
  let astronautId1: number;
  let missionId1: number;
  beforeEach(() => {
    requestClear();
    const session1 = requestAdminAuthRegister('email1@gmail.com', 'Password1!@#', 'Chris', 'LI');
    sessionId1 = session1.body.controlUserSessionId;
    const astronaut1 = requestAstronautCreate(sessionId1, 'Yulin', 'Guo', 'rankrank', 25, 60, 183);
    astronautId1 = astronaut1.body.astronautId;
    const mission1 = requestadminMissionCreate(sessionId1, 'name1', 'description1', 'target1');
    missionId1 = mission1.body.missionId;
  });

  describe('error case', () => {
    describe('error code 400', () => {
      test('astronautId is invalid', () => {
        const result = requestAdminAstronautAssign(sessionId1, astronautId1 + 1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(400);
      });

      test('astronaut already assigned to another mission', () => {
        const mission2 = requestadminMissionCreate(sessionId1, 'name2', 'description2', 'target2');
        const missionId2 = mission2.body.missionId;
        requestAdminAstronautAssign(sessionId1, astronautId1, missionId2);
        const result = requestAdminAstronautAssign(sessionId1, astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(400);
      });
    });

    describe('error code 401', () => {
      test('controlUserSessionId is empty', () => {
        const result = requestAdminAstronautAssign('', astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(401);
      });

      test('controlUserSessionId does not refer to a valid session', () => {
        const result = requestAdminAstronautAssign(sessionId1 + 'invalid', astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(401);
      });
    });

    describe('error code 403', () => {
      test('missionId does not exist', () => {
        const result = requestAdminAstronautAssign(sessionId1, astronautId1, missionId1 + 1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(403);
      });

      test('controlUser is not an owner of the mission', () => {
        // const session1 = requestAdminAuthRegister('email1@gmail.com', 'Password1!@#', 'Chris', 'LI');
        // sessionId1 = session1.body.controlUserSessionId;

        requestAdminAuthRegister('email2@gmail.com', 'Password2!@#', 'Zhen', 'CAO');
        const session3 = requestadminAuthLogin('email2@gmail.com', 'Password2!@#');
        const sessionId3 = session3.body.controlUserSessionId;

        const result = requestAdminAstronautAssign(sessionId3, astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(403);
      });
    });
  });

  describe('success case', () => {
    test('has correct return type', () => {
      const result = requestAdminAstronautAssign(sessionId1, astronautId1, missionId1);
      expect(result.body).toStrictEqual({});
      expect(result.statusCode).toBe(200);
    });

    test('correctly assign one astronaut', () => {
      requestAdminAstronautAssign(sessionId1, astronautId1, missionId1);
      expect(requestAdminMissionInfo(sessionId1, missionId1).body).toStrictEqual({
        missionId: missionId1,
        name: 'name1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description1',
        target: 'target1',
        assignedAstronauts: [
          {
            astronautId: astronautId1,
            designation: 'rankrank Yulin Guo'
          }
        ]
      });
    });
  });
});

describe('adminAstronautUnassign test', () => {
  let sessionId1: string;
  let missionId1: number;
  let astronautId1: number;
  beforeEach(() => {
    requestClear();
    const session1 = requestAdminAuthRegister('chrislee123@gmail.com', 'password123', 'Chris', 'Li');
    sessionId1 = session1.body.controlUserSessionId;
    const mission1 = requestadminMissionCreate(sessionId1, 'name', 'description', 'target');
    missionId1 = mission1.body.missionId;
    const astronaut1 = requestAstronautCreate(sessionId1, 'Alan', 'Guo', 'rankrank', 25, 65, 185);
    astronautId1 = astronaut1.body.astronautId;
    requestAdminAstronautAssign(sessionId1, astronautId1, missionId1);
  });

  describe('error case', () => {
    describe('error code 400', () => {
      test('astronautId is invalid', () => {
        const result = requestAdminAstronautUnassignOld(sessionId1, astronautId1 + 1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(400);
      });

      test('astronaut not assigned to the mission', () => {
        const astronaut2 = requestAstronautCreate(sessionId1, 'Eric', 'Wang', 'rankrankrank', 25, 65, 185);
        const astronautId2 = astronaut2.body.astronautId;
        const result = requestAdminAstronautUnassign(sessionId1, astronautId2, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(400);
      });

      test('astronaut already allocated to a launch', () => {
        const lvres = adminLaunchVehicleCreateRequest(
          sessionId1,
          sampleLaunchVehicle1.name,
          sampleLaunchVehicle1.description,
          sampleLaunchVehicle1.maxCrewWeight,
          sampleLaunchVehicle1.maxPayloadWeight,
          sampleLaunchVehicle1.launchVehicleWeight,
          sampleLaunchVehicle1.thrustCapacity,
          sampleLaunchVehicle1.maneuveringFuel
        );
        const launchVehicleId1 = JSON.parse(lvres.body.toString()).launchVehicleId;
        const launchCreateRes = adminLaunchCreateRequest(
          sessionId1,
          missionId1,
          {
            launchVehicleId: launchVehicleId1,
            payload: sampleLaunch1.payload,
            launchParameters: sampleLaunch1.launchParameters
          }
        );
        const launchId1 = JSON.parse(launchCreateRes.body.toString()).launchId;
        requestlaunchAllocate(sessionId1, missionId1, launchId1, astronautId1);
        const result = requestAdminAstronautUnassign(sessionId1, astronautId1, missionId1);
        expect(result.statusCode).toBe(400);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
      });
    });

    describe('error code 401', () => {
      test('controlUserSessionId is empty', () => {
        const result = requestAdminAstronautUnassign('', astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(401);
      });

      test('controlUserSessionId is invalid', () => {
        const result = requestAdminAstronautUnassign(sessionId1 + 'invalid', astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(401);
      });
    });

    describe('error code 403', () => {
      test('missionId does not exist', () => {
        const result = requestAdminAstronautUnassign(sessionId1, astronautId1, missionId1 + 1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(403);
      });

      test('controlUser is not an owner of the mission', () => {
        const session2 = requestAdminAuthRegister('emailemail@gmail.com', 'passpass1212', 'Zhen', 'Cao');
        const sessionId2 = session2.body.controlUserSessionId;
        const result = requestAdminAstronautUnassign(sessionId2, astronautId1, missionId1);
        expect(result.body).toStrictEqual({ error: expect.any(String) });
        expect(result.statusCode).toBe(403);
      });
    });
  });

  describe('success case', () => {
    test('has correct return type', () => {
      const result = requestAdminAstronautUnassign(sessionId1, astronautId1, missionId1);
      expect(result.body).toStrictEqual({});
      expect(result.statusCode).toBe(200);
    });

    test('correctly unassign one astronaut - 1 remove 1 remain 0', () => {
      requestAdminAstronautUnassignOld(sessionId1, astronautId1, missionId1);
      const result = requestAdminMissionInfo(sessionId1, missionId1);
      expect(result.body).toStrictEqual({
        missionId: missionId1,
        name: 'name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        target: 'target',
        assignedAstronauts: []
      });
      expect(result.statusCode).toBe(200);
    });

    test('correctly unassign one astronaut - 2 remove 1 remain 1', () => {
      const astronaut2 = requestAstronautCreate(sessionId1, 'first', 'last', 'rankknar', 24, 61, 184);
      const astronautId2 = astronaut2.body.astronautId;
      requestAdminAstronautAssign(sessionId1, astronautId2, missionId1);
      requestAdminAstronautUnassign(sessionId1, astronautId1, missionId1);
      const result = requestAdminMissionInfo(sessionId1, missionId1);
      expect(result.body).toStrictEqual({
        missionId: missionId1,
        name: 'name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        target: 'target',
        assignedAstronauts: [
          {
            astronautId: astronautId2,
            designation: 'rankknar first last'
          }
        ]
      });
      expect(result.statusCode).toBe(200);
    });
  });
});
