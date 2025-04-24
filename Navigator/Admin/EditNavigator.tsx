import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {EditStackParamList} from '../../Screen/model/types/TEditNavigator';
import EditMainScreen from '../../Screen/Admin/EditMainScreen';
import EditProductScreen from '../../Screen/Admin/EditProductScreen';
import AddProductScreen from '../../Screen/Admin/AddProductScreen';
import EditProducerScreen from '../../Screen/Admin/EditProducerScreen';
import AddProducerScreen from '../../Screen/Admin/AddProducerScreen';

// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<EditStackParamList>();

function MyStack() {
    // const {state} = useAuth();
    return (
      <Stack.Navigator
        initialRouteName="EditMainScreen"
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
            name="EditMainScreen"
            component={EditMainScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '편집',
            })}
          />
          <Stack.Screen
            name="EditProductScreen"
            component={EditProductScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '상품편집',
            })}
          />

          <Stack.Screen
            name="EditProducerScreen"
            component={EditProducerScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '상품편집',
            })}
          />


          <Stack.Screen
            name="AddProductScreen"
            component={AddProductScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '상품추가',
            })}
          />

          <Stack.Screen
            name="AddProducerScreen"
            component={AddProducerScreen}
            options={({navigation, route}) => ({
              headerShown: false,
              headerLeft: () => null,
              title: '상품추가',
            })}
          />
      </Stack.Navigator>
    );
  }
  export default function EditNavigator() {
    return <MyStack />;
  }
