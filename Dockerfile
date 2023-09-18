FROM ruby:3.2.2

ENV RAILS_ENV=production

WORKDIR /usr/src/app

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get clean

COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.4.10 && \
    bundle install --without development test

RUN gem install aws-sdk-secretsmanager

COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]