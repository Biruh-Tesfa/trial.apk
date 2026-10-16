import React from 'react'
import "../../global.css";
import { View, Text } from 'react-native'
import {Link} from "expo-router"

const signup = () => {
	return (
		<View className="mt-8 flex-1 items-center  bg-background">
			<Text className ="text-success">sign-up</Text>
			<Link href = "/(auth)/sign-in" >signin</Link>
		</View>

	)
}

export default signup