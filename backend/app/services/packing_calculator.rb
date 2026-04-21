class PackingCalculator
  ESSENTIALS = [
    { name: "充電器",         category: "電子機器", qty: 1 },
    { name: "モバイルバッテリー", category: "電子機器", qty: 1 },
    { name: "常備薬",         category: "衛生用品", qty: 1 },
    { name: "歯ブラシ・歯磨き粉", category: "衛生用品", qty: 1 },
    { name: "財布・カード類",  category: "貴重品",   qty: 1 },
  ].freeze

  COLD_THRESHOLD = 10.0
  HOT_THRESHOLD  = 25.0

  def initialize(nights:, laundry:, weather:)
    @nights  = nights
    @laundry = laundry
    @weather = weather
  end

  def calculate
    [
      *underwear_items,
      *clothing_items,
      *weather_items,
      *ESSENTIALS
    ]
  end

  private

  # 宿泊数ベースで下着枚数を算出。洗濯ありなら半分（切り上げ）＋1枚バッファ
  def underwear_items
    qty = @laundry ? (@nights.fdiv(2).ceil + 1) : (@nights + 1)
    [
      { name: "下着",   category: "衣類", qty: qty },
      { name: "靴下",   category: "衣類", qty: qty },
    ]
  end

  def clothing_items
    shirt_qty = @laundry ? (@nights.fdiv(2).ceil + 1) : (@nights + 1)
    [{ name: "シャツ・トップス", category: "衣類", qty: shirt_qty }]
  end

  def weather_items
    return [] if @weather.empty?

    items     = []
    min_temps = @weather.map { |d| d[:temp_min] }.compact
    max_temps = @weather.map { |d| d[:temp_max] }.compact
    has_rain  = @weather.any? do |d|
      d[:telop]&.include?("雨") ||
        d[:chance_of_rain]&.values&.compact&.any? { |v| v >= 50 }
    end

    items << { name: "厚手のジャケット・コート", category: "衣類",  qty: 1 } if min_temps.any? && min_temps.min < COLD_THRESHOLD
    items << { name: "サングラス・日焼け止め",   category: "その他", qty: 1 } if max_temps.any? && max_temps.max >= HOT_THRESHOLD
    items << { name: "折り畳み傘",             category: "その他", qty: 1 } if has_rain

    items
  end
end
