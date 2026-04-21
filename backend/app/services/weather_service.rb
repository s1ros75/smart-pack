class WeatherService
  Error = Class.new(StandardError)

  BASE_URL = "https://weather.tsukumijima.net/api/forecast/city"

  def initialize(city_code)
    @city_code = city_code
  end

  def fetch
    response = HTTParty.get("#{BASE_URL}/#{@city_code}")

    raise Error, "都市が見つかりません: #{@city_code}" if response.code == 404
    raise Error, "天気API エラー: #{response.code}" unless response.success?

    parse(response.parsed_response)
  end

  private

  def parse(data)
    data["forecasts"].map do |f|
      {
        date:              f["date"],
        date_label:        f["dateLabel"],
        telop:             f["telop"],
        temp_min:          f.dig("temperature", "min", "celsius")&.to_f,
        temp_max:          f.dig("temperature", "max", "celsius")&.to_f,
        chance_of_rain:    parse_chance_of_rain(f["chanceOfRain"])
      }
    end
  end

  def parse_chance_of_rain(cor)
    return {} if cor.nil?

    cor.transform_values { |v| v == "--" ? nil : v.to_s.delete("%").to_i }
  end
end
