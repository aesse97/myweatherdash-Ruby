require 'net/http'
require 'json'
require 'aws-sdk-secretsmanager' if Rails.env.production?

class WeatherController < ApplicationController

  def dashboard
    @open_weather_api_key, @google_places_api_key = fetch_api_keys
    latitude = params[:latitude] || 40.7128  # Default latitude
    longitude = params[:longitude] || -74.0060  # Default longitude

    if latitude && longitude
      @weather_data = fetch_weather_data(latitude, longitude, @open_weather_api_key)
      @location_name = params[:locationName] || "New York, NY, United States"
    else
      @error = "Could not fetch weather information: Invalid location"
    end
  end

  def reverse_geocode
    latitude = params[:latitude]
    longitude = params[:longitude]
    open_weather_api_key, _ = fetch_api_keys

    uri = URI("http://api.openweathermap.org/geo/1.0/reverse?lat=#{latitude}&lon=#{longitude}&limit=1&appid=#{open_weather_api_key}")
    response = Net::HTTP.get(uri)
    location_data = JSON.parse(response).first

    render json: { location_name: location_data['name'] }
  end

  def dashboard_location
    latitude = params[:latitude]
    longitude = params[:longitude]
    open_weather_api_key, _ = fetch_api_keys

    # Fetch weather data based on latitude and longitude
    @weather_data = fetch_weather_data(latitude, longitude, open_weather_api_key)

    render json: { weather_data: @weather_data }
  end

  private

  def fetch_api_keys
    if Rails.env.production?
      # Fetch from AWS Secrets Manager
      client = Aws::SecretsManager::Client.new(region: 'us-east-2')
      secret = client.get_secret_value(secret_id: 'weather-api-keys')
      secret_data = JSON.parse(secret.secret_string)
      open_weather_api_key = secret_data['OPEN_WEATHER_API_KEY']
      google_places_api_key = secret_data['GOOGLE_PLACES_API_KEY']
    else
      # Fetch from local environment variable
      open_weather_api_key = ENV['OPEN_WEATHER_API_KEY'] || Rails.application.credentials.open_weather[:api_key]
      google_places_api_key = ENV['GOOGLE_PLACES_API_KEY'] || Rails.application.credentials.google_places[:api_key]
    end

    return open_weather_api_key, google_places_api_key
  end

  def fetch_coordinates(location, api_key)
    location ||= 'New York'
    geocode_uri = URI("http://api.openweathermap.org/geo/1.0/direct?q=#{location}&limit=1&appid=#{api_key}")
    geocode_response = Net::HTTP.get(geocode_uri)
    geocode_data = JSON.parse(geocode_response).first

    [geocode_data['lat'], geocode_data['lon'], geocode_data['name']]
  end

  def fetch_weather_data(latitude, longitude, api_key)
    uri = URI("https://api.openweathermap.org/data/3.0/onecall?lat=#{latitude}&lon=#{longitude}&units=imperial&appid=#{api_key}")
    response = Net::HTTP.get(uri)
    JSON.parse(response)
  end
end