# State Progression

How would an actual use case for our xecaps system work?

## System Flow

1. Register Users
    1. User 1 - "Houston"
    2. User 2 - "Clarke"
2. Create Missions
    1. Mission 10 - "Moon"
        - under user 1 "Houston"
    2. Mission 11 - "ISS"
        - under user 1 "Houston"
3. Create Astronauts
    1. Astronaut 20 - "Bob"
    2. Astronaut 21 - "Mary"
    3. Astronaut 22 - "Sam"
4. Train Astornauts on a Mission
    1. Assign Bob to Mission 10
    2. Assign Mary to Mission 10
    3. Assign Sam to Mission 11
5. Create Launch Vehicles
    1. LV 1 - "Saturn"
        - maneuveringFuel 30
    2. LV 2 - "Starship"
        - maneuveringFuel 10
6. Create Launch
    1. Launch 100
        - LV 2 - "Starship"
        - Mission 11 - "ISS"
        - Payload 1001 - "Starlink Satellite"
            - Weight 300kg
            - Name/Description "Starlink Satellite"
        - maneuveringDelay: 2 seconds
        - Valid launch params
        - Beginning State is "READY_TO_LAUNCH"
        - can no longer retire launch vehicle
7. Allocate Astronauts to Launch
    - Allocate 22 "Sam" to Launch 100
8. Begin Launch update procedures
    1. Send "LIFTOFF"
        - check launch params still valid (might have changed after allocating an astronaut)
        - Launch state updates to "READY_TO_LAUNCH" ==> "LAUNCHING"
        - can no longer de-allocate astronaut
        - 3 second timer started for moving to "MANEUVERING"
    2. Send "SKIP_WAITING"
        - cancel existing timer
        - Launch state updates "LAUNCHING" ==> "MANEUVERING"
        - timer started equal to maneuveringDelay (2seconds) for moving to "COASTING"
    3. Send "CORRECTION"
        - cancel existing timers
        - check maneuveringFuel (starts at LV2 default - 10)
        - is 10 - 3 > 0 (yes), can proceed
        - set maneuvringFuel to 7
        - Launch state updates "MANEUVERING" ==> "LAUNCHING"
        - 3 second timer started for moving to "MANEUVERING"
    4. 3 seconds elapse, automatically we move to "MANEUVERING"
        - state is now "MANEUVERING"
        - timer started equal to maneuveringDelay (2seconds) for moving to "COASTING"
    5. 2 seconds elapse, automatically we move to "COASTING"
        - state is now "COASTING"
    6. Send "DEPLOY_PAYLOAD"
        - Payload gets deployed
            - Payload 1001 "Starlink Satellite" has property "deployed" changed to 'true'
        - Launch state updates from "COASTING" ==> "MISSION_COMPLETE"
    7. Send "GO_HOME"
        - Launch state updates from "MISSION_COMPLETE" ==> "RE-ENTRY"
    8. Send "RETURN"
        - Launch state updates from "RE-ENTRY" ==> "ON_EARTH"
        - Astronaut 22 "Sam" is deallocated from Launch 100
        - LV 2 "Starship" is available to be allocated to another launch or to be retired

## Alternative Flows

### Crew Weight made launch params calculation fail

1. Send "LIFTOFF"
    - INVALID launch params (astronaut addition caused launch to fail due to making target unreachable)
    - Send "FAULT"
        - Launch state updates from "READY_TO_LAUNCH" ==> "ON_EARTH"
            - Astronaut 22 "Sam" is deallocated from Launch 100
            - LV 2 "Starship" is available to be allocated to another launch or to be retired

### FAULT sent by Control User
1. cancel any timers
2. Launch State updates to "RE-ENTRY"
    - proceed with state progression '8'

### Insufficient Maneuvering Fuel
1. Trigger a "FAULT" action to be sent
2. cancel any existing timers
3. Launch State updates to "RE-ENTRY"
    - proceed with state progression '8'

### Send "FIRE_THRUSTERS" at '4'
1. cancel existing timers
2. Launch state changes from "MANEUVERING" ==> "COASTING"
    - proceed with '5' onwards