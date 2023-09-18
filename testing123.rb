require 'aws-sdk-secretsmanager'
require 'json'

begin
  client = Aws::SecretsManager::Client.new(region: 'us-east-2')
  puts "Successfully initialized AWS SDK client."

  secret = client.get_secret_value(secret_id: 'weather-api-keys')
  secret_data = JSON.parse(secret.secret_string)

  puts "Successfully fetched secret: #{secret_data}"
rescue Aws::SecretsManager::Errors::ServiceError => e
  puts "Error fetching secret: #{e.message}"
end