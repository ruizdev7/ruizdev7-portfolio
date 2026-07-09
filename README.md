# Portfolio

Portfolio web app with a Flask backend and a React frontend.

## CI/CD

- Build and push workflow: [`.github/workflows/build_and_push.yml`](./.github/workflows/build_and_push.yml)
- EC2 deploy workflow: [`.github/workflows/deploy-ec2.yml`](./.github/workflows/deploy-ec2.yml)
- Main build script: [`scripts/ci/build_and_deploy.sh`](./scripts/ci/build_and_deploy.sh)
- Fast build script for Intel/x86_64 servers: [`scripts/ci/build_and_deploy_fast.sh`](./scripts/ci/build_and_deploy_fast.sh)

Your rented Intel server uses the `linux/amd64` image variant.

## Deployment

For the detailed deployment process, see [frontend/docs-md/DEPLOYMENT.md](./frontend/docs-md/DEPLOYMENT.md).
