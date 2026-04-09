import { ROMS } from "@/constants/Roms";
import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import Slider from "rn-range-slider";

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

export default function PartialRepsModal({ set, updatePartialRepsField }: any) {
  const [localPartialReps, setLocalPartialReps] = useState(
    set.partialReps || {
      count: "",
      min: undefined,
      max: undefined,
      rom: "",
      customRom: "",
    },
  );

  const hasMinMax =
    set.partialReps?.min !== undefined && set.partialReps?.max !== undefined;
  const initialIsRange = hasMinMax;

  let initialLow = 0;
  let initialHigh = 10;

  if (hasMinMax) {
    initialLow = parseInt(set.partialReps.min) || 0;
    initialHigh = parseInt(set.partialReps.max) || 10;
  } else {
    initialLow = parseInt(set.partialReps?.count) || 0;
  }

  const [isRange, setIsRange] = useState(initialIsRange);
  const [low, setLow] = useState(initialLow);
  const [high, setHigh] = useState(initialHigh);

  const handleFieldUpdate = (field: string, value: any) => {
    setLocalPartialReps((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    updatePartialRepsField(set.id, field, value);
  };

  const handleToggleRange = useCallback(() => {
    const newIsRange = !isRange;
    setIsRange(newIsRange);

    if (newIsRange) {
      setLocalPartialReps((prev: any) => {
        const next = { ...prev, min: low, max: high };
        delete next.count;
        return next;
      });
      updatePartialRepsField(set.id, "count", undefined);
      updatePartialRepsField(set.id, "min", low);
      updatePartialRepsField(set.id, "max", high);
    } else {
      setLocalPartialReps((prev: any) => {
        const next = { ...prev, count: low.toString() };
        delete next.min;
        delete next.max;
        return next;
      });
      updatePartialRepsField(set.id, "min", undefined);
      updatePartialRepsField(set.id, "max", undefined);
      updatePartialRepsField(set.id, "count", low.toString());
    }
  }, [isRange, low, high, set.id, updatePartialRepsField]);

  const handleValueChange = useCallback(
    (newLow: number, newHigh: number) => {
      setLow(newLow);
      setHigh(newHigh);

      if (isRange) {
        setLocalPartialReps((prev: any) => ({
          ...prev,
          min: newLow,
          max: newHigh,
        }));
        updatePartialRepsField(set.id, "min", newLow);
        updatePartialRepsField(set.id, "max", newHigh);
      } else {
        setLocalPartialReps((prev: any) => ({
          ...prev,
          count: newLow.toString(),
        }));
        updatePartialRepsField(set.id, "count", newLow.toString());
      }
    },
    [isRange, set.id, updatePartialRepsField],
  );

  const Thumb = useCallback(
    () => <View className="w-4 h-4 bg-red-500 rounded-full" />,
    [],
  );
  const Rail = useCallback(
    () => <View className="h-1 bg-neutral-100 rounded-full flex-1" />,
    [],
  );
  const RailSelected = useCallback(
    () => <View className="h-1 bg-red-500 rounded-full" />,
    [],
  );
  const Label = useCallback(
    (value: any) => (
      <View className="bg-neutral-800 p-1 rounded">
        <Text className="text-xs font-bold text-white uppercase">
          {value == 10 ? "Fallo" : value}
        </Text>
      </View>
    ),
    [],
  );
  const renderNotch = useCallback(
    () => <View className="w-1 h-1 bg-red-500 rounded-full" />,
    [],
  );

  return (
    <View>
      <Text className="mb-2 font-bold uppercase">Parciales</Text>

      <View className="flex-row gap-4 items-start mb-6">
        <View className="flex-[1.5]">
          <View className="flex-row items-center justify-between mb-1.5 px-1">
            <Text className="text-xs font-bold text-neutral-400 uppercase">
              Repeticiones
            </Text>
            <TouchableOpacity onPress={handleToggleRange}>
              <Text className="text-[10px] font-bold text-red-500 uppercase">
                {isRange ? "Usar Exactas" : "Usar Rango"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="border rounded-xl border-neutral-100 bg-neutral-50 px-4 py-3 justify-center min-h-[90px]">
            <Text className="text-center text-lg font-semibold text-neutral-800 mb-2">
              {isRange
                ? `${low} - ${high == 10 ? "Fallo" : high + " reps"}`
                : `${low == 10 ? "Fallo" : low + " reps"}`}
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
          <Text className="text-xs font-bold text-neutral-400 uppercase mb-1.5 ml-1">
            Rango de Mov.
          </Text>
          <View className="gap-1.5">
            <View className="flex-row gap-1.5">
              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.UPPER)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${localPartialReps.rom === ROMS.UPPER ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"}`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${localPartialReps.rom === ROMS.UPPER ? "text-white" : "text-neutral-500"}`}
                >
                  Superior
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.MIDDLE)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${localPartialReps.rom === ROMS.MIDDLE ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"}`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${localPartialReps.rom === ROMS.MIDDLE ? "text-white" : "text-neutral-500"}`}
                >
                  Medio
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-1.5">
              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.LOWER)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${localPartialReps.rom === ROMS.LOWER ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"}`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${localPartialReps.rom === ROMS.LOWER ? "text-white" : "text-neutral-500"}`}
                >
                  Inferior
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFieldUpdate("rom", ROMS.CUSTOM)}
                className={`flex-1 h-[42px] items-center justify-center rounded-lg border ${localPartialReps.rom === ROMS.CUSTOM ? "bg-red-500 border-red-500" : "bg-white border-neutral-100"}`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${localPartialReps.rom === ROMS.CUSTOM ? "text-white" : "text-neutral-500"}`}
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
          <Text className="text-xs font-bold text-neutral-400 uppercase mb-1.5 ml-1">
            ROM Personalizado
          </Text>
          <BottomSheetTextInput
            value={localPartialReps.customRom}
            onChangeText={(text: string) =>
              handleFieldUpdate("customRom", text)
            }
            className="border h-12 px-4 rounded-xl border-neutral-100 bg-neutral-50"
            placeholder="Ej: 3/4 superior"
          />
        </View>
      )}
    </View>
  );
}
