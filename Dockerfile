# Use Ruby 3.2.2 as the base image
FROM ruby:3.2.2

# Set environment variables
ENV RAILS_ENV=production

# Set the working directory
WORKDIR /usr/src/app

# Update and upgrade packages
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get clean

# Install bundler and bundle install
COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.4.10 && \
    bundle install --without development test

# Install AWS SDK for Secrets Manager
RUN gem install aws-sdk-secretsmanager

# Copy the application into the container
COPY . .

# Precompile assets
RUN bundle exec rake assets:precompile

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["rails", "server", "-b", "0.0.0.0"]
