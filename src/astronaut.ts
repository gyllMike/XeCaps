// This file should contain your functions relating to astronaut management
import {
  getData,
  setData,
  DataStore,
  Astronaut,
  AstronautListItem,
  missionLaunchState,
  MessageLog,
} from './dataStore';
import {
  nameValidity,
  astronautIdGen,
  validateAstronautDetails,
  findAstronautByName,
  findAstronautById,
  isAstronautAssigned,
  findControlUserIdFromSessionId,
} from './helpers';
import HTTPError from 'http-errors';
import request from 'sync-request-curl';
import { OPENROUTER_API_KEY } from './config';

const OPENROUTER_TIMEOUT_MS = 5000;

function fallbackLlmResponse(messageRequest: string): string {
  return `Astronaut support received your message: ${messageRequest}`;
}

function hasUsableOpenRouterKey(apiKey: string | undefined): apiKey is string {
  return apiKey !== undefined && apiKey.trim() !== '' && !apiKey.includes('<');
}

function generateLlmResponse(messageRequest: string): string {
  if (!hasUsableOpenRouterKey(OPENROUTER_API_KEY)) {
    return fallbackLlmResponse(messageRequest);
  }

  try {
    const prePrompt = '';
    const res = request('POST', 'https://openrouter.ai/api/v1/chat/completions', {
      headers: {
        Authorization:
          `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      json: {
        model: 'google/gemma-3n-e2b-it:free',
        messages: [
          {
            role: 'user',
            content: prePrompt + messageRequest,
          },
        ],
      },
      timeout: OPENROUTER_TIMEOUT_MS,
    });
    const body = JSON.parse(res.body.toString());
    const messageResponse = body?.choices?.[0]?.message?.content;

    if (typeof messageResponse === 'string' && messageResponse.length > 0) {
      return messageResponse;
    }
  } catch {
    return fallbackLlmResponse(messageRequest);
  }

  return fallbackLlmResponse(messageRequest);
}

/**
 * Creates a new astronaut and adds them to the pool.
 * @param nameFirst
 * @param nameLast
 * @param rank
 * @param age
 * @param weight
 * @param height
 * @returns An object containing the new astronaut's ID, or an error object.
 */
export function astronautCreate(
  sessionId: string,
  nameFirst: string,
  nameLast: string,
  rank: string,
  age: number,
  weight: number,
  height: number
): { astronautId: number } | { error: string; errorCategory: string } {
  findControlUserIdFromSessionId(sessionId);
  if (!nameValidity(nameFirst, nameLast)) {
    throw HTTPError(400, 'Invalid nameFirst or nameLast.');
  }

  // Validate Rank, Age, Weight, Height
  const validationError = validateAstronautDetails(rank, age, weight, height);
  if (validationError !== null) {
    throw HTTPError(400, 'validationError');
  }

  if (findAstronautByName(nameFirst, nameLast) !== null) {
    throw HTTPError(400, 'An astronaut already exists.');
  }

  // Generate ID and Timestamps using the new helper
  const newAstronautId = astronautIdGen();
  const currentTime = Math.floor(Date.now() / 1000);

  // Create Astronaut
  const newAstronaut: Astronaut = {
    astronautId: newAstronautId,
    timeAdded: currentTime,
    timeLastEdited: currentTime,
    nameFirst: nameFirst,
    nameLast: nameLast,
    rank: rank,
    age: age,
    weight: weight,
    height: height,
    assignedMission: {},
  };

  // Add to Data Store
  const data: DataStore = getData();
  data.astronautsArray.push({ astronaut: newAstronaut });
  setData(data);
  return { astronautId: newAstronautId };
}

/**
 * Returns a list of all astronauts in the pool.
 * @returns An object containing a list of all astronauts.
 */
export function astronautPoolList(): { astronauts: AstronautListItem[] } {
  // LOGIC STUB FOR ITERATION 2
  const data = getData();
  const astronauts = data.astronautsArray.map((i) => {
    const astronaut = i.astronaut;
    const designation = `${astronaut.rank} ${astronaut.nameFirst} ${astronaut.nameLast}`;
    const assigned = !!(
      astronaut.assignedMission && astronaut.assignedMission.missionId
    );
    return {
      astronautId: astronaut.astronautId,
      designation,
      assigned,
    };
  });
  return { astronauts };
}

/**
 * Removes an astronaut from the pool.
 * @param astronautId The ID of the astronaut to remove.
 * @returns An empty object on success, or an error object.
 */
export function astronautRemove(
  sessionId: string,
  astronautId: number
): Record<string, never> | { error: string; errorCategory: string } {
  findControlUserIdFromSessionId(sessionId);
  // Check if astronautId is valid
  const astronautExists = findAstronautById(astronautId);
  if (!astronautExists) {
    throw HTTPError(400, 'astronautid is invalid.');
  }

  // If the astronaut is currently assigned
  if (isAstronautAssigned(astronautId)) {
    throw HTTPError(400, 'The astronaut is currently assigned.');
  }

  // Byebye astronaut
  const data = getData();
  data.astronautsArray = data.astronautsArray.filter(
    (a) => a.astronaut.astronautId !== astronautId
  );
  setData(data); // Save the updated data
  return {};
}

/**
 * Edits the details of an existing astronaut.
 * @param astronautId
 * @param nameFirst
 * @param nameLast
 * @param rank
 * @param age
 * @param weight
 * @param height
 * @returns An empty object on success, or an error object.
 * @returns eRROR
 */
export function astronautDetailUpdate(
  astronautId: number,
  nameFirst: string,
  nameLast: string,
  rank: string,
  age: number,
  weight: number,
  height: number
): Record<string, never> | { error: string; errorCategory: string } {
  const data = getData();

  const validationError = validateAstronautDetails(rank, age, weight, height);

  if (validationError != null) {
    throw HTTPError(400, 'bad input');
  }

  if (!nameValidity(nameFirst, nameLast)) {
    throw HTTPError(400, 'bad input');
  }

  const findAs = data.astronautsArray.find(
    (f) => f.astronaut.astronautId === astronautId
  );

  if (!findAs) {
    throw HTTPError(400, 'bad input');
  }

  const doubleCheck1 = data.astronautsArray.find(
    (f) =>
      f.astronaut.nameFirst === nameFirst &&
      f.astronaut.nameLast === nameLast &&
      f.astronaut.astronautId !== astronautId
  );

  if (doubleCheck1) {
    throw HTTPError(400, 'bad input');
  }

  findAs.astronaut.nameFirst = nameFirst;
  findAs.astronaut.nameLast = nameLast;
  findAs.astronaut.rank = rank;
  findAs.astronaut.age = age;
  findAs.astronaut.weight = weight;
  findAs.astronaut.height = height;
  findAs.astronaut.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
}
/**
 *
 * @param controlUserId
 * @param astronautId
 * @returns All information about astronaut
 */
export function astronautGetInfo(
  controlUserId: number,
  astronautId: number
):
  | {
      astronautId: number;
      designation: string;
      timeAdded: number;
      timeLastEdited: number;
      age: number;
      weight: number;
      height: number;
      assignedMission:
        | { missionId: number; objective: string }
        | Record<string, never>;
    }
  | { error: string; errorCategory: string } {
  const data: DataStore = getData();
  const ast = data.astronautsArray.find(
    (x) => x.astronaut.astronautId === astronautId
  );

  if (!ast) {
    throw HTTPError(400, 'astronautid is invalid.');
  }

  const Astronautdata = ast.astronaut;

  let assignedMissionObject:
    | { missionId: number; objective: string }
    | Record<string, never> = {};

  if ('missionId' in Astronautdata.assignedMission) {
    const mid = Astronautdata.assignedMission.missionId;
    const mwrap = data.spaceMissionsArray.find(
      (mw) => mw.spaceMission.missionId === mid
    );

    if (mwrap) {
      const m = mwrap.spaceMission;
      assignedMissionObject = {
        missionId: m.missionId,
        objective: `[${m.target}] ${m.name}`,
      };
    }
  }

  return {
    astronautId: Astronautdata.astronautId,
    designation: `${Astronautdata.rank} ${Astronautdata.nameFirst} ${Astronautdata.nameLast}`,
    timeAdded: Astronautdata.timeAdded,
    timeLastEdited: Astronautdata.timeLastEdited,
    age: Astronautdata.age,
    weight: Astronautdata.weight,
    height: Astronautdata.height,
    assignedMission: assignedMissionObject,
  };
}

/**
 * Allow and astronaut to send messages to an LLM chatbot.
 *
 * @param astronautId
 * @param messageRequest
 * @returns messageResponse by llm chatbot
 */
export function sendLlmChat(astronautId: number, messageRequest: string) {
  const data = getData();
  const astronaut = data.astronautsArray.find(
    (a) => a.astronaut.astronautId === astronautId
  )?.astronaut;
  if (!astronaut) {
    throw HTTPError(400, 'Invalid astronaut Id');
  }
  const launch = data.launchesArray.find((l) =>
    l.launch.allocatedAstronauts.includes(astronautId)
  )?.launch;
  if (!launch) {
    throw HTTPError(400, 'not in a launch');
  }
  if (launch.state === missionLaunchState.ON_EARTH) {
    throw HTTPError(400, 'on earth');
  }
  const message1: MessageLog = {
    astronautId,
    messageId: launch.messageLog.length + 1,
    chatbotResponse: false,
    messageContent: messageRequest,
    timeSent: Math.floor(Date.now() / 1000),
  };
  launch.messageLog.push(message1);
  const messageResponse = generateLlmResponse(messageRequest);
  const message2: MessageLog = {
    astronautId,
    messageId: launch.messageLog.length + 1,
    chatbotResponse: true,
    messageContent: messageResponse,
    timeSent: Math.floor(Date.now() / 1000),
  };
  launch.messageLog.push(message2);
  setData(data);
  return { messageResponse };
}

/**
 * Retrieve the entire message history for the Astronaut
 *
 * @param astronautId
 * @returns - chat history
 */
export function llmChatHistory(astronautId: number) {
  const data = getData();
  const astronaut = data.astronautsArray.find(
    (a) => a.astronaut.astronautId === astronautId
  )?.astronaut;
  if (!astronaut) {
    throw HTTPError(400, 'Invalid astronaut Id');
  }
  const launch = data.launchesArray.find((l) =>
    l.launch.allocatedAstronauts.includes(astronautId)
  )?.launch;
  if (!launch) {
    throw HTTPError(400, 'not in a launch');
  }
  if (launch.state === missionLaunchState.ON_EARTH) {
    throw HTTPError(400, 'on earth');
  }
  const astronautMessageLog = launch.messageLog.filter(m => m.astronautId === astronautId);
  return {
    chatHistory: [
      {
        launchId: launch.launchId,
        messageLog: astronautMessageLog,
      },
    ],
  };
}
