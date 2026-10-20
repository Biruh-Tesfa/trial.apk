import { Text, View, TouchableOpacity} from 'react-native'

const ListHeading = ({title}:ListHeadingProps) => {
  return (
    <View>
      <View className = "list-head" >
        <Text className = "list-title">{title}</Text>
           <TouchableOpacity>
              <Text className = " list-action " > View All </Text>
            </TouchableOpacity>
     </View>
   </View>
  )
}

export default ListHeading