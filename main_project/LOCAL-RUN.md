# Local service configuration

Spring Boot does not load `.env.example` automatically. Each service imports
the root `SOA/.env` file when launched with its working directory set to its
own module directory (the standard Maven and IDE setup). The real `.env` file
is ignored by Git. Do not put real values in committed `application.properties`
files.

## Required environment variables

- `JWT_SECRET`: one random value of at least 32 bytes, identical for User,
  Vehicle, and Booking Services.
- `INTERNAL_SERVICE_SECRET`: a different random value of at least 32
  characters, identical for Vehicle and Booking Services.

The PostgreSQL connection uses database `driveease_db` and the credentials in
each service's `application.properties`.

Generate secret values locally in PowerShell if you need to rotate them (the
values are assigned but not printed), then update the corresponding entries
in the root `.env` file:

```powershell
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$jwtBytes = New-Object byte[] 32
$internalBytes = New-Object byte[] 32
$rng.GetBytes($jwtBytes)
$rng.GetBytes($internalBytes)
$env:JWT_SECRET = [Convert]::ToBase64String($jwtBytes)
$env:INTERNAL_SERVICE_SECRET = [Convert]::ToBase64String($internalBytes)
```

The `.env` file uses Java properties format (`KEY=value`). Alternatively,
environment variables override the file values. If starting from an IDE, set
the service module directory as the working directory or configure the JWT
secret in all three Run Configurations and the internal secret in Vehicle and
Booking.

Start Eureka, User, Vehicle, Booking, and Gateway after the environment is
configured. Frontend requests continue to use Gateway on port 8000.
