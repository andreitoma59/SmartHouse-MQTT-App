import React from 'react';
import { Block,Text } from '../components'

export const TemperatureDisplay = React.memo(({ temperature }) => {
    return (
        <Block flex={1.5} row style={{alignItems: 'flex-end'}}>
            <Text h1 >{temperature}</Text>
            <Text h1 size={34} height={80} weight={'600'} spacing={0.1}>°C</Text>
          </Block>
    );
});
