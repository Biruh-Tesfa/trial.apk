import React from 'react'
import { View, Text } from 'react-native'
import {Link, useLocalSearchParams} from 'expo-router'

const subscriptionDetails = () => {
	const {id} = useLocalSearchParams<{id:string}>()
	return (
		<View className="  bg-background">
			<Text>subscription Details: {id}</Text>
			<Link  href="/">go home</Link>
		</View>
	)
}

export default subscriptionDetails