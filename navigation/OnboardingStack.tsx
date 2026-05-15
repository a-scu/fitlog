import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "@/screens/Onboarding/WelcomeScreen";
import ProfileSetupScreen from "@/screens/Onboarding/ProfileSetupScreen";
import TourScreen from "@/screens/Onboarding/TourScreen";
import InviteScreen from "@/screens/InviteScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="welcome" component={WelcomeScreen} />
      <Stack.Screen name="profileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="tour" component={TourScreen} />
      <Stack.Screen name="invite" component={InviteScreen} options={{ headerShown: true, title: "Invitación" }} />
    </Stack.Navigator>
  );
}
