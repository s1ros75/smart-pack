import type { WeatherToday, PeriodForecast, DailyForecast } from "@/types/packing";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function weatherEmoji(telop: string): string {
  if (telop.includes("雪")) return "❄️";
  if (telop.includes("雨") && telop.includes("晴")) return "🌦️";
  if (telop.includes("雨") && telop.includes("曇")) return "🌧️";
  if (telop.includes("雨")) return "☔";
  if (telop.includes("曇") && telop.includes("晴")) return "⛅";
  if (telop.includes("曇")) return "☁️";
  if (telop.includes("晴")) return "☀️";
  return "🌡️";
}

function fmtShortDate(dateStr: string): { label: string; weekday: string; dayNum: number } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    label:   `${d.getMonth() + 1}/${d.getDate()}`,
    weekday: WEEKDAYS[d.getDay()],
    dayNum:  d.getDay(),
  };
}

function weekdayClass(dayNum: number): string {
  if (dayNum === 0) return "text-red-500";
  if (dayNum === 6) return "text-blue-500";
  return "text-gray-500";
}

function dayCardBg(day: DailyForecast): string {
  if (day.status !== "available" || !day.weather) return "bg-gray-50 border-gray-200";
  if (day.weather.includes("雨")) return "bg-sky-50 border-sky-200";
  if (day.weather.includes("晴")) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-100";
}

function isPeriod(data: WeatherToday | PeriodForecast): data is PeriodForecast {
  return "daily_forecasts" in data;
}

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: WeatherToday | PeriodForecast }
  | { status: "error"; message: string };

type Props = { state: WeatherState };

export default function WeatherCard({ state }: Props) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-4 animate-pulse space-y-3">
        <div className="h-4 w-32 bg-sky-200 rounded" />
        <div className="h-8 w-16 bg-sky-200 rounded" />
        <div className="h-3 w-48 bg-sky-200 rounded" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        天気情報を取得できませんでした: {state.message}
      </div>
    );
  }

  const { data } = state;

  // --- 期間予報 ---
  if (isPeriod(data)) {
    const { summary, period, daily_forecasts, forecast_limited, city_name } = data;
    const start = fmtShortDate(period.start_date);
    const end   = fmtShortDate(period.end_date);

    return (
      <div className="space-y-2">
        {/* サマリーカード */}
        <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 px-4 py-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-lg font-bold text-sky-800">{city_name}</p>
              <p className="text-xs text-sky-500 mt-0.5">
                <span className={weekdayClass(start.dayNum)}>{start.label}({start.weekday})</span>
                <span className="text-gray-300 mx-1">–</span>
                <span className={weekdayClass(end.dayNum)}>{end.label}({end.weekday})</span>
                <span className="text-gray-400 ml-1">{period.days}日間</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">
                <span className="text-red-500">{summary.temp_max !== null ? `${summary.temp_max}°` : "－"}</span>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-blue-500">{summary.temp_min !== null ? `${summary.temp_min}°` : "－"}</span>
              </p>
              {summary.max_rain_probability !== null && (
                <p className="text-xs text-gray-500">最大降水 {summary.max_rain_probability}%</p>
              )}
            </div>
          </div>

          {/* バッジ */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {summary.has_rain && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">☔ 雨の日あり</span>
            )}
            {summary.has_hot_day && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">🌡️ 暑い日あり</span>
            )}
            {summary.has_cold_day && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">🧊 寒い日あり</span>
            )}
            {summary.temp_max !== null && summary.temp_min !== null && (summary.temp_max - summary.temp_min) >= 15 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">↕️ 寒暖差大</span>
            )}
            {forecast_limited && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">⚠️ 一部予報範囲外</span>
            )}
          </div>
        </div>

        {/* 日別カード (横スクロール) */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {daily_forecasts.map(day => {
            const fmt = fmtShortDate(day.date);
            return (
              <div
                key={day.date}
                className={`flex-shrink-0 w-[4.5rem] rounded-xl border px-1.5 py-2 text-center ${dayCardBg(day)}`}
              >
                <p className={`text-xs font-semibold leading-none ${weekdayClass(fmt.dayNum)}`}>
                  {fmt.label}
                </p>
                <p className={`text-xs leading-none ${weekdayClass(fmt.dayNum)}`}>({fmt.weekday})</p>

                {day.status === "available" ? (
                  <>
                    <p className="text-xl leading-tight mt-1">{weatherEmoji(day.weather ?? "")}</p>
                    <p className="text-[10px] leading-tight mt-0.5">
                      <span className="text-red-500 font-medium">{day.temp_max !== null ? `${day.temp_max}°` : "－"}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-500 font-medium">{day.temp_min !== null ? `${day.temp_min}°` : "－"}</span>
                    </p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${(day.rain_probability ?? 0) >= 50 ? "text-sky-600" : "text-gray-400"}`}>
                      {day.rain_probability !== null ? `${day.rain_probability}%` : "－"}
                    </p>
                  </>
                ) : (
                  <div className="mt-1">
                    <p className="text-lg leading-none">？</p>
                    <p className="text-[9px] text-gray-400 leading-tight mt-1">
                      {day.status === "past" ? "過去" : "予報\n範囲外"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- 1日分の天気（従来） ---
  const emoji = weatherEmoji(data.weather);

  return (
    <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 px-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-sky-500 font-medium mb-0.5">{data.date} の天気</p>
          <p className="text-lg font-bold text-sky-800">{data.city_name}</p>
        </div>
        <span className="text-4xl leading-none">{emoji}</span>
      </div>

      <p className="mt-2 text-sky-700 font-semibold">{data.weather}</p>

      <div className="mt-3 flex items-center gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">最高</p>
          <p className="text-xl font-bold text-red-500">
            {data.temp_max !== null ? `${data.temp_max}°` : "－"}
          </p>
        </div>
        {data.temp_min !== null && (
          <>
            <div className="text-gray-300 text-lg">/</div>
            <div className="text-center">
              <p className="text-xs text-gray-400">最低</p>
              <p className="text-xl font-bold text-blue-500">{data.temp_min}°</p>
            </div>
          </>
        )}
        <div className="ml-auto text-center">
          <p className="text-xs text-gray-400">降水確率</p>
          <p className={`text-xl font-bold ${(data.rain_probability ?? 0) >= 50 ? "text-blue-600" : "text-gray-500"}`}>
            {data.rain_probability !== null ? `${data.rain_probability}%` : "－"}
          </p>
        </div>
      </div>
    </div>
  );
}
