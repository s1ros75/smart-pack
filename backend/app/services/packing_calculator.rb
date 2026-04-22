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

  def initialize(nights:, laundry:, weather_forecasts:, travel_type: nil)
    @nights       = nights
    @laundry      = laundry
    @forecasts    = weather_forecasts
    @travel_type  = travel_type
  end

  def calculate
    {
      clothing:    clothing_items,
      outerwear:   outerwear_items,
      rain_gear:   rain_gear_items,
      medicine:    medicine_items,
      gadgets:     gadget_items,
      travel_type: travel_type_items
    }
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
