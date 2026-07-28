import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

const WEEKDAY_LABELS = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Calendar({ availableDaysOfWeek, selectedDate, onSelectDate }) {
  const [visibleMonth, setVisibleMonth] = useState(
    new Date((selectedDate || new Date()).getFullYear(), (selectedDate || new Date()).getMonth(), 1)
  );

  const today = startOfDay(new Date());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < leadingEmpty; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

  function goPrevMonth() {
    setVisibleMonth(new Date(year, month - 1, 1));
  }
  function goNextMonth() {
    setVisibleMonth(new Date(year, month + 1, 1));
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-neutral-950">
          {MONTH_LABELS[month]} {year}
        </Text>
        <View className="flex-row gap-2">
          <Pressable onPress={goPrevMonth} className="w-7 h-7 rounded-md border border-neutral-300 items-center justify-center">
            <ChevronLeft size={16} color="#525252" />
          </Pressable>
          <Pressable onPress={goNextMonth} className="w-7 h-7 rounded-md border border-neutral-300 items-center justify-center">
            <ChevronRight size={16} color="#525252" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={{ width: `${100 / 7}%` }} className="items-center mb-2">
            <Text className="text-xs text-neutral-400">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={{ width: `${100 / 7}%` }} className="items-center mb-3" />;
          }

          const dayOfWeek = date.getDay();
          const isPast = date < today;
          const isOpenDay = availableDaysOfWeek.has(dayOfWeek);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isBookable = !isPast && isOpenDay;

          return (
            <View key={date.toISOString()} style={{ width: `${100 / 7}%` }} className="items-center mb-3">
              <Pressable
                onPress={() => isBookable && onSelectDate(date)}
                disabled={!isBookable}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isSelected ? "bg-white border-2 border-[#9f7300]" : "bg-neutral-200"
                }`}
              >
                <Text className={`text-sm ${isSelected ? "font-bold text-[#9f7300]" : "text-neutral-500"}`}>
                  {date.getDate()}
                </Text>
              </Pressable>
              {isBookable && !isSelected && (
                <View className="w-4 h-[2px] bg-[#d4af37] rounded-full mt-1" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}