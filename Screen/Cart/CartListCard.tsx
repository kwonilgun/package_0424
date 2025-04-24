/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import {useEffect, useRef} from 'react';
import {CartItem} from '../../Redux/Cart/Reducers/cartItems';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as actions from '../../Redux/Cart/Actions/cartActions';
import FastImage from 'react-native-fast-image';
import {height, width} from '../../assets/common/BaseValue';
import {showPriceInform} from './showPriceInform';
import {baseURL} from '../../assets/common/BaseUrl';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import {IProduct} from '../model/interface/IProductInfo';
import {connect} from 'react-redux';
import strings from '../../constants/lang';
import {RFPercentage} from 'react-native-responsive-fontsize';

interface CartListCardProps {
  item: CartItem;
  //   totalFt: (sum: number) => void;
  //   cart: CartItem[];
  changeQuantity: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
}

const CartListCard: React.FC<CartListCardProps> = props => {
  const {item} = props;

  const refNumber = useRef<number>(item.quantity);
  const imageName = item.product.image?.split('/').pop();

  useEffect(() => {
    console.log(`CartListCard.tsx: 진입: refNumber = ${refNumber.current}`);
    // cartItems가 배열이 아니거나 undefined일 경우 기본값 설정

  }, [props.item, item]);

  const incNum = () => {
    if (refNumber.current < Number(item.product.stock)) {
      props.changeQuantity({
        product: item.product,
        quantity: refNumber.current + 1,
      });
      refNumber.current += 1;
    }
  };

  const decNum = () => {
    if (refNumber.current > 1) {
      props.changeQuantity({
        product: item.product,
        quantity: refNumber.current - 1,
      });
      refNumber.current -= 1;
    }
  };

  const deleteCartOrder = () => {

    props.removeFromCart(item);
  };

  return (
    <View style={styles.cardContainer}>
      <FastImage
        style={{
          width: width * 0.3,
          height: height * 0.15,
          borderRadius: 10,
        }}
        source={{
          uri: imageName
            ? `${baseURL}products/downloadimage/${imageName}`
            : undefined,

          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />

      {showPriceInform(
        4,
        item.product.name,
        item.product.discount!,
        item.product.price!,
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.priceText}>
          가격:{' '}
          {(
            Number(item.product.price) *
            (100 - Number(item.product.discount || 0)) *
            0.01 *
            refNumber.current
          ).toLocaleString('ko-KR')}
          원
        </Text>

        {/* <View style={styles.quantityContainer}>
          <Button title="-" onPress={decNum} />
          <Text style={styles.quantityText}>{refNumber.current}</Text>
          <Button title="+" onPress={incNum} />
        </View> */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={decNum} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.quantityBox}>
            <Text style={styles.quantityText}>{refNumber.current}</Text>
          </View>
          <TouchableOpacity onPress={incNum} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            const param: ConfirmAlertParams = {
              title: strings.CONFIRMATION,
              message: strings.DELETE_SHOPPING_CART,

              func: () => {
                console.log('장바구니 삭제 실행.... ');
                // onPressStart();
                deleteCartOrder(); // 상태 변경
              },
              params: [],
            };
            confirmAlert(param);
          }}>
          <Text style={styles.trashIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: RFPercentage(1),
    width: width * 0.92,
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: width * 0.28,
    height: height * 0.15,
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    // padding: 5,
    margin: RFPercentage(1),
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
  trashIcon: {
    color: 'blue',
    fontSize: 20,
  },
});

const mapStateToProps = (state: CartItem[]) => {
  return state;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    removeFromCart: (item: CartItem) => dispatch(actions.removeFromCart(item)),
    changeQuantity: (item: CartItem) => dispatch(actions.changeQuantity(item)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartListCard);
