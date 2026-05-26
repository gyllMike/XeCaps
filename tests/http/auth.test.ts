import { requestClear, requestAdminAuthRegister, requestadminAuthLogin, requestadminControlUserDetails, requestadminAuthLogout, requestadminControlUserDetailsUpdate, requestadminControlUserPasswordUpdate } from '../../src/requestHelpers';

beforeEach(() => {
  requestClear();
});

// Test function adminAuthRegister
describe('adminAuthRegister tests', () => {
  test('register successfully', () => {
    const registerReturn = requestAdminAuthRegister(
      'chris123@gmail.com',
      'abc123~!@',
      'chris',
      'li'
    );
    expect(registerReturn.body).toStrictEqual({
      controlUserSessionId: expect.any(String)
    });
    expect(registerReturn.statusCode).toBe(200);
  });

  describe('register failed', () => {
    test('email used already', () => {
      requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'chris',
        'li'
      );
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc234~!@',
        'chrislll',
        'lilll'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('email not valid', () => {
      const registerReturn = requestAdminAuthRegister(
        '@gmail.com',
        'abc123~!@',
        'chris',
        'li'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('first name contains non-ascii char', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'chris$$$',
        'li'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('first name too long', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'chrisssssssssssssssssssssssssssssss',
        'li'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('first name too short', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'c',
        'li'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('last name contains non-ascii char', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'chris',
        'li$$$'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('last name too long', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'chris',
        'liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('last name too short', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'abc123~!@',
        'chris',
        'l'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('password too short', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'a',
        'chris',
        'li'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });

    test('password too simple', () => {
      const registerReturn = requestAdminAuthRegister(
        'chris@gmail.com',
        'aaaaaaaaaa',
        'chris',
        'li'
      );
      expect(registerReturn.body).toStrictEqual({
        error: expect.any(String)
      });
      expect(registerReturn.statusCode).toBe(400);
    });
  });
});

// Test function adminAuthLogin
describe('adminAuthLogin tests', () => {
  // Set data before each test
  beforeEach(() => {
    requestClear();
    requestAdminAuthRegister('test@gmail.com', 'eric07177', 'Eric', 'Wang');
  });

  // Correct email and password
  // Should return controlUserId
  test('success test', () => {
    const res = requestadminAuthLogin('test@gmail.com', 'eric07177');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('controlUserSessionId');
    expect(typeof res.body.controlUserSessionId).toBe('string');
  });

  // Incorrect password
  // Should return BAD_INPUT
  test('wrong password test', () => {
    const res = requestadminAuthLogin('test@gmail.com', 'eric07288');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Inexistent email
  // Should return BAD_INPUT
  test('wrong email test', () => {
    const res = requestadminAuthLogin('wrpng@gmail.com', 'eric07177');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // No user test
  test('No usesr test', () => {
    requestClear();
    const res = requestadminAuthLogin('wrpng@gmail.com', 'eric07177');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /v1/admin/controluser/details - HTTP layer via requestHelper', () => {
  let SessionId: string;

  beforeEach(() => {
    requestClear();
  });

  test('return full user detail for valid sessionId', () => {
    const res1 = requestAdminAuthRegister('ala@gmail.com', 'LOVECHRIS520', 'Alan', 'Guo');
    SessionId = res1.body.controlUserSessionId;

    const res2 = requestadminControlUserDetails(SessionId);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.user).toMatchObject({
      name: 'Alan Guo',
      email: 'ala@gmail.com',
      numSuccessfulLogins: expect.any(Number),
      numFailedPasswordsSinceLastLogin: expect.any(Number),
    });
  });

  test('invalid sessionId should return 401', () => {
    const res = requestadminControlUserDetails('nofound-sessiond');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Invalid Return', () => {
    const res1 = requestAdminAuthRegister('ala@gmail.com', 'LOVECHRIS520', 'Alan', 'Guo');
    SessionId = res1.body.controlUserSessionId;

    const res = requestadminControlUserDetails('sss');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('mission sessionid header should return 401', () => {
    const res = requestadminControlUserDetails('');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// Test function adminControlUserPasswordUpdate
describe('adminControlUserPasswordUpdate', () => {
  let sessionId: string;

  beforeEach(() => {
    requestClear();
    const reg = requestAdminAuthRegister('test@gmail.com', 'Uuu030303', 'Will', 'Wu');
    sessionId = reg.body.controlUserSessionId;
  });

  test('successful test', () => {
    const PasswordReturn = requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu030303',
      'Uuu060606'
    );

    expect(PasswordReturn.statusCode).toBe(200);
    expect(PasswordReturn.body).toEqual({});
  });

  test('new password is same as old password', () => {
    const PasswordReturn = requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu030303',
      'Uuu030303'
    );

    expect(PasswordReturn.statusCode).toBe(400);
  });

  test('new password is same with old password', () => {
    requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu030303',
      'Uuu060606'
    );
    const PasswordReturn = requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu060606',
      'Uuu030303'
    );
    expect(PasswordReturn.body).toStrictEqual({ error: 'New Password has already been used before.' });
    expect(PasswordReturn.statusCode).toBe(400);
  });

  test('new password is not valid', () => {
    const PasswordReturn = requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu030303',
      'Uuu!'
    );

    expect(PasswordReturn.statusCode).toBe(400);
  });

  test('not a valid user', () => {
    const PasswordReturn = requestadminControlUserPasswordUpdate(
      '9999901',
      'Uuu030303',
      'Uuu060606'
    );
    expect(PasswordReturn.statusCode).toBe(401);
  });

  test('old password is not the correct old password', () => {
    const PasswordReturn = requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu040404',
      'Uuu060606'
    );
    expect(PasswordReturn.statusCode).toBe(400);
  });

  test('new password has already been used before', () => {
    requestadminControlUserPasswordUpdate(sessionId, 'Uuu030303', 'Uuu060606');

    const PasswordReturn = requestadminControlUserPasswordUpdate(
      sessionId,
      'Uuu060606',
      'Uuu060606'
    );

    expect(PasswordReturn.statusCode).toBe(400);
  });
});

// test adminControlUserDetailsUpdate
describe('adminControlUserDetailsUpdate', () => {
  let sessionId: string;

  beforeEach(() => {
    requestClear();
    const reg = requestAdminAuthRegister('test@gmail.com', 'Uuu030303', 'Will', 'Wu');
    sessionId = reg.body.controlUserSessionId;
  });

  test('successful update', () => {
    const result = requestadminControlUserDetailsUpdate(
      sessionId,
      'newemail@gmail.com',
      'Harry',
      'Potter'
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});

    const userDetailsResponse = requestadminControlUserDetails(sessionId);
    const user = userDetailsResponse.body.user;

    expect(user.email).toBe('newemail@gmail.com');
    expect(user.name).toBe('Harry Potter');
  });

  test('invalid user', () => {
    const result = requestadminControlUserDetailsUpdate(
      '-1',
      'abc@gmail.com',
      'Jack',
      'Smith'
    );
    expect(result.statusCode).toBe(401);
  });

  test('invalid email format', () => {
    const result = requestadminControlUserDetailsUpdate(
      sessionId,
      'wrong format',
      'Will',
      'Wu'
    );
    expect(result.statusCode).toBe(400);
  });

  test('email already in use', () => {
    requestAdminAuthRegister(
      'used@gmail.com',
      'Uuu040404',
      'Chris',
      'Li'
    );

    const result = requestadminControlUserDetailsUpdate(
      sessionId,
      'used@gmail.com',
      'Will',
      'Wu'
    );

    expect(result.statusCode).toBe(400);
  });

  test('invalid name', () => {
    const result = requestadminControlUserDetailsUpdate(
      sessionId,
      'wuyou123@gmail.com',
      'W',
      'Wu'
    );
    expect(result.statusCode).toBe(400);
  });
});

// test admin auth logout
// 401 INVALID_CREDENTIALS
// 400 success
describe('adminMissionList tests', () => {
  let session1: string;
  beforeEach(() => {
    requestClear();
    requestAdminAuthRegister('eric@gmail.com', 'Ericccc123', 'Eric', 'Wang');

    const login1 = requestadminAuthLogin('eric@gmail.com', 'Ericccc123');
    session1 = login1.body.controlUserSessionId;
  });
  test('success logout test', () => {
    const res = requestadminAuthLogout(session1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({});
  });
  test('Invalid sessionId test', () => {
    const res = requestadminAuthLogout('PoorId');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
