# Adapting code from Iteration 3

This folder `codeToAdapt` contains starter code that you can integrate into your Iteration 3 to make complete some of the starter functions

We will also do some Sprint Planning

## Sprint Planning

We need to do the following tasks for Iteration 3 Sprint Planning:
1. Data Model Walkthrough
2. Helper + Blocker identifaction
3. Dependancy Graph
4. Iteration 3 Tier Organisation

### Data Model Walkthrough

New concepts for Iteration 3:
1. Launch Vehicle
2. Payload
3. Launch

#### Launch Vehicle
A Launch vehicle has the following properties:

 - launchVehicleId
 - name
 - description
 - maxCrewWeight (kg)
 - maxPayloadWeight (kg)
 - launchVehicleWeight (kg)
 - ThrustCapacity : number
 - maneuveringFuel: number (L)
 - timeAdded: number (s)
 - timeLastEdited: number (s)
 - retired: boolean
 - launches: LaunchSummary[] (can this be a computed property or a stored property?)

If a launch is attempted that exceeds the maximum crew weight or maximum payload weight, it should fail.
A launch vehicle can be assigned to a single launch at a time. It can not be unassigned until the launch state is ON_EARTH.

#### Payload
A payload has the following properties:

 - payloadId : number
 - description : string
 - weight : number (kg)
 - deployed : boolean

A payload is unique to each launch. It does not exist outside of a launch. However it might be prudent to create a seperate entity to design for maintainability.

#### 5.7.3. Launch
A Launch has the following properties:

 - launchId: number
 - missionCopy: Mission 
 - launchCreationTime: number
 - state : LaunchState
 - assignedLaunchVehicleId: number
 - remainingLaunchVehicleFuel: number
 - payloadId: number
 - allocatedAstronauts: number[]
 - launchCalculationParameters: LaunchCalcParameters
    - targetDistance: number
    - fuelBurnRate: number
    - thrustFuel: number
    - activeGravityForce: number
    - maneuveringDelay: number

### Helper and blocker function identification

New helper functions needed:

1. Launch Vehicle
    - launchVehicleNameValidityCheck(name:string) : boolean
    - launchVehicleDescriptionValidityCheck(description:string) : boolean
    - launchVehicleCrewWeightValidityCheck(maxCrewWeight: number) : boolean
    - launchVehiclePayloadWeightValidityCheck(maxPayloadWeight: number) : boolean
    - launchVehicleWeightValidityCheck(launchVehicleWeight: number) : boolean
    - launchVehicleThrustCapacityValidityCheck(thrustCapacity: number) : boolean
    - launchVehicleManeuveringFuelValidityCheck(maneuveringFuel: number) : boolean
    - launchVehicleLaunchSummary(launchVehicleId: number) : LaunchVehicleLaunchSummary
    - launchVehicleIdCheck(launchVehicleId: number) : boolean 
2. Launch
    - launchIdCheck() : boolean
    - launchCalculationParameterCorrectnessCheck(launchParams: LaunchCalcParameters): boolean
    - canThisLaunchReachTargetDistanceCheck(): boolean
    - launchStateUpdate related
        - checkValidActionForCurrentState() : boolean
        - initializeLaunching()
        - initializeManeuvering()
        - initializeCoasting()
        - initializeMissionComplete()
        - initializeReEntry()
        - initializeOnEarth()
3. Payload
    - payloadDescriptionValidityCheck(description: string): boolean
    - payloadIdCheck(payloadId: number) : boolean

Blocker functions:
1. Can not create any of the Iteration 3 functions without a `controlUserSessionId`, so `POST adminAuthRegister` is a blocker function
2. Can not test `POST LaunchVehicleCreate` with out a launchVehicle info, so `GET LaunchVehicleInfo` is a testing blocker
3. Can not update or retire a launch vehicle without `POST LaunchVehicleCreate`, so it is a blocker function
4. Can not create a Launch without a Launch Vehicle or Mission, so `POST MissionCreate` and `POST LaunchVehicleCreate` are blockers for this function.
5. Can not test `POST LaunchCreate` with out a launch info, so `GET LaunchInfo` is a testing blocker
6. Can not Update a launch without creating one or testing one, so `POST Launch Create` and `GET LaunchInfo` are blockers
7. Can not allocate or de-allocate Astronauts with out a launch, so `POST LaunchCreate` is a blocking function
8. Can not deallocate an astronaut without allocating them first, so `POST AstronautLaunchAllocate` and `POST AstronautMissionAssign` are blocking functions.