module Api
  class WeatherController < ApplicationController
    def index
      city_code  = params.require(:city_code)
      start_date = params[:start_date].presence
      end_date   = params[:end_date].presence

      service = WeatherService.new(city_code)

      if start_date && end_date
        result = service.get_forecast_for_period(Date.parse(start_date), Date.parse(end_date))
        render json: result
      else
        render json: service.fetch_today
      end
    rescue ActionController::ParameterMissing => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue ArgumentError
      render json: { error: "日付の形式が不正です" }, status: :unprocessable_entity
    rescue WeatherService::Error => e
      render json: { error: e.message }, status: :bad_gateway
    end
  end
end
