import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils';
import clsx from 'clsx';
import { Image, Pressable, Text, View } from 'react-native';
const SubscriptionCard = 
({expanded,onPress,name,price,currency,
  billing,icon,color,catagory,plan,status
  ,renewalDate,paymentMethod,startDate}:SubscriptionCardProps) => {
  return (
    <Pressable 
        onPress={onPress} 
       className={clsx('sub-card',expanded ? 'sub-card-expanded' : 'bg-card')}
        style={!expanded && color ? {backgroundColor:color}:undefined}
        >
      <View className='sub-head'>
        <View className='sub-main'>
           <Image className='sub-icon' source = {icon}/>
           <View className='sub-copy'>
              <Text className='sub-title' numberOfLines={1}>{name}</Text>
              <Text numberOfLines={1} ellipsizeMode='tail'className='sub-meta'>
                {catagory?.trim() || plan?.trim() || renewalDate? formatSubscriptionDateTime(renewalDate): ''}
              </Text>
           </View>
        </View>
        <View className='sub-price-box'>
           <Text className='sub-price'>{formatCurrency(price,currency)}</Text>
           <Text className='sub-billing'>{billing}</Text>
        </View>
      </View>
      {expanded && (
        <View className='sub-bdy'>
           <View className='sub-detail'>
            <View className='sub-row'>
              <View className='mb-3 sub-row-copy'>
                <Text className='sub-lable'>Payment:</Text>
                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{paymentMethod?.trim()}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='mb-3 sub-row-copy'>
                <Text className='sub-lable'>Catagory:</Text>
                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{catagory?.trim() || plan?.trim()}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='mb-3 sub-row-copy'>
                <Text className='sub-lable'>Started:</Text>
                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{startDate?formatSubscriptionDateTime(startDate):''}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='mb-3 sub-row-copy'>
                <Text className='sub-lable'>Renewal date:</Text>
                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{renewalDate?formatSubscriptionDateTime(renewalDate):''}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='mb-3 sub-row-copy'>
                <Text className='sub-lable'>Status::</Text>
                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{status ? formatStatusLabel(status):''}</Text>
              </View>
            </View>
           </View>
        </View>
  )}
    </Pressable>
  )
}

export default SubscriptionCard