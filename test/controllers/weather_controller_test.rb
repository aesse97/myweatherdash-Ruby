require "test_helper"

class WeatherControllerTest < ActionDispatch::IntegrationTest
  test "should get dashboard" do
    get weather_dashboard_url
    assert_response :success
  end
end
