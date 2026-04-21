module Api
  class PackingListsController < ApplicationController
    def create
      city_code = params.require(:city_code)
      nights    = params.require(:nights).to_i
      laundry   = ActiveModel::Type::Boolean.new.cast(params[:laundry])

      service       = WeatherService.new(city_code)
      weather_today = service.fetch_today
      forecasts     = service.fetch

      packing_list = PackingCalculator.new(
        nights:            nights,
        laundry:           laundry,
        weather_forecasts: forecasts
      ).calculate

      render json: { weather: weather_today, packing_list: packing_list }
    rescue ActionController::ParameterMissing => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue WeatherService::Error => e
      render json: { error: e.message }, status: :bad_gateway
    end
  end
end
