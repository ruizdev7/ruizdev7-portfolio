# Use the official Python image from the Docker Hub as the build stage
FROM python:3.9-slim AS builder

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --user --no-cache-dir -r requirements.txt

# Use the official Python image from the Docker Hub as the final stage
FROM python:3.9-slim

# Set the working directory
WORKDIR /portfolio_app

# Copy only the necessary files from the build stage
COPY --from=builder /root/.local /root/.local
COPY . /portfolio_app

# Set environment variables
ENV PATH=/root/.local/bin:$PATH
ENV FLASK_APP=portfolio_app
ENV FLASK_ENV=production
ENV FLASK_RUN_PORT=6000

# Expose the port the app runs on
EXPOSE 6000

CMD ["gunicorn", "-b", "0.0.0.0:6000", "portfolio_app:app"]