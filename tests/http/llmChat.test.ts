import { getData, setData } from '../../src/dataStore';
import {
  requestClear,
  requestAdminAuthRegister,
  adminLaunchVehicleCreateRequest,
  requestadminMissionCreate,
  adminLaunchCreateRequest,
  requestAdminAstronautAssign,
  requestAstronautCreate,
  adminLaunchStateUpdateRequest,
  requestSendLlmChat,
  requestLlmChatHistory,
} from '../../src/requestHelpers';

import {
  sampleUser1,
  sampleMission1,
  sampleAstronaut1,
  sampleLaunchVehicle1,
  sampleLaunch1
} from './sampleTestData';

describe('sendLlmChat test', () => {
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
    requestAdminAstronautAssign(sessionId, missionId, astronautId);
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
  test('succes test', () => {
    adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
    const data = getData();
    const launch = data.launchesArray.find(l => l.launch.launchId === lId).launch;
    launch.allocatedAstronauts.push(astronautId);
    setData(data);
    const res = requestSendLlmChat(astronautId, 'hi');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('messageResponse');
    expect(typeof res.body.messageResponse).toBe('string');
    expect(res.body.messageResponse.length).toBeGreaterThan(0);
  });
  test('astronaut not in launch', () => {
    const res = requestSendLlmChat(astronautId, 'hi');
    expect(res.statusCode).toBe(400);
  });
  test('Invalid astronaut Id', () => {
    const res = requestSendLlmChat(222, 'hi');
    expect(res.statusCode).toBe(400);
  });
  test('launch on earth', () => {
    adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
    const data = getData();
    const launch = data.launchesArray.find(l => l.launch.launchId === lId).launch;
    launch.allocatedAstronauts.push(astronautId);
    setData(data);
    const res = requestSendLlmChat(astronautId, 'hi');
    expect(res.statusCode).toBe(400);
  });
});

describe('LlmChat History test', () => {
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
  test('succes test', () => {
    adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'LIFTOFF');
    const data = getData();
    const launch = data.launchesArray.find(l => l.launch.launchId === lId).launch;
    launch.allocatedAstronauts.push(astronautId);
    setData(data);
    const Sres = requestSendLlmChat(astronautId, 'hi');
    expect(Sres.statusCode).toBe(200);
    const res = requestLlmChatHistory(astronautId);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('chatHistory');
    expect(Array.isArray(res.body.chatHistory)).toBe(true);
    const chat = res.body.chatHistory[0];
    expect(chat).toHaveProperty('launchId');
    const chat1 = chat.messageLog[0];
    const chat2 = chat.messageLog[1];
    expect(chat1).toHaveProperty('messageId');
    expect(chat1.chatbotResponse).toBe(false);
    expect(chat2).toHaveProperty('messageId');
    expect(chat2.chatbotResponse).toBe(true);
  });
  test('astronaut not in launch', () => {
    const res = requestLlmChatHistory(astronautId);
    expect(res.statusCode).toBe(400);
  });
  test('Invalid astronaut Id', () => {
    const res = requestLlmChatHistory(222);
    expect(res.statusCode).toBe(400);
  });
  test('launch on earth', () => {
    adminLaunchStateUpdateRequest(sessionId, missionId, lId, 'FAULT');
    const data = getData();
    const launch = data.launchesArray.find(l => l.launch.launchId === lId).launch;
    launch.allocatedAstronauts.push(astronautId);
    setData(data);
    const res = requestLlmChatHistory(astronautId);
    expect(res.statusCode).toBe(400);
  });
});
