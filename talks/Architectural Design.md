
# Architectural Design

The whole system must be handled as e monorepo.
Use NX.

The backend APIs will be first developed under Python, maybe later implementes in Node (maybe Nest), or even Runst (see the ./talks/ documentation)

The frontend will be NextJs with React.

All supporting services will be implemented in a single docker-conpose.
Initially, the whole system should be able to run con premise, from a standard PC to a RaspberryPi.
Could later be moved to the cloud and scaled as needed.

