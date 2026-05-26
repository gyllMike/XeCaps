import {
  requestClear,
  requestAdminAuthRegister,
  requestAstronautCreate,
  requestadminAuthLogin,
  requestastronautPoolList,
  requestastronautDetailUpdate,
  requestAstronautRemove,
  requestadminMissionCreate,
  requestastronautGetInfo,
  requestAdminAstronautAssign
} from '../../src/requestHelpers';

describe('astronaut create tests', () => {
  let user1SessionId: string;

  // Valid astronaut details for success cases
  const validFirstName = 'Zhen';
  const validLastName = 'Cao';
  const validRank = "S' tu(d)e-nt";
  const validAge = 21;
  const validWeight = 66;
  const validHeight = 171;

  beforeEach(() => {
    requestClear();
    const user1Auth = requestAdminAuthRegister(
      'chris123@gmail.com',
      'abc123~!@',
      'chris',
      'li'
    );
    user1SessionId = user1Auth.body.controlUserSessionId;
  });

  test('should create an astronaut successfully with valid inputs', () => {
    const { statusCode, body } = requestAstronautCreate(
      user1SessionId,
      validFirstName,
      validLastName,
      validRank,
      validAge,
      validWeight,
      validHeight
    );
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      astronautId: expect.any(Number),
    });
  });

  test('should return 401 for an invalid session ID', () => {
    const invalidSessionId = 'fakesession';
    const { statusCode, body } = requestAstronautCreate(
      invalidSessionId,
      validFirstName,
      validLastName,
      validRank,
      validAge,
      validWeight,
      validHeight
    );
    expect(statusCode).toBe(401);
    expect(body).toMatchObject({ error: expect.any(String) });
  });

  describe('400 Bad Request error tests', () => {
    test('should return an error for invalid nameFirst or nameLast', () => {
      let res = requestAstronautCreate(
        user1SessionId,
        'B',
        validLastName,
        validRank,
        validAge,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });

      res = requestAstronautCreate(
        user1SessionId,
        'ThisNameIsWayTooLongForTheAstronautHahaha',
        validLastName,
        validRank,
        validAge,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });

      res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        'Aldrin!',
        validRank,
        validAge,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for duplicate astronaut name', () => {
      // Create the first astronaut
      requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        validRank,
        validAge,
        validWeight,
        validHeight
      );
      // Try to create another with the same name
      const { statusCode, body } = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        'Tutor-',
        validAge + 1,
        validWeight,
        validHeight
      );
      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for invalid rank', () => {
      let res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        'Col',
        validAge,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });

      const longRank = 'a'.repeat(51);
      res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        longRank,
        validAge,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });

      res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        'Colonel_USAF',
        validAge,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for invalid age', () => {
      // Too young
      let res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        validRank,
        19,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });

      // Too old
      res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        validRank,
        61,
        validWeight,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for invalid weight', () => {
      // Too heavy
      const res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        validRank,
        validAge,
        101,
        validHeight
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for invalid height', () => {
      // Too short
      let res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        validRank,
        validAge,
        validWeight,
        149
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });

      // Too tall
      res = requestAstronautCreate(
        user1SessionId,
        validFirstName,
        validLastName,
        validRank,
        validAge,
        validWeight,
        201
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ error: expect.any(String) });
    });
  });
});

// get /v1/admin/astronaut/pool astronautPoolList test
// status 200 - success return list
// status 401 - fail return error
describe('/v1/admin/astronaut/pool astronautPoolList test', () => {
  let session1: string;
  beforeEach(() => {
    requestClear();
    requestAdminAuthRegister('eric@gmail.com', 'Ericccc123', 'Eric', 'Wang');

    const login1 = requestadminAuthLogin('eric@gmail.com', 'Ericccc123');

    session1 = login1.body.controlUserSessionId;
  });
  test('success test1', () => {
    const res = requestastronautPoolList(session1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({ astronauts: [] });
  });
  test('success test2', () => {
    const validFirstName = 'Zhen';
    const validLastName = 'Cao';
    const validRank = "S' tu(d)e-nt";
    const validAge = 21;
    const validWeight = 66;
    const validHeight = 171;
    requestAstronautCreate(
      session1,
      validFirstName,
      validLastName,
      validRank,
      validAge,
      validWeight,
      validHeight
    );
    const res = requestastronautPoolList(session1);
    expect(res.statusCode).toBe(200);
    expect(res.body.astronauts.length).toBe(1);
    expect(res.body.astronauts[0].designation).toBe("S' tu(d)e-nt Zhen Cao");
    expect(res.body.astronauts[0].assigned).toBe(false);
  });
  test('fail test', () => {
    const res = requestastronautPoolList('notaId');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// get /v1/admin/astronaut/:astronautid astronautDetailUpdate test
// status 200 - success return list
// status 401 - fail return error
// status 400 - fail return error
describe('v1/admin/astronaut/:astronautid -astronautDetailUpdate - HTTP layer via requestHelper', () => {
  let SessionId: string;

  beforeEach(() => {
    requestClear();
    const Register = requestAdminAuthRegister('alan@gmail.com', 'LOVECHRIS520', 'Alan', 'Guo');
    SessionId = Register.body.controlUserSessionId;
  });

  test('Update astronaut successfully', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVELQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;
    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'LEVELEW';
    const newage = 22;
    const newweight = 90;
    const newheight = 185;

    const designation = `${newrank} ${newnameFirst} ${newnameLast}`;

    const updateRes = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toStrictEqual({});

    const astronautResponse = requestastronautGetInfo(SessionId, astronautId);
    expect(astronautResponse.body.designation).toBe(designation);

    expect(astronautResponse.body.age).toBe(newage);
    expect(astronautResponse.body.weight).toBe(newweight);
    expect(astronautResponse.body.height).toBe(newheight);
  });

  test('ControlUserSessionId Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'LEVELEW';
    const newage = 22;
    const newweight = 90;
    const newheight = 185;

    const res = requestastronautDetailUpdate('', astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('astronautId Validity Test', () => {
    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'LEVELEW';
    const newage = 22;
    const newweight = 90;
    const newheight = 185;

    const invalidAstronautId = null as unknown as number;
    const res = requestastronautDetailUpdate(SessionId, invalidAstronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('NameFirst Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'C'.repeat(40000);
    const newnameLast = 'Li';
    const newrank = 'LEVEEW';
    const newage = 22;
    const newweight = 90;
    const newheight = 185;

    const res = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('NameLast Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'Chris';
    const newnameLast = 'L'.repeat(40000);
    const newrank = 'LEVELEW';
    const newage = 22;
    const newweight = 90;
    const newheight = 185;

    const res = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Rank Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'L'.repeat(4000);
    const newage = 22;
    const newweight = 90;
    const newheight = 185;

    const res = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Age Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'LEVELEW';
    const newage = 100000;
    const newweight = 90;
    const newheight = 185;

    const res = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Weight Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'LEVELEW';
    const newage = 22;
    const newweight = 10000;
    const newheight = 185;

    const res = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Height Validity Test', () => {
    const astronautRes = requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVEQW', 21, 80, 180);
    const astronautId = astronautRes.body.astronautId;

    const newnameFirst = 'Chris';
    const newnameLast = 'Li';
    const newrank = 'LEVELEW';
    const newage = 22;
    const newweight = 90;
    const newheight = 1000000;

    const res = requestastronautDetailUpdate(SessionId, astronautId, newnameFirst, newnameLast, newrank, newage, newweight, newheight);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Different ID NameFirst and NameLast already exist Update Case Test', () => {
    requestAstronautCreate(SessionId, 'Alan', 'Guo', 'LEVELA', 21, 80, 180);
    const astronaut2 = requestAstronautCreate(SessionId, 'Chris', 'Li', 'LEVELB', 22, 85, 175);

    const astronautId2 = astronaut2.body.astronautId;

    const res = requestastronautDetailUpdate(SessionId, astronautId2, 'Alan', 'Guo', 'LEVELA', 22, 85, 175);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('HTTP DELETE remove astronaut', () => {
  let user1SessionId: string;
  let astronaut1: { astronautId: number };
  const validFirstName = 'Zhen';
  const validLastName = 'Cao';
  const validRank = "S' tu(d)e-nt";
  const validAge = 21;
  const validWeight = 66;
  const validHeight = 171;
  beforeEach(() => {
    requestClear();
    // Register a user first
    const user1Auth = requestAdminAuthRegister(
      'chris123@gmail.com',
      'abc123~!@',
      'chris',
      'li'
    );
    user1SessionId = user1Auth.body.controlUserSessionId;
    // Create an astronaut to be used in tests
    const createRes = requestAstronautCreate(
      user1SessionId,
      validFirstName,
      validLastName,
      validRank,
      validAge,
      validWeight,
      validHeight
    );
    if (createRes.statusCode === 200 && createRes.body && createRes.body.astronautId) {
      astronaut1 = createRes.body; // Store the astron
    } else {
      console.log('Test setup failed: Could not create astronaut.');
    }
  });

  test('should remove an unassigned astronaut successfully', () => {
    const { statusCode, body } = requestAstronautRemove(user1SessionId, astronaut1.astronautId);
    // Check for success status (200) and empty body
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({}); // Expect an empty object
    const poolList = requestastronautPoolList(user1SessionId);
    expect(poolList.body.astronauts).toHaveLength(0); // Pool should be empty now
  });

  test('should return 401 Unauthorized for an invalid session ID', () => {
    const invalidSessionId = 'notvalid';
    const { statusCode, body } = requestAstronautRemove(invalidSessionId, astronaut1.astronautId);
    expect(statusCode).toBe(401);
    expect(body).toMatchObject({ error: expect.any(String) });
  });

  describe('400 Bad Request error tests', () => {
    test('should return an error for an invalid (non-existent) astronaut ID', () => {
      const invalidAstronautId = 9999;
      // Rremove an astronaut that doesn't exist
      const { statusCode, body } = requestAstronautRemove(user1SessionId, invalidAstronautId);
      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error for an non-numeric astronaut ID', () => {
      const invalidAstronautId = 9999;
      // Rremove an astronaut that doesn't exist
      const { statusCode, body } = requestAstronautRemove(user1SessionId, invalidAstronautId);
      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: expect.any(String) });
    });

    test('should return an error if the astronaut is currently assigned to a mission', () => {
      // Create a mission and assign the astronaut
      const mission = requestadminMissionCreate(user1SessionId, 'Moon Landing', 'Go to moon', 'Moon');
      requestAdminAstronautAssign(user1SessionId, astronaut1.astronautId, mission.body.missionId);
      const { statusCode, body } = requestAstronautRemove(user1SessionId, astronaut1.astronautId);

      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: expect.any(String) });
    });
  });
});

describe('HTTP GET ASTRONAUT INFORMATION TEST', () => {
  let user1: ReturnType<typeof requestAdminAuthRegister>;
  let user2: ReturnType<typeof requestAdminAuthRegister>;
  let sessionId1: string, sessionId2: string, invalidSessionId: string;
  let astronaut1: ReturnType<typeof requestAstronautCreate>;
  let astronautId1: number, invalidAstronautId: number;
  beforeEach(() => {
    requestClear();
    user1 = requestAdminAuthRegister('chrislee@gmail.com', 'abcd1234!@#', 'Chris', 'Li');
    user2 = requestAdminAuthRegister('alan@gmail.com', 'xyz123@@', 'Alan', 'Guo');
    requestAdminAuthRegister('harrypotter@gmail.com', 'qwert789~~', 'harry', 'potter');

    sessionId1 = user1.body.controlUserSessionId;
    sessionId2 = user2.body.controlUserSessionId;
    invalidSessionId = '-999';

    astronaut1 = requestAstronautCreate(sessionId1, 'You', 'Wu', 'rankkkk', 21, 66, 190);
    requestAstronautCreate(sessionId1, 'Will', 'Wu', 'rankkkk', 23, 60, 190);
    requestAstronautCreate(sessionId1, 'Zhen', 'Cao', 'rankkkk', 25, 70, 190);

    astronautId1 = astronaut1.body.astronautId;
    invalidAstronautId = -999;
  });

  describe('wrong case', () => {
    test('invalid session id', () => {
      expect(requestastronautGetInfo(invalidSessionId, astronautId1).body).toStrictEqual({
        error: expect.any(String)
      });
      expect(requestastronautGetInfo(invalidSessionId, astronautId1).statusCode).toBe(401);
    });

    test('invaild astronaut id', () => {
      expect(requestastronautGetInfo(sessionId1, invalidAstronautId).body).toStrictEqual({
        error: expect.any(String)
      });
      expect(requestastronautGetInfo(sessionId1, invalidAstronautId).statusCode).toBe(400);
    });
  });

  describe('sucessful case', () => {
    test('should return astronaut details for unassigned astronaut', () => {
      const res = requestastronautGetInfo(sessionId1, astronautId1);

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        astronautId: astronautId1,
        designation: 'rankkkk You Wu',
        timeAdded: expect.any(Number),
        timeLastEdited: expect.any(Number),
        age: 21,
        weight: 66,
        height: 190,
        assignedMission: {}
      });
    });

    test('should return astronaut details for an ASSIGNED astronaut', () => {
      const mission = requestadminMissionCreate(sessionId2, 'Mars Exploration', 'Mars', 'Find water');
      const missionId = mission.body.missionId;

      requestAdminAstronautAssign(sessionId2, astronautId1, missionId);

      const res = requestastronautGetInfo(sessionId2, astronautId1);

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        astronautId: astronautId1,
        designation: 'rankkkk You Wu',
        timeAdded: expect.any(Number),
        timeLastEdited: expect.any(Number),
        age: 21,
        weight: 66,
        height: 190,
        assignedMission: {
          missionId: missionId,
          objective: '[Find water] Mars Exploration'
        }
      });
    });
  });
});
