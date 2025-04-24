import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import SalesMainScreen from '../../Screen/Admin/Sales/SalesMainScreen';
import { SalesStackParamList } from '../../Screen/model/types/TSalesNavigator';
import SalesChartScreen from '../../Screen/Admin/Sales/SalesChartScreen';
import SalesMonthlyScreen from '../../Screen/Admin/Sales/SalesMonthlyScreen';
import ProfitMonthlyScreen from '../../Screen/Admin/Sales/ProfitMonthlyScreen';

// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<SalesStackParamList>();

function MyStack() {
    // const {state} = useAuth();
    return (
      <Stack.Navigator
        initialRouteName="SalesMainScreen"
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
        {/* 2024-05-02 : 하단 탭 메뉴에서 로그인 탭을 눌러도 그대로 있도록 하기 위해서 로그인 상태를 체크해서, 로그인 상태이면 ProfileScreen을 유지 */}

          <Stack.Screen
            name="SalesMainScreen"
            component={SalesMainScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '편집',
            })}
          />
          <Stack.Screen
            name="SalesChartScreen"
            component={SalesChartScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '한달매출',
            })}
          />
          <Stack.Screen
            name="SalesMonthlyScreen"
            component={SalesMonthlyScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '월매출',
            })}
          />
          <Stack.Screen
            name="ProfitMonthlyScreen"
            component={ProfitMonthlyScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '월수익',
            })}
          />
          
      </Stack.Navigator>
    );
  }
  export default function SalesNavigator() {
    return <MyStack />;
  }
