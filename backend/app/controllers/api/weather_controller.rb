module Api
  class WeatherController < ApplicationController
    def index
      city_code = params.require(:city_code)
      summary   = WeatherService.new(city_code).fetch_today

      render json: summary
    rescue ActionController::ParameterMissing => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue WeatherService::Error => e
      render json: { error: e.message }, status: :bad_gateway
    end
  end
end
