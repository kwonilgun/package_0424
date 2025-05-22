/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/self-closing-comp */
/*
 * File: CartMainScreen.tsx
 * Project: market_2024_12_13
 * File Created: Saturday, 21st December 2024 10:52:45 am
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Saturday, 21st December 2024 10:58:26 am
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 * 2024-12-21 : 생성
 */

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// import {useAuth} from '../../context/store/Context.Manager';
import GlobalStyles from '../../styles/GlobalStyles';

import {connect} from 'react-redux';
import * as actions from '../../Redux/Cart/Actions/cartActions';

import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import {useFocusEffect} from '@react-navigation/native';
import {RFPercentage} from 'react-native-responsive-fontsize';

import {CartMainScreenProps} from '../model/types/TUserNavigator';
import {useAuth} from '../../context/store/Context.Manager';
import {alertMsg} from '../../utils/alerts/alertMsg';
import {CartItem} from '../../Redux/Cart/Reducers/cartItems';
import CartListCard from './CartListCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IDeliveryInfo} from '../model/interface/IDeliveryInfo';

const CartMainScreen: React.FC<CartMainScreenProps> = props => {
  const {state} = useAuth();
  const [total, setTotal] = useState<number>(0);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  useFocusEffect(
    useCallback(() => {
      console.log('CartMainScreen useFocusEffect');
      if (state.isAuthenticated) {

        // cartItems가 배열이 아니거나 undefined일 경우 기본값 설정
          // console.log('props.cart = ', props.cart);

          if (Array.isArray(props.cart)) {
            // 2023-02-23: 주문 갯수를 곱해서 총금액 계산
            let sum = 0;
            props.cart?.forEach((item: CartItem) => {
              const price = item.product.price ? item.product.price : '0';
              const discount = item.product.discount ? item.product.discount : '0';

              console.log('CartMainScreen - price discount', price, discount);

              sum +=
                parseInt(String(price), 10) * (100 - (parseInt(String(discount), 10) ?? 0)) *
                0.01 *
                item.quantity;
            });
            console.log('CartMainScreen - sum =', sum);
            setTotal(sum);
            setIsLogin(true);
          } else {
            console.log('array 가 아님');
          }
      } else {
          alertMsg('에러', '로그인 필요합니다.');
      }

      return () => {
        setIsLogin(false);
        setTotal(0);
      };
    }, [state.isAuthenticated, props.cart, props.navigation]),
  );

  const gotoDeliveryScreen = async () => {
    const resDelivery: IDeliveryInfo = {
      id: '',
      name: '',
      address1: '',
      address2: '',
      phone: '',
      deliveryMethod: 0,
      checkMark: false,
    };
    await AsyncStorage.setItem('deliveryInfo', JSON.stringify(resDelivery));

    props.navigation.navigate('ShippingNavigator', {
      screen: 'ShippingMainScreen',
    });
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={strings.SHOPPING_CART}
        isLeftView={false}
        //    leftCustomView={LeftCustomComponent}
        containerStyle={{paddingHorizontal: 8}}
        isRight={false}
      />

      {!isLogin ? (
        <View style={{alignItems: 'center', marginTop: 10}}>
          <Text style={{marginBottom: RFPercentage(2)}}>
            장바구니 선택은 로그인이 필요합니다.
          </Text>
          <View style={styles.loginView}>
            <TouchableOpacity
              onPress={() => {
                console.log('CartMainScreen: 로그인 필요합니다. ');
                props.navigation.navigate('UserMain', {screen:'LoginScreen'});
              }}>
              <View style={GlobalStyles.buttonSmall}>
                <Text style={GlobalStyles.buttonTextStyle}>
                  "로그인 필요합니다"
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={GlobalStyles.containerKey}>
          {props.cart?.length ? (
            <ScrollView style={GlobalStyles.scrollView}>
              <View style={GlobalStyles.VStack}>
                {/* <CheckButton
                  cartItems={props.cartItems}
                  navigation={props.navigation}
                /> */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.totalText}>
                    합계 : {total.toLocaleString('ko-KR')}원
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('구매하기 버튼 click');
                      gotoDeliveryScreen();
                    }}>
                    <View style={GlobalStyles.buttonSmall}>
                      <Text style={GlobalStyles.buttonTextStyle}>구매하기</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <>
                  {props.cart?.map((item, index) => {
                    return <CartListCard key={index} item={item} />;
                  })}
                </>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.selectProduct}>
              <Text
                style={{
                  marginVertical: RFPercentage(4),
                  fontSize: RFPercentage(2),
                }}>
                상품을 먼저 선택하세요
              </Text>
              <View style={styles.productView}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('ProductDetailScreen: 상품먼저 선택하세요');
                    props.navigation.navigate('Home', {
                      screen: 'ProductMainScreen',
                    });
                  }}>
                  <View style={GlobalStyles.buttonSmall}>
                    <Text style={GlobalStyles.buttonTextStyle}>
                      상품선택하러 가기
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  totalText: {
    marginVertical: RFPercentage(2),
    fontSize: RFPercentage(3),
  },
  selectProduct: {alignItems: 'center', marginVertical: RFPercentage(2)},
  loginView: {
    margin: RFPercentage(2),
    alignItems: 'flex-end',
  },

  productView: {
    marginVertical: RFPercentage(4),
    alignItems: 'flex-end',
  },
});

// 2024-12-21 : Redux를 이용해서 CartMainScreen에 CartItem Array을 props로 전달하는 한다. state는 Redux store에 저장된 값을 보내준다.
const mapStateToProps = (state: CartItem[]) => {
  console.log('CartMainScreen: mapStateTopProps state = ', state);
  return state;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    clearCart: () => dispatch(actions.clearCart()),
    removeFromCart: (item: CartItem) => dispatch(actions.removeFromCart(item)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartMainScreen);
