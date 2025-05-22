import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {AdminOrderStackParamList} from '../../Screen/model/types/TAdminOrderNavigator';
import AdminOrderMainScreen from '../../Screen/Admin/Order/AdminOrderMainScreen';
import OrderStatusScreen from '../../Screen/Admin/Order/OrderStatusScreen';
import OrderRxScreen from '../../Screen/Admin/Order/OrderRxScreen';
import PaymentCompleteScreen from '../../Screen/Admin/Order/PaymentCompleteScreen';
import OrderDetailScreen from '../../Screen/Orders/OrderDetailScreen';
import PrepareDeliveryScreen from '../../Screen/Admin/Order/PrepareDeliveryScreen';
import FindOrderNumberScreen from '../../Screen/Admin/Order/FindOrderNumberScreen';

import DuringDeliveryScreen from '../../Screen/Admin/Order/DuringDeliveryScreen';
import CompleteDeliveryScreen from '../../Screen/Admin/Order/CompleteDeliveryScreen';
import CompleteReturnScreen from '../../Screen/Admin/Order/CompleteReturnScreen';
import RequestReturnScreen from '../../Screen/Admin/Order/RequestReturnScreen';
import OrderAIScreen from '../../Screen/Admin/Order/OrderAIScreen';
import OrderChangeScreen from '../../Screen/Orders/OrderChangeScreen';
import OrderTotalChangeScreen from '../../Screen/Orders/OrderTotalChangeScreen';

// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<AdminOrderStackParamList>();

function MyStack() {
    // const {state} = useAuth();
    return (
      <Stack.Navigator
        initialRouteName="AdminOrderMainScreen"
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
            name="AdminOrderMainScreen"
            component={AdminOrderMainScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '주문',
            })}
          />

        <Stack.Screen
            name="OrderStatusScreen"
            component={OrderStatusScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '주문현황',
            })}
          />

        <Stack.Screen
            name="OrderRxScreen"
            component={OrderRxScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '주문접수',
            })}
          />
        <Stack.Screen
            name="PaymentCompleteScreen"
            component={PaymentCompleteScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '결재완료',
            })}
          />

          <Stack.Screen
            name="OrderDetailScreen"
            component={OrderDetailScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '주문 상세',
            })}
          />

          <Stack.Screen
            name="OrderChangeScreen"
            component={OrderChangeScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '개인정보',
              // headerTitle: props => (
              //   <LogoTitle title="루트원 마켓" navigation={navigation} />
              // ),
            })}
          />

          <Stack.Screen
            name="OrderTotalChangeScreen"
            component={OrderTotalChangeScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '개인정보',
              // headerTitle: props => (
              //   <LogoTitle title="루트원 마켓" navigation={navigation} />
              // ),
            })}
          />

          <Stack.Screen
            name="PrepareDeliveryScreen"
            component={PrepareDeliveryScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '배송준비',
            })}
          />

          <Stack.Screen
            name="FindOrderNumberScreen"
            component={FindOrderNumberScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '주문번호 찾기',
            })}
          />
          <Stack.Screen
            name="DuringDeliveryScreen"
            component={DuringDeliveryScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '배송 중',
            })}
          />
          <Stack.Screen
            name="CompleteDeliveryScreen"
            component={CompleteDeliveryScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '배송 완료',
            })}
          />
          <Stack.Screen
            name="CompleteReturnScreen"
            component={CompleteReturnScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '반품 완료',
            })}
          />
          <Stack.Screen
            name="RequestReturnScreen"
            component={RequestReturnScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '반품 완료',
            })}
          />
          <Stack.Screen
            name="OrderAIScreen"
            component={OrderAIScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: 'AI 주문',
            })}
          />


      </Stack.Navigator>
    );
  }
  export default function AdminOrderNavigator() {
    return <MyStack />;
  }
