# ADMIN signup

The signup page allows selecting either `USER` or `ADMIN`. The User Service
stores the selected supported role, and signin returns that role in the JWT.
No invitation code or manual database promotion is needed for this college
project.

To create an administrator, open **Create Account**, choose **Admin**, enter a
username and password, and submit. Sign in with that account; the frontend
redirects ADMIN users to `/admin`. Admin API permissions are still enforced by
the backend services.
