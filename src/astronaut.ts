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

/**
  * Creates a fallback response for an astronaut chatbot message.
  *
  * @param messageRequest - The message sent by the astronaut
  *
  * @returns A fallback chatbot response containing the original astronaut message.
*/
function fallbackLlmResponse(messageRequest: string): string {
  return `Astronaut support received your message: ${messageRequest}`;
}

/**
  * Checks whether an OpenRouter API key is configured and usable.
  *
  * @param apiKey - The OpenRouter API key to check
  *
  * @returns True if the API key is present and usable, otherwise false.
*/
function hasUsableOpenRouterKey(apiKey: string | undefined): apiKey is string {
  return apiKey !== undefined && apiKey.trim() !== '' && !apiKey.includes('<');
}

/**
  * Generates a chatbot response for an astronaut message.
  *
  * @param messageRequest - The message sent by the astronaut
  *
  * @returns The generated chatbot response, or a fallback response if the LLM request is unavailable.
*/
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
  * Creates a new astronaut and adds them to the astronaut pool.
  *
  * @param sessionId - The session ID of the controlUser creating the astronaut
  * @param nameFirst - The first name of the astronaut
  * @param nameLast - The last name of the astronaut
  * @param rank - The rank of the astronaut
  * @param age - The age of the astronaut
  * @param weight - The weight of the astronaut
  * @param height - The height of the astronaut
  *
  * @returns An object containing the generated astronautId if the astronaut is successfully created.
  * @throws {HTTPError} 400 - Error case: if the name or astronaut details are invalid, or the astronaut already exists.
  * @throws {HTTPError} 401 - Error case: if the sessionId is invalid.
*/
export function astronautCreate(
  sessionId: string,
  nameFirst: string,
  nameLast: string,
  rank: string,
  age: number,
  weight: number,
  height: number
): { astronautId: number } {
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
  * Returns a list of all astronauts in the astronaut pool.
  *
  * @returns An object containing each astronaut's id, designation and assignment status.
*/
export function astronautPoolList(): { astronauts: AstronautListItem[] } {
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
  * Removes an astronaut from the astronaut pool.
  *
  * @param sessionId - The session ID of the controlUser removing the astronaut
  * @param astronautId - The unique identifier of the astronaut
  *
  * @returns An empty object if the astronaut is successfully removed.
  * @throws {HTTPError} 400 - Error case: if the astronautId is invalid or the astronaut is currently assigned.
  * @throws {HTTPError} 401 - Error case: if the sessionId is invalid.
*/
export function astronautRemove(
  sessionId: string,
  astronautId: number
): Record<string, never> {
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

  // Save the updated data
  setData(data);
  return {};
}

/**
  * Updates the details of an existing astronaut.
  *
  * @param astronautId - The unique identifier of the astronaut
  * @param nameFirst - The new first name of the astronaut
  * @param nameLast - The new last name of the astronaut
  * @param rank - The new rank of the astronaut
  * @param age - The new age of the astronaut
  * @param weight - The new weight of the astronaut
  * @param height - The new height of the astronaut
  *
  * @returns An empty object if the astronaut details are successfully updated.
  * @throws {HTTPError} 400 - Error case: if the astronautId, name or astronaut details are invalid, or the updated name is already used.
*/
export function astronautDetailUpdate(
  astronautId: number,
  nameFirst: string,
  nameLast: string,
  rank: string,
  age: number,
  weight: number,
  height: number
): Record<string, never> {
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
  * Returns the full details of an existing astronaut.
  *
  * @param controlUserId - The unique identifier of the controlUser requesting the astronaut details
  * @param astronautId - The unique identifier of the astronaut
  *
  * @returns An object containing the astronaut's id, designation, timestamps, physical details and assigned mission.
  * @throws {HTTPError} 400 - Error case: if the astronautId is invalid.
*/
export function astronautGetInfo(
  controlUserId: number,
  astronautId: number
): {
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
  } {
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
  * Sends an astronaut message to the LLM chatbot.
  *
  * @param astronautId - The unique identifier of the astronaut sending the message
  * @param messageRequest - The message sent by the astronaut
  *
  * @returns An object containing the chatbot message response.
  * @throws {HTTPError} 400 - Error case: if the astronautId is invalid, the astronaut is not in a launch, or the launch is on Earth.
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
  * Returns the LLM chat history for an astronaut in an active launch.
  *
  * @param astronautId - The unique identifier of the astronaut
  *
  * @returns An object containing the launchId and message log for the astronaut.
  * @throws {HTTPError} 400 - Error case: if the astronautId is invalid, the astronaut is not in a launch, or the launch is on Earth.
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
