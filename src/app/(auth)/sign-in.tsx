import React from 'react'
import { View, Text } from 'react-native'
import {Link} from "expo-router"

const signin = () => {
	return (
		<View className="justify-center flex-1 items-center  bg-background">
              <Text className="text-2xl font-bold text-foreground">
		        Sign in
		      </Text>
		      <Link href = "/(auth)/sign-up" >create account</Link>
    </View>

	)
}

export default signin