import type { WeatherToday } from "@/types/packing";

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

type Props = {
  state:
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; data: WeatherToday }
    | { status: "error"; message: string };
};

export default function WeatherCard({ state }: Props) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-4 animate-pulse">
        <div className="h-4 w-32 bg-sky-200 rounded mb-3" />
        <div className="h-8 w-16 bg-sky-200 rounded mb-2" />
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
  const emoji    = weatherEmoji(data.weather);

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
        {data.temp_min !== null ? (
          <>
            <div className="text-gray-300 text-lg">/</div>
            <div className="text-center">
              <p className="text-xs text-gray-400">最低</p>
              <p className="text-xl font-bold text-blue-500">{data.temp_min}°</p>
            </div>
          </>
        ) : null}
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
