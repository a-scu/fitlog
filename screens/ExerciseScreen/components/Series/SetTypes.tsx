import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const SET_TYPES = [
  {
    id: "effective",
    label: "Efectiva",
    selectedColor: "bg-green-500",
  },
  {
    id: "warm_up",
    label: "Calentamiento",
    selectedColor: "bg-blue-500",
  },
  {
    id: "approximation",
    label: "Aproximación",
    selectedColor: "bg-yellow-500",
  },
  {
    id: "custom",
    label: "Custom",
    selectedColor: "bg-indigo-500",
  },
];

export default function SetTypes({
  set,
  updateSetField,
}: {
  set: any;
  updateSetField: (setId: string, field: string, value: any) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className=""
      contentContainerClassName="px-2 gap-1"
    >
      {SET_TYPES.map((setType) => {
        const isSelected = set.type === setType.id;

        if (setType.id === "custom")
          return (
            <TextInput
              key={set.id}
              placeholder="Tipo de set..."
              value={set.customTypeName || "Custom"}
              onChangeText={(text) =>
                updateSetField(set.id, "customTypeName", text)
              }
              onFocus={() => updateSetField(set.id, "type", "custom")}
              selectTextOnFocus
              style={{
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
              className={` ${isSelected ? setType.selectedColor : ""} ${isSelected ? "text-white" : "text-neutral-400"} px-2 py-0.5 text-xs h-4 rounded-full`}
            />
          );

        return (
          <TouchableOpacity
            key={setType.id}
            className={` ${isSelected ? setType.selectedColor : ""} px-2 h-4 items-center justify-center rounded-full`}
            onPress={() => {
              updateSetField(set.id, "type", setType.id);
            }}
          >
            <Text
              className={`text-xs ${isSelected ? "text-white" : "text-neutral-400"}`}
            >
              {setType.id === "custom" && isSelected && set.customTypeName
                ? set.customTypeName
                : setType.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// import { useModalStore } from "@/stores/useModalStore";
// import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
// import { useEffect, useState } from "react";
// import {
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export const SET_TYPES = [
//   {
//     id: "effective",
//     label: "Efectiva",
//     selectedColor: "bg-green-500",
//   },
//   {
//     id: "warm_up",
//     label: "Calentamiento",
//     selectedColor: "bg-blue-500",
//   },
//   {
//     id: "approximation",
//     label: "Aproximación",
//     selectedColor: "bg-yellow-500",
//   },
//   {
//     id: "custom",
//     label: "Custom",
//     selectedColor: "bg-indigo-500",
//   },
//   // {
//   //   id: "failure",
//   //   label: "Al Fallo",
//   //   color: "bg-red-500/50",
//   //   selectedColor: "bg-red-500",
//   // },
//   // {
//   //   id: "drop_set",
//   //   label: "Drop Set",
//   //   color: "bg-purple-500/50",
//   //   selectedColor: "bg-purple-500",
//   // },
//   // {
//   //   id: "rest_pause",
//   //   label: "Rest Pause",
//   //   color: "bg-pink-500/50",
//   //   selectedColor: "bg-pink-500",
//   // },
//   // {
//   //   id: "super_set",
//   //   label: "Super Set",
//   //   color: "bg-yellow-500/50",
//   //   selectedColor: "bg-yellow-500",
//   // },
//   // {
//   //   id: "partials",
//   //   label: "Parciales",
//   //   color: "bg-orange-500/50",
//   //   selectedColor: "bg-orange-500",
//   // },
// ];

// // export const SPECIAL_MODIFIERS = [
// //   "partials",
// //   "drop_set",
// //   "super_set",
// //   "rest_pause",
// // ];

// // const filteredSetModifiers = SET_MODIFIERS.filter((modifier) => {
// //   const isSelected = set.modifiers.includes(modifier.id);
// //   return isSelected || !SPECIAL_MODIFIERS.includes(modifier.id);
// // });

// export default function SetTypes({
//   set,
//   updateSetField,
// }: {
//   set: any;
//   updateSetField: (setId: string, field: string, value: any) => void;
// }) {
//   const showModal = useModalStore((state) => state.showModal);

//   const openCustomSetTypeModal = () => {
//     showModal({
//       content: <CustomSetTypeModal set={set} updateSetField={updateSetField} />,
//     });
//   };

//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       className=""
//       contentContainerClassName="px-2 gap-1"
//     >
//       {SET_TYPES.map((setType) => {
//         const isSelected = set.type === setType.id;

//         return (
//           <TouchableOpacity
//             key={setType.id}
//             className={` ${isSelected ? setType.selectedColor : ""} px-2 py-0.5 rounded-full`}
//             onPress={() => {
//               updateSetField(set.id, "type", setType.id);
//               if (setType.id === "custom") openCustomSetTypeModal();
//             }}
//           >
//             <Text
//               className={`text-xs ${isSelected ? "text-white" : "text-neutral-400"}`}
//             >
//               {setType.id === "custom" && isSelected && set.customTypeName
//                 ? set.customTypeName
//                 : setType.label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );
// }

// const CustomSetTypeModal = ({
//   set,
//   updateSetField,
// }: {
//   set: any;
//   updateSetField: (setId: string, field: string, value: any) => void;
// }) => {
//   const [customTypeName, setCustomTypeName] = useState(set.customTypeName);

//   return (
//     <View>
//       <Text className="mb-2 font-bold">Tipo de set</Text>
//       <BottomSheetTextInput
//         value={customTypeName}
//         placeholder="Tipo de set"
//         selectTextOnFocus
//         autoFocus
//         onChangeText={(text) => {
//           setCustomTypeName(text);
//           updateSetField(set.id, "customTypeName", text);
//         }}
//         className="border"
//       />
//     </View>
//   );
// };
