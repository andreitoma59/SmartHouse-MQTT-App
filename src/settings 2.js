import React from "react";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import * as theme from './Theme'

export default {
    'light':{
        name: 'Light',
        icon:({size,color,...props}) => (
        <MaterialCommunityIcons 
        size={size || theme.sizes.font} 
        color={color || theme.colors.accent}
        name="lightbulb-on-outline"
        {...props}
        />
        )
    },
    'ac':{
        name: 'AC',
        icon:({size,color,...props}) =>(<MaterialCommunityIcons 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent} 
            name="air-conditioner"
            {...props}
        />
        )
    },
    'temperature':{
        name: 'Temperature',
        icon:({size,color,...props}) =>(<FontAwesome5 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent} 
            name="temperature-low"
            {...props}
        />
        )
    },
    'fan':{
        name: 'Fan',
        icon:({size,color,...props}) =>(<MaterialCommunityIcons 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent}
            name="fan"
            {...props}
        />
        )
    },
    'wi-fi':{
        name: 'Wi-Fi',
        icon:({size,color,...props}) =>(<FontAwesome5 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent}
            name="wifi"
        />
        )
    },
    'alarm':{
        name: 'Alarm',
        icon:({size,color,...props}) =>(<MaterialCommunityIcons 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent}
            name="alarm-panel-outline"
        />
        )
    },
    'gas':{
        name: 'Gas',
        icon:({size,color,...props}) =>(<MaterialCommunityIcons 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent}
            name="smoke"
        />
        )
    },
    'electricity':{
        name: 'Electricity',
        icon:({size,color,...props}) =>(<MaterialIcons 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent} 
            name="power"
            {...props}
        />
        )
    },
    'window':{
        name: 'Window',
        icon:({size,color,...props}) =>(<MaterialCommunityIcons 
            size={size || theme.sizes.font} 
            color={color || theme.colors.accent} 
            name="window-closed-variant"
            {...props}
        />
        )
    },
};
