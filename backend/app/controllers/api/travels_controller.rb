module Api
  class TravelsController < ApplicationController
    def index
      travels = Travel.includes(:packing_items).order(created_at: :desc)
      render json: travels.map { |t| travel_json(t) }
    end

    def show
      render json: travel_json(find_travel)
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Travel not found" }, status: :not_found
    end

    def create
      city_code   = params.require(:city_code)
      laundry     = ActiveModel::Type::Boolean.new.cast(params[:laundry])
      travel_type = params[:travel_type].presence || "leisure"
      start_date  = params[:start_date].presence
      end_date    = params[:end_date].presence

      service       = WeatherService.new(city_code)
      weather_today = service.fetch_today

      forecasts        = []
      forecast_summary = nil
      nights           = params[:nights].present? ? params[:nights].to_i : 1

      if start_date && end_date
        period_data      = service.get_forecast_for_period(Date.parse(start_date), Date.parse(end_date))
        forecast_summary = period_data[:summary]
        nights           = (Date.parse(end_date) - Date.parse(start_date)).to_i
      else
        forecasts = service.fetch
      end

      travel = Travel.create!(
        destination: weather_today[:city_name],
        city_code:   city_code,
        nights:      nights,
        laundry:     laundry,
        travel_type: travel_type,
        start_date:  start_date,
        end_date:    end_date
      )

      PackingCalculator.new(
        nights:            nights,
        laundry:           laundry,
        weather_forecasts: forecasts,
        travel_type:       travel_type,
        forecast_summary:  forecast_summary
      ).calculate.each do |category, items|
        items.each do |item|
          travel.packing_items.create!(
            category: category.to_s,
            name:     item[:name],
            quantity: item[:quantity],
            note:     item[:note]
          )
        end
      end

      render json: travel_json(travel.reload), status: :created
    rescue ActionController::ParameterMissing => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue WeatherService::Error => e
      render json: { error: e.message }, status: :bad_gateway
    end

    def update
      travel = find_travel
      travel.update!(travel_params)
      render json: travel
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Travel not found" }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def duplicate
      original = Travel.includes(:packing_items).find(params[:id])
      copy = original.dup
      copy.save!
      original.packing_items.each do |item|
        copy.packing_items.create!(
          category: item.category,
          name:     item.name,
          quantity: item.quantity,
          note:     item.note,
          checked:  false
        )
      end
      render json: travel_json(copy.reload), status: :created
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Travel not found" }, status: :not_found
    end

    def destroy
      find_travel.destroy!
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Travel not found" }, status: :not_found
    end

    private

    def find_travel
      Travel.includes(:packing_items).find(params[:id])
    end

    def travel_params
      params.permit(:destination, :nights, :laundry, :travel_type, :start_date, :end_date)
    end

    def travel_json(travel)
      days_until_trip = travel.start_date ? (travel.start_date - Date.today).to_i : nil
      travel.as_json.merge(
        packing_items:   travel.packing_items.order(:category, :id),
        days_until_trip: days_until_trip
      )
    end
  end
end
