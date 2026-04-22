class PackingCalculator
  TRAVEL_TYPE_ITEMS = {
    "business" => [
      { name: "スーツ",    note: "ビジネス向け" },
      { name: "革靴",     note: "ビジネス向け" },
      { name: "ネクタイ",  note: "ビジネス向け" },
      { name: "ノートPC",  note: "ビジネス向け" },
      { name: "名刺入れ",  note: "ビジネス向け" }
    ],
    "leisure" => [
      { name: "カメラ",      note: "観光向け" },
      { name: "ガイドブック", note: "観光向け" },
      { name: "サングラス",   note: "観光向け" }
    ],
    "outdoor" => [
      { name: "登山靴",    note: "アウトドア向け" },
      { name: "レインウェア", note: "アウトドア向け" },
      { name: "水筒",      note: "アウトドア向け" },
      { name: "懐中電灯",  note: "アウトドア向け" },
      { name: "虫除けスプレー", note: "アウトドア向け" }
    ]
  }.freeze

  def initialize(nights:, laundry:, weather_forecasts: [], travel_type: nil, forecast_summary: nil)
    @nights          = nights
    @laundry         = laundry
    @forecasts       = weather_forecasts
    @travel_type     = travel_type
    @summary         = forecast_summary
  end

  def calculate
    result = {
      clothing:          clothing_items,
      outerwear:         outerwear_items,
      rain_gear:         rain_gear_items,
      medicine:          medicine_items,
      gadgets:           gadget_items,
      travel_type:       travel_type_items,
      temperature_range: temperature_range_items
    }
    result.reject { |_, v| v.empty? }
  end

  private

  def base_qty
    @laundry ? (@nights.fdiv(2).ceil + 1) : (@nights + 1)
  end

  def qty_note
    @laundry ? "宿泊数/2（切り上げ）+1枚" : "宿泊数+1枚"
  end

  def clothing_items
    qty = base_qty
    [
      { name: "下着",    quantity: qty, note: qty_note },
      { name: "靴下",    quantity: qty, note: qty_note },
      { name: "Tシャツ", quantity: qty, note: qty_note }
    ]
  end

  def outerwear_items
    @summary ? outerwear_from_summary : outerwear_from_forecasts
  end

  def outerwear_from_summary
    max_t = @summary[:temp_max]
    min_t = @summary[:temp_min]
    return [] if max_t.nil? && min_t.nil?

    items = []

    # 日中の気温（最高気温）でベースの服装を決定
    if max_t
      if max_t >= 25
        items << { name: "半袖シャツ", note: "最高気温#{max_t.to_i}℃向け" }
      elsif max_t >= 15
        items << { name: "長袖シャツ",    note: "最高気温#{max_t.to_i}℃向け" }
        items << { name: "薄手ジャケット", note: "羽織り用" }
      elsif max_t >= 5
        items << { name: "厚手のセーター", note: "最高気温#{max_t.to_i}℃向け" }
        items << { name: "コート",        note: "防寒用" }
      else
        items << { name: "ダウンジャケット", note: "最高気温#{max_t.to_i}℃向け" }
        items << { name: "マフラー",        note: "防寒用" }
        items << { name: "手袋",            note: "防寒用" }
      end
    end

    # 朝晩が冷える場合（最低気温 5℃以下）で、日中は温かい場合は防寒具を追加
    if @summary[:has_cold_day] && max_t && max_t >= 15
      items << { name: "ダウンジャケット", note: "朝晩の防寒用（最低気温#{min_t.to_i}℃）" }
      items << { name: "マフラー",        note: "防寒用" }
    end

    items
  end

  def outerwear_from_forecasts
    max_temp = @forecasts.map { |f| f[:temp_max] }.compact.max
    return [] if max_temp.nil?

    if max_temp >= 25
      [{ name: "半袖シャツ", note: "気温25℃以上向け" }]
    elsif max_temp >= 15
      [
        { name: "長袖シャツ",    note: "気温15〜24℃向け" },
        { name: "薄手ジャケット", note: "気温15〜24℃向け" }
      ]
    elsif max_temp >= 5
      [
        { name: "厚手のセーター", note: "気温5〜14℃向け" },
        { name: "コート",        note: "気温5〜14℃向け" }
      ]
    else
      [
        { name: "ダウンジャケット", note: "気温5℃未満向け" },
        { name: "マフラー",        note: "気温5℃未満向け" },
        { name: "手袋",            note: "気温5℃未満向け" }
      ]
    end
  end

  def rain_gear_items
    @summary ? rain_gear_from_summary : rain_gear_from_forecasts
  end

  def rain_gear_from_summary
    max_rain = @summary[:max_rain_probability]
    return [] if max_rain.nil? || !@summary[:has_rain]

    items = [{ name: "折りたたみ傘", note: "最大降水確率#{max_rain}%" }]
    if max_rain >= 50
      items << { name: "レインコート", note: "降水確率50%以上" }
      items << { name: "防水シューズ", note: "降水確率50%以上" }
    end
    items
  end

  def rain_gear_from_forecasts
    max_rain = @forecasts
      .flat_map { |f| f[:chance_of_rain]&.values || [] }
      .compact
      .max

    return [] if max_rain.nil? || max_rain < 30

    items = [{ name: "折りたたみ傘", note: "降水確率30%以上" }]
    if max_rain >= 50
      items << { name: "レインコート", note: "降水確率50%以上" }
      items << { name: "防水シューズ", note: "降水確率50%以上" }
    end
    items
  end

  def temperature_range_items
    return [] unless @summary

    max_t = @summary[:temp_max]
    min_t = @summary[:temp_min]
    return [] if max_t.nil? || min_t.nil?

    range = max_t - min_t
    return [] if range < 10

    items = [{ name: "薄手の羽織もの", note: "朝晩の冷え込み対策（気温差#{range.to_i}℃）" }]
    items << { name: "重ね着できる服", note: "気温差#{range.to_i}℃向けのレイヤリング推奨" } if range >= 15
    items
  end

  def medicine_items
    [{ name: "常備薬", quantity: @nights + 1, note: "宿泊数+1日分" }]
  end

  def gadget_items
    [
      { name: "スマホ充電器" },
      { name: "モバイルバッテリー" }
    ]
  end

  def travel_type_items
    TRAVEL_TYPE_ITEMS[@travel_type] || []
  end
end
