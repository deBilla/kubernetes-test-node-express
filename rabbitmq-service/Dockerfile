# Use an official RabbitMQ image as the base image
FROM rabbitmq:latest

# Add any custom configurations or plugins
# For example, you can enable the management plugin
RUN rabbitmq-plugins enable --offline rabbitmq_management

# Expose ports used by RabbitMQ
# Port 5672 is for AMQP, and port 15672 is for the management interface
EXPOSE 5672 15672

# Define environment variables (optional)
# You can specify RabbitMQ configuration using environment variables
# For example, to set the default user and password, you can use:
ENV RABBITMQ_DEFAULT_USER=myuser
ENV RABBITMQ_DEFAULT_PASS=mypassword