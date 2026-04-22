class WeatherService
  Error = Class.new(StandardError)

  BASE_URL = "https://weather.tsukumijima.net/api/forecast/city"

  def initialize(city_code)
    @city_code = city_code
  end

  # 持ち物リスト用: 3日分の全フィールドを返す
  def fetch
    raw["forecasts"].map do |f|
      {
        date:           f["date"],
        date_label:     f["dateLabel"],
        telop:          f["telop"],
        temp_min:       f.dig("temperature", "min", "celsius")&.to_f,
        temp_max:       f.dig("temperature", "max", "celsius")&.to_f,
        chance_of_rain: parse_chance_of_rain(f["chanceOfRain"])
      }
    end
  end

  # 天気ウィジェット用: 今日の簡易サマリーを返す
  # 当日の最低気温は API 仕様上 null になるため、翌日の値でフォールバックする
  def fetch_today
    data      = raw
    forecasts = data["forecasts"]
    today     = forecasts[0]
    tomorrow  = forecasts[1]
    cor       = parse_chance_of_rain(today["chanceOfRain"])

    temp_min = today.dig("temperature", "min", "celsius")&.to_f
    temp_min ||= tomorrow&.dig("temperature", "min", "celsius")&.to_f

    {
      city_name:        data.dig("location", "city"),
      date:             today["date"],
      weather:          today["telop"],
      temp_max:         today.dig("temperature", "max", "celsius")&.to_f,
      temp_min:         temp_min,
      rain_probability: cor.values.compact.max
    }
  end

  # 旅行期間の天気予報を取得・集計する
  # 天気APIは最大3日分（今日・明日・明後日）しか取得できない
  def get_forecast_for_period(start_date, end_date)
    data          = raw
    city_name     = data.dig("location", "city")
    api_forecasts = data["forecasts"]

    by_date        = api_forecasts.each_with_object({}) { |f, h| h[f["date"]] = f }
    first_available = api_forecasts.first&.dig("date")

    period_dates = (start_date..end_date).map(&:to_s)

    daily = period_dates.map do |d|
      f = by_date[d]
      if f
        cor = parse_chance_of_rain(f["chanceOfRain"])
        {
          date:             d,
          weather:          f["telop"],
          temp_max:         f.dig("temperature", "max", "celsius")&.to_f,
          temp_min:         f.dig("temperature", "min", "celsius")&.to_f,
          rain_probability: cor.values.compact.max,
          status:           "available"
        }
      else
        is_past = first_available.present? && d < first_available
        { date: d, weather: nil, temp_max: nil, temp_min: nil, rain_probability: nil,
          status: is_past ? "past" : "out_of_range" }
      end
    end

    available  = daily.select { |d| d[:status] == "available" }
    temp_maxes = available.map { |d| d[:temp_max] }.compact
    temp_mins  = available.map { |d| d[:temp_min] }.compact
    rain_probs = available.map { |d| d[:rain_probability] }.compact

    max_temp = temp_maxes.max
    min_temp = temp_mins.min
    max_rain = rain_probs.any? ? rain_probs.max : 0
    avg_rain = rain_probs.any? ? (rain_probs.sum.to_f / rain_probs.size).round : nil

    summary = {
      temp_max:             max_temp,
      temp_min:             min_temp,
      max_rain_probability: rain_probs.any? ? max_rain : nil,
      avg_rain_probability: avg_rain,
      has_rain:             max_rain >= 30,
      has_cold_day:         min_temp ? min_temp <= 5  : false,
      has_hot_day:          max_temp ? max_temp >= 25 : false
    }

    {
      city_name:        city_name,
      forecast_limited: daily.any? { |d| d[:status] == "out_of_range" },
      period: {
        start_date: start_date.to_s,
        end_date:   end_date.to_s,
        days:       period_dates.size
      },
      daily_forecasts: daily,
      summary:         summary
    }
  end

  private

  def raw
    @raw ||= begin
      response = HTTParty.get("#{BASE_URL}/#{@city_code}")
      raise Error, "都市が見つかりません: #{@city_code}" if response.code == 404
      raise Error, "天気API エラー: #{response.code}" unless response.success?

      response.parsed_response
    end
  end

  def parse_chance_of_rain(cor)
    return {} if cor.nil?

    cor.transform_values { |v| v == "--" ? nil : v.to_s.delete("%").to_i }
  end
end
