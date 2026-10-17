import "../../global.css"
import { Text, View } from "react-native";
import {Link} from "expo-router";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
        <Link className = "p-3 mt-4 rounded bg-primary text-white" href ="/onboarding" > go to onboarding </Link>
        <Link className = "p-3 mt-4 rounded bg-primary text-white" href ="/(auth)/sign-in" > sign-in </Link>
        <Link className =   "p-3 mt-4 rounded bg-primary text-white" href ="/(auth)/sign-up" > sign-up </Link>
        <Link  href ="/subscriptions/spotify" > spotyif subscriptions </Link>
        <Link  
           href ={{ 
            pathname:"/subscriptions/[id]",
            params:{id:"claude"},
          }}
         > claude max subscription </Link>
    </SafeAreaView>
  );
}