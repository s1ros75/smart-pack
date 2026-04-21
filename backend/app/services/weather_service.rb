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
