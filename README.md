# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Docker Deployment

This application is configured to be deployed using Docker.

### Prerequisites
- Docker must be installed and running on your machine.

### Building the Docker Image

To build the production Docker image, run the following command in your terminal:

```bash
npm run docker:build
```

This will create a Docker image named `asg-website`.

### Running the Docker Container

After the image has been successfully built, you can run it as a container with this command:

```bash
npm run docker:run
```

This will start the container and map port 3000 on your host machine to port 3000 inside the container.

You can now access the application by navigating to `http://localhost:3000` in your web browser.
