import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler, View } from "react-native";

import { SCREEN_HEIGHT } from "@/constants/layout";

import { useModalStore } from "@/stores/ModalStore";
import { useTheme } from "@/stores/ThemeStore";

const Modal = () => {
  const { config, isOpen, hideModal } = useModalStore();
  const { isDark } = useTheme();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const currentIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      if (currentIndexRef.current !== -1) {
        bottomSheetModalRef.current?.dismiss();
      }
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

  const handleSheetChange = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      if (index === -1) {
        hideModal();
      }
    },
    [hideModal],
  );

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />,
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={config?.snapPoints || [SCREEN_HEIGHT - 100]}
      maxDynamicContentSize={SCREEN_HEIGHT - 100}
      onChange={handleSheetChange}
      onDismiss={hideModal}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: isDark ? "#171717" : "#ffffff",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#404040" : "#d4d4d4",
      }}
    >
      {config?.withBottomSheetView === false ? (
        <View className="flex-1 ">{config?.content}</View>
      ) : (
        <BottomSheetView className="flex-1 p-6">{config?.content}</BottomSheetView>
      )}
    </BottomSheetModal>
  );
};

export default Modal;
