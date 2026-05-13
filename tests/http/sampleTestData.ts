import { LaunchInput, LaunchCalcParameters } from '../../codeToAdapt/src/newInterfaces';

export const sampleUser1 = {
  nameFirst: 'fnameOne',
  nameLast: 'lnameOne',
  email: 'user1@test.com',
  password: 'user1password'
};

export const sampleUser2 = {
  nameFirst: 'fnameTwo',
  nameLast: 'lnameTwo',
  email: 'user2@test.com',
  password: 'user2password'
};
export const sampleMission1 = {
  name: 'Mission1Name',
  description: 'Mission1Desc',
  target: 'Mission1Target'
};

export const sampleMission2 = {
  name: 'Mission2Name',
  description: 'Mission2Desc',
  target: 'Mission2Target'
};

export const sampleAstronaut1 = {
  nameFirst: 'James',
  nameLast: 'Kirk',
  rank: 'Captain',
  age: 35,
  height: 178,
  weight: 70
};

export const sampleLaunchVehicle1 = {
  name: 'Saturn V',
  description: 'Multi-stage Booster Rocket',
  maxCrewWeight: 500,
  maxPayloadWeight: 1000,
  launchVehicleWeight: 4000,
  thrustCapacity: 1000000,
  maneuveringFuel: 10
};

export const sampleLaunchVehicle2 = {
  name: 'Chris Li',
  description: 'Description description',
  maxCrewWeight: 499,
  maxPayloadWeight: 999,
  launchVehicleWeight: 3999,
  thrustCapacity: 999999,
  maneuveringFuel: 11
}

export const sampleLaunchVehicle3 = {
  name: 'Chris Li',
  description: 'Description description !@#$',
  maxCrewWeight: 499,
  maxPayloadWeight: 999,
  launchVehicleWeight: 3999,
  thrustCapacity: 999999,
  maneuveringFuel: 11
}

export const sampleLaunchVehicle4 = {
  name: 'Chris Li!@#',
  description: 'Description description',
  maxCrewWeight: 499,
  maxPayloadWeight: 999,
  launchVehicleWeight: 3999,
  thrustCapacity: 999999,
  maneuveringFuel: 11
}

export const sampleLaunch1: LaunchInput = {
  launchVehicleId: -1,
  payload: {
    description: 'UNSW Cubesat',
    weight: 400
  },
  launchParameters: {
    targetDistance: 12000,
    fuelBurnRate: 20,
    thrustFuel: 1000,
    activeGravityForce: 9.8,
    maneuveringDelay: 2
  }
};
