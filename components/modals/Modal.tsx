import React, { useCallback, useEffect, useRef } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, View, BackHandler } from "react-native";
import { useModalStore } from "@/store/useModalStore";

const Modal = () => {
  const { config, isOpen, hideModal } = useModalStore();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpen]);

  useEffect(() => {
    const backAction = () => {
      if (isOpen) {
        hideModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [isOpen, hideModal]);

  const renderBackdrop = useCallback((props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />, []);

  return (
    <BottomSheetModal ref={bottomSheetModalRef} index={0} snapPoints={config?.snapPoints || ["40%"]} onDismiss={hideModal} backdropComponent={renderBackdrop} enablePanDownToClose>
      <BottomSheetView className="flex-1 p-6">
        {config?.title && <Text className="text-xl font-bold text-neutral-800 mb-6 text-center">{config.title}</Text>}
        {config?.content}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default Modal;
