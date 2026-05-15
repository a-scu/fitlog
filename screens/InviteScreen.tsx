import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useUserStore } from "@/stores/UserStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { Workspace } from "@/types/Workspace";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

export default function InviteScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const user = useUserStore((s) => s.user);
  const acceptInvitation = useWorkspacesStore((s) => s.acceptInvitation);
  const setHasCompletedOnboarding = useGlobalSettingsStore((s) => s.setHasCompletedOnboarding);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  // The id can come from query params (e.g. fitlog://invite?id=XYZ)
  const invitationId = route.params?.id;

  useEffect(() => {
    if (!invitationId) {
      Alert.alert("Error", "Enlace de invitación inválido.");
      navigation.goBack();
      return;
    }

    const fetchInvitation = async () => {
      try {
        const docRef = doc(getFirestore(), "workspaces", invitationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists) {
          setWorkspace(docSnap.data() as Workspace);
        } else {
          Alert.alert("Error", "El workspace no existe o ha sido eliminado.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
        Alert.alert("Error", "No se pudo cargar la información de la invitación.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    if (!user) {
      // User is not logged in.
      Alert.alert("Iniciar Sesión", "Debes iniciar sesión para aceptar la invitación.");
      setHasCompletedOnboarding(false); // Force onboarding flow
      return;
    }

    try {
      setAccepting(true);
      await acceptInvitation(invitationId);
      Alert.alert("¡Éxito!", "Has aceptado la invitación al workspace.");
      navigation.navigate("(tabs)"); // Go back to main tabs
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo aceptar la invitación.");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = () => {
    Alert.alert("Rechazada", "Has rechazado la invitación.");
    navigation.goBack();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!workspace) {
    return null; // The useEffect will handle navigating back
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900 p-6 items-center justify-center">
      <View className="bg-white dark:bg-neutral-800 w-full rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700 items-center">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-6">
          Invitación a Entrenar
        </Text>
        
        <Text className="text-lg text-neutral-600 dark:text-neutral-300 text-center mb-8">
          <Text className="font-bold text-emerald-500">{workspace.coachName || "Un entrenador"}</Text> te está invitando a entrenar con él en su workspace.
        </Text>

        {!user && (
          <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl mb-8 w-full">
            <Text className="text-blue-800 dark:text-blue-300 text-center text-sm">
              Debes iniciar sesión o registrarte para poder aceptar esta invitación.
            </Text>
          </View>
        )}

        <View className="w-full space-y-4 gap-3">
          <TouchableOpacity
            onPress={handleAccept}
            disabled={accepting}
            className={`w-full py-4 rounded-2xl items-center justify-center ${accepting ? "bg-emerald-400" : "bg-emerald-500"}`}
          >
            {accepting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {user ? "Aceptar Invitación" : "Iniciar Sesión"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReject}
            disabled={accepting}
            className="w-full py-4 rounded-2xl items-center justify-center bg-neutral-100 dark:bg-neutral-700"
          >
            <Text className="text-neutral-700 dark:text-neutral-300 font-bold text-lg">
              Rechazar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
