import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useModalStore } from "@/stores/useModalStore";

interface ConfirmationModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
}

export const ConfirmationModal = ({
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
}: ConfirmationModalProps) => {
  const hideModal = useModalStore((s) => s.hideModal);

  const handleConfirm = () => {
    onConfirm();
    hideModal();
  };

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-xl font-bold text-neutral-900">{title}</Text>
        <Text className="text-base text-neutral-600 leading-6">{description}</Text>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity onPress={hideModal} className="flex-1 p-4 rounded-2xl bg-neutral-100 items-center">
          <Text className="text-neutral-900 font-semibold">{cancelText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          className={`flex-1 p-4 rounded-2xl items-center ${type === "danger" ? "bg-red-500" : "bg-black"}`}
        >
          <Text className="text-white font-semibold">{confirmText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
