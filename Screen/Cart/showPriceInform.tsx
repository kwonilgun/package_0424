/* eslint-disable react/react-in-jsx-scope */
import {StyleSheet, Text, View} from 'react-native';
import isEmpty from '../../utils/isEmpty';
import {RFPercentage} from 'react-native-responsive-fontsize';

export function showPriceInform(
  marginLeft: number,
  name: string,
  discount: string,
  price: string,
) {
  return (
    <View style={[styles.priceInfoContainer, {marginTop: RFPercentage(1), marginLeft:RFPercentage(0.2)}]}>
      <Text style={styles.productName}>
        {name.length > 15 ? name.substring(0, 12) + '...' : name}
      </Text>
      {/* <View style={styles.discountContainer}> */}
        {/* <Text style={styles.discountText}>
          {discount ? `${discount}% ` : ''}
        </Text> */}
        {!isEmpty(discount) ? (
          <Text style={styles.strikethroughPrice}>
            {Number(price).toLocaleString('kr-KR')}원
          </Text>
        ) : (
          <Text style={styles.priceText}>
            {Number(price).toLocaleString('kr-KR')}원
          </Text>
        )}
      {/* </View> */}
      {!isEmpty(discount) ? (
        <Text style={styles.finalPriceText}>
          {(
            Number(price) *
            (100 - Number(discount ? discount : 0)) *
            0.01
          ).toLocaleString('kr-KR')}{' '}
          원
        </Text>
      ) : null}
      <View style={styles.freeShippingContainer}>
        <Text style={styles.freeShippingText}>무료배송</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
    marginVertical: RFPercentage(0.5),
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
    marginVertical: RFPercentage(0.5),
    color: 'red',
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    fontSize: RFPercentage(1.2),
  },
  priceText: {
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
    marginVertical: RFPercentage(0.5),
  },
  finalPriceText: {
    fontSize: RFPercentage(1.2),
    // fontWeight: 'bold',
    marginVertical: RFPercentage(0.5),
  },
  freeShippingContainer: {
    marginTop: 5,
  },
  freeShippingText: {
    fontSize: 10,
    color: 'gray',
  },
});
