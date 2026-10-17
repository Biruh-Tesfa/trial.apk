import { Text, View } from "react-native";

 const Onboarding = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#2563eb",
          fontSize: 28,
          fontWeight: "bold",
        }}
      >
        Onboarding is visible
      </Text>
    </View>
  );
}
export default Onboarding