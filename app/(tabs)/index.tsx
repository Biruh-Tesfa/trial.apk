import ListHeading from '@/components/listHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import UpcomingSubscriptionCards from '@/components/upcomingSubscriptionCards';
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from '@/constants/data';
import { icons } from '@/constants/icons';
import images from '@/constants/image';
import "@/global.css";
import { useUser } from "@clerk/expo";
import { formatCurrency } from "@/lib/utils";
import dayjs from 'dayjs';
import { styled } from "nativewind";
import { useState } from 'react';
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const { user } = useUser();
  const userName =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Your account";

  return (
    <SafeAreaView className=" flex-1  bg-background p-5">
      
       <View className='flex-1'> 
           <FlatList
           ListHeaderComponent={()=> (
            <>
              <View className = "home-header">
                <View className = "home-user">
                  <Image source={images.avatar} className="home-avatar"/>
                  <Text className = "home-user-name">{userName || "Your account"}</Text>
                </View>
                <Image source={icons.add} className="home-add-icon"/>
              </View> 
              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="flex-row items-center">
                  <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                  <Text className="ml-auto home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
                </View>
              </View>
              
                <View className='mb-5'> 
                  <ListHeading title="Upcoming"/> 
                  <FlatList
                    data={UPCOMING_SUBSCRIPTIONS}
                    renderItem={({item})=>(
                        <UpcomingSubscriptionCards {...item}/>
                    )}
                    keyExtractor={(item)=>item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={<Text className='home-empty-state'>No upcoming renewal yet.</Text>}
                  />
                </View> 
                  <ListHeading title="All Subscriptions"/>
           </>
           )}
             data={HOME_SUBSCRIPTIONS}
             keyExtractor={(item)=>item.id}
             renderItem={({item})=>(
                <SubscriptionCard 
                  {...item}
                  expanded={expandedSubscriptionId === item.id}
                  onPress = {()=>setExpandedSubscriptionId((currentId)=>(currentId===item.id ? null : item.id))}
                /> 
              )}
            extraData = {expandedSubscriptionId}
            showsVerticalScrollIndicator = {false}
            ItemSeparatorComponent={()=> <View className='h-4'/>}
            ListEmptyComponent={<Text className='home-empty-state'>No subscriptions yet.</Text>}
            contentContainerClassName='pb-20'
           />
           
       </View>   
    </SafeAreaView>
  );
}