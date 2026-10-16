import "../../../global.css"
import { Text, View } from "react-native";
import {Link} from "expo-router"
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
        <Link className = "p-3 mt-4 rounded bg-primary text-white" href ="/onboarding" > go to onboarding </Link>
        <Link className = "p-3 mt-4 rounded bg-primary text-white" href ="/(auth)/sign-in" > sign-in </Link>
        <Link className = "p-3 mt-4 rounded bg-primary text-white" href ="/(auth)/sign-up" > sign-up </Link>
        <Link  href ="/subscriptions/spotify" > spotyif subscriptions </Link>
        <Link  
           href ={{ 
            pathname:"/subscriptions/[id]",
            params:{id:"claude"},
          }}
         > claude max subscription </Link>
    </View>
  );
}