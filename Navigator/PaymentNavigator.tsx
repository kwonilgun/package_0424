/*
 * File: PaymentNavigator.tsx
 * Project: market_2024_12_13
 * File Created: Tuesday, 24th December 2024 1:01:48 pm
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Tuesday, 24th December 2024 1:02:07 pm
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import PaymentMainScreen from '../Screen/Payment/PaymentMainScreen';

import {PaymentStackParamList} from '../Screen/model/types/TPaymentNavigator';

// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<PaymentStackParamList>();

function MyStack() {
  //   const {state} = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="PaymentMainScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#e6efd0',
          height: 30,
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          // fontWeight: "bold",
          color: 'black',
        },
      }}>
      <Stack.Screen
        name="PaymentMainScreen"
        component={PaymentMainScreen}
        options={({navigation, route}) => ({
          headerShown: false,
          headerLeft: () => null,
          title: '쇼핑카트',
        })}
      />
    </Stack.Navigator>
  );
}

export default function PaymentNavigator() {
  return <MyStack />;
}
