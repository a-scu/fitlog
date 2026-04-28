import { ROMS } from "@/constants/Roms";
import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import Slider from "rn-range-slider";

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { PartialReps } from "@/types/Workout";

// Updates partial repsfor set or drop set

export default function PartialRepsModal({ set, updatePartialRepsField }: any) {
  const initial: PartialReps = set.partialReps ?? {
    isRange: false,
    value: "",
    min: "",
    max: "",
    rom: "",
    customRom: "",
  };

  const [localPartialReps, setLocalPartialReps] = useState<PartialReps>(initial);

  const isRange = localPartialReps.isRange;

  const [low, setLow] = useState(() => {
    if (initial.isRange) return parseInt(initial.min) || 1;
    return parseInt(initial.value) || 1;
  });
  const [high, setHigh] = useState(() => {
    if (initial.isRange) return parseInt(initial.max) || 10;
    return 10;
  });

  const handleFieldUpdate = (field: keyof PartialReps, value: any) => {
    setLocalPartialReps((prev) => ({ ...prev, [field]: value }));
    updatePartialRepsField(set.id, field, value);
  };

  const handleToggleRange = useCallback(() => {
    const isRangeUpdated = !isRange;
    handleFieldUpdate("isRange", isRangeUpdated);

    if (isRangeUpdated) {
      handleFieldUpdate("min", String(low));
      handleFieldUpdate("max", String(high));
      handleFieldUpdate("value", "");
    } else {
      handleFieldUpdate("value", String(low));
      handleFieldUpdate("min", "");
      handleFieldUpdate("max", "");
    }
  }, [isRange, low, high]);

  const handleValueChange = useCallback(
    (newLow: number, newHigh: number) => {
      setLow(newLow);
      setHigh(newHigh);

      if (isRange) {
        handleFieldUpdate("min", String(newLow));
        handleFieldUpdate("max", String(newHigh));
      } else {
        handleFieldUpdate("value", String(newLow));
      }
    },
    [isRange],
  );

  const Thumb = useCallback(() => <View className="w-4 h-4 bg-red-500 rounded-full" />, []);
  const Rail = useCallback(() => <View className="h-1 bg-neutral-100 rounded-full flex-1" />, []);
  const RailSelected = useCallback(() => <View className="h-1 bg-red-500 rounded-full" />, []);
  const Label = useCallback(
    (value: any) => (
      <View className="bg-neutral-800 p-1 rounded">
        <Text className="text-xs font-bold text-white uppercase">{value == 10 ? "Fallo" : value}</Text>
      </View>
    ),
    [],
  );
  const renderNotch = useCallback(() => <View className="w-1 h-1 bg-red-500 rounded-full" />, []);

  return (
    <View>
      <Text className="mb-2 font-bold uppercase">Parciales</Text>

      <View className="flex-row gap-4 items-start mb-6">
        <View className="flex-[1.5]">
          <View className="flex-row items-center justify-between mb-1.5 px-1">
            <Text className="text-xs font-bold text-neutral-400 uppercase">Repeticiones</Text>

            <TouchableOpacity onPress={handleToggleRange}>
              <Text className="text-[10px] font-bold text-red-500 uppercase">
                {isRange ? "Usar Exactas" : "Usar Rango"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="border rounded-xl border-neutral-100 bg-neutral-50 px-4 py-3 justify-center min-h-[90px]">
            <Text className="text-center text-lg font-semibold text-neutral-800 mb-2">
              {isRange
                ? `${low} - ${high === 10 ? "Fallo" : high + " reps"}`
                : `${low === 10 ? "Fallo" : low + " reps"}`}
            </Text>

            <Slider
              min={1}
              max={10}
              step={1}
              low={low}
              high={high}
              disableRange={!isRange}
              floatingLabel
              renderThumb={Thumb}
              renderRail={Rail}
              renderRailSelected={RailSelected}
              renderLabel={Label}
              renderNotch={renderNotch}
              onValueChanged={handleValueChange}
            />
          </View>
        </View>

        {/* ROMS */}
        <View className="flex-1">
          <Text className="text-xs font-bold text-neutral-400 uppercase mb-1.5 ml-1">Rango de Mov.</Text>

          <View className="gap-1.5">
            <View className="flex-row gap-1.5">
              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.UPPER)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${
                  localPartialReps.rom === ROMS.UPPER ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${
                    localPartialReps.rom === ROMS.UPPER ? "text-white" : "text-neutral-500"
                  }`}
                >
                  Superior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.MIDDLE)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${
                  localPartialReps.rom === ROMS.MIDDLE ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${
                    localPartialReps.rom === ROMS.MIDDLE ? "text-white" : "text-neutral-500"
                  }`}
                >
                  Medio
                </Text>
              </TouchableOpacity>
            </View>

            {/*  */}

            <View className="flex-row gap-1.5">
              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.LOWER)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${
                  localPartialReps.rom === ROMS.LOWER ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${
                    localPartialReps.rom === ROMS.LOWER ? "text-white" : "text-neutral-500"
                  }`}
                >
                  Inferior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.CUSTOM)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${
                  localPartialReps.rom === ROMS.CUSTOM ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${
                    localPartialReps.rom === ROMS.CUSTOM ? "text-white" : "text-neutral-500"
                  }`}
                >
                  Personalizado
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ROM Custom */}
      {localPartialReps.rom === ROMS.CUSTOM && (
        <View className="mt-2">
          <Text className="text-xs font-bold text-neutral-400 uppercase mb-1.5 ml-1">ROM Personalizado</Text>
          <BottomSheetTextInput
            value={localPartialReps.customRom}
            onChangeText={(text: string) => handleFieldUpdate("customRom", text)}
            className="border h-12 px-4 rounded-xl border-neutral-100 bg-neutral-50"
            placeholder="Ej: 3/4 superior"
          />
        </View>
      )}
    </View>
  );
}
