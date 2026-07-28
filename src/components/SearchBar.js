import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";

export default function SearchBar({ value, onChangeText, placeholder = "Pesquise serviços ou empresas" }) {
  return (
    <View className="flex-row items-center bg-white/15 rounded-full px-4 py-3">
      <Search color="#fff" size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.7)"
        className="flex-1 text-white ml-2"
      />
    </View>
  );
}