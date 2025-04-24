import React, {useEffect, useRef, useState} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Button} from 'react-native';
import {Modalize} from 'react-native-modalize';
// import { LOG } from '../../Log/reactLogger';
import {connect} from 'react-redux';
import * as actions from '../../Redux/Cart/Actions/cartActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {height} from '../../assets/common/BaseValue';
import GlobalStyles from '../../styles/GlobalStyles';
import strings from '../../constants/lang';
import {IProduct} from '../model/interface/IProductInfo';
import {CartItem} from '../../Redux/Cart/Reducers/cartItems';
import { ISProduct } from '../Admin/AddProductScreen';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { alertMsg } from '../../utils/alerts/alertMsg';

type Props = {
  modalRef: React.RefObject<Modalize>;
  item: ISProduct;
  dProps: {
    navigation: {
      goBack: () => void;
      navigate: (screen: string, params?: object) => void;
    };
  };
  addItemToCart: (number: number, product: ISProduct) => void;
  clearCart: () => void;
  removeFromCart: (item: CartItem) => void;
  changeQuantity: (item: CartItem) => void;
};

const BottomSheet: React.FC<Props> = props => {
  const {modalRef, item, dProps} = props;
  const refNumber = useRef<number>(1);
  const [buyNumber, setBuyNumber] = useState<number>(1);
  console.log('BottomSheet, item', item);

  useEffect(() => {
    refNumber.current = 1;
  }, []);

  const putInShoppingCart = async (
    dProps: Props['dProps'],
    number: number,
    item: Props['item'],
  ) => {
    console.log('putInShoppingCart number, item', number, item);
    props.addItemToCart(number, item);
    //2025-04-09 15:45:22 - 재고 숫자를 감축해야 한다.
    try {
      const token = await getToken();
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };
      const data = {
        productId : item.id,
        quantity: number,
      };

      const response: AxiosResponse =  await axios.post(
        `${baseURL}stock/decrease`,
        JSON.stringify(data),
        config,
      );

      // console.log('putInShopping cart response ', response);
      dProps.navigation.navigate('ShoppingCart', {screen: 'CartMainMenu'});
      modalRef.current?.close();

    } catch (error) {
      alertMsg('에러', '재고 감소 에러');
    }

  };

  const buyItRightAway = async (
    dProps: Props['dProps'],
    number: number,
    item: Props['item'],
  ) => {
    props.addItemToCart(number, item);
    // dProps.navigation.goBack();

    const resDelivery = {
      id: '',
      name: '',
      address1: '',
      address2: '',
      phone: '',
      deliveryMethod: 0,
      checkMark: false,
    };

    //2024-12-21 :나중에 데이터를 가져올 때는 JSON.parse를 사용하여 다시 객체로 변환해야 합니다:
    await AsyncStorage.setItem('deliveryInfo', JSON.stringify(resDelivery));

    dProps.navigation.navigate('ShippingNavigator', {
      screen: 'ShippingMainScreen',
    });
    modalRef.current?.close();
  };

  const incNum = () => {
    // console.log('BottomSheet incNum item.stock =', item.stock);
    // 2025-04-09 15:21:58, item.stock는 재고 숫자
    if (refNumber.current < Number(item.stock)) {
      props.changeQuantity({product: item, quantity: refNumber.current + 1});
      refNumber.current += 1;
      setBuyNumber(refNumber.current);
    }
  };

  const decNum = () => {
    if (refNumber.current > 1) {
      props.changeQuantity({product: item, quantity: refNumber.current - 1});
      refNumber.current -= 1;
      setBuyNumber(refNumber.current);
    }
  };

  return (
    <Modalize
      ref={modalRef}
      snapPoint={height * 0.4}
      adjustToContentHeight={true}>
      <View style={styles.container}>
        <Text style={styles.brandText}>브랜드: {item.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            가격:{' '}
            {(
              Number(item.price) *
              (100 - Number(item.discount ? item.discount : 0)) *
              refNumber.current *
              0.01
            ).toLocaleString('kr-KR')}
            원
          </Text>

          <Text>갯수:</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={decNum} style={styles.button}>
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.quantityBox}>
              <Text style={styles.quantityText}>{buyNumber}</Text>
            </View>
            <TouchableOpacity onPress={incNum} style={styles.button}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log('BottomSheet: 장바구니 담기 누름');
              putInShoppingCart(dProps, refNumber.current, item);
            }}>
            {/* {badgeStyle('장바구니 담기', null)} */}
            <View style={GlobalStyles.buttonSmall}>
              <Text style={GlobalStyles.buttonTextStyle}>
                {strings.ADD_TO_CART}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('BottomSheet: 바로 구매하기 버튼 누름');
              buyItRightAway(dProps, refNumber.current, item);
            }}>
            {/* {badgeStyle('바로구매', null)} */}
            <View style={GlobalStyles.buttonSmall}>
              <Text style={GlobalStyles.buttonTextStyle}>
                {strings.BUY_NOW}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('BottomSheet: 취소 버튼 누름');
              modalRef.current?.close();
            }}>
            {/* {badgeStyle('취소', null)} */}
            <View style={GlobalStyles.buttonSmall}>
              <Text style={GlobalStyles.buttonTextStyle}>{strings.CANCEL}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 10,
  },
  brandText: {
    padding: 10,
    fontSize: 18,
  },
  priceContainer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'gray',
    borderWidth: 1,
    flexDirection: 'row',
  },
  priceText: {
    fontSize: 18,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 5,
  },

  button: {
    width: 40, // 버튼의 너비
    height: 40, // 버튼의 높이
    justifyContent: 'center', // 텍스트를 수직 중앙 정렬
    alignItems: 'center', // 텍스트를 가로 중앙 정렬
    backgroundColor: 'indigo', // 버튼 배경색
    borderRadius: 5, // 둥근 모서리
    marginHorizontal: 5, // 버튼 간 간격
  },
  buttonText: {
    color: 'white', // 텍스트 색상
    fontSize: 20, // 텍스트 크기
    fontWeight: 'bold', // 텍스트 굵기
  },
  quantityBox: {
    width: 50, // 고정된 너비
    alignItems: 'center', // 텍스트를 가운데 정렬
    justifyContent: 'center', // 수직 중앙 정렬
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionContainer: {
    margin: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    addItemToCart: (number: number, product: any) =>
      dispatch(actions.addToCart({quantity: number, product})),
    clearCart: () => dispatch(actions.clearCart()),
    removeFromCart: (item: any) => dispatch(actions.removeFromCart(item)),
    changeQuantity: (item: CartItem) => dispatch(actions.changeQuantity(item)),
  };
};

const mapStateToProps = (state: any) => {
  const {cartItems} = state;
  return {
    cartItems,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomSheet);
