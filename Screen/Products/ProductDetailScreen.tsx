/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import {RFPercentage} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import {ProductDetailScreenProps} from '../model/types/TUserNavigator';
import strings from '../../constants/lang';
import {useFocusEffect} from '@react-navigation/native';

import {useAuth} from '../../context/store/Context.Manager';
import GlobalStyles from '../../styles/GlobalStyles';
import {IProduct} from '../model/interface/IProductInfo';
import {ICompany} from '../model/interface/ICompany';
import FastImage from 'react-native-fast-image';
// import BottomSheet from './Bottomsheet';
import {connect} from 'react-redux';
import * as actions from '../../Redux/Cart/Actions/cartActions';
import {height, width} from '../../assets/common/BaseValue';
import {baseURL} from '../../assets/common/BaseUrl';
import BottomSheet from './BottomSheet';
import {showPriceInform} from '../Cart/showPriceInform';
import isEmpty from '../../utils/isEmpty';
import { ISProduct } from '../Admin/AddProductScreen';

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = props => {
  const {state, dispatch} = useAuth();
  const [item, setItem] = useState<ISProduct>(props.route.params.item);
  const [companyInform, setCompanyInform] = useState<ICompany>(
    props.route.params.companyInform,
  );

  console.log('ProductDetailScreen item = ', props.route.params.item);
  const imageName = props.route.params.item.image?.split('/').pop() ?? '';
  console.log('ProductDetailScreen imageName = ', imageName);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const modalRef = useRef<any>(null);
  const [star, setStar] = useState<number>(5);

  useFocusEffect(
    useCallback(() => {
      console.log('ProductDetailScreen: useCallback');

      if (state.isAuthenticated) {
        state.user!.isAdmin ? setIsAdmin(true) : setIsAdmin(false);
      } else {
        setIsAdmin(false);
      }
      return () => {
        setIsAdmin(false);
      };
    }, [state]),
  );
  const onOpen = () => {
    console.log('SingleProduct.tsx : onOpen');
    try {
      modalRef.current?.open();
    } catch (error) {
      console.error(error);
    } finally {
      console.log('SingleProduct.tsx: modal final.....>>>>>');
    }
  };
  const onPressLeft = () => {
    props.navigation.navigate('Home', {screen: 'ProductMainScreen'});
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
        <>
          {/* <Text style={styles.leftTextStyle}>홈</Text> */}
          <Icon
            style={{color: colors.lightBlue, fontSize: RFPercentage(5)}}
            name="arrow-left"
          />
        </>
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={strings.SYSINFO}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        rightText={''}
        isRightView={false}
      />

      <BottomSheet
        modalRef={modalRef}
        item={props.route.params.item}
        dProps={props}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        <ScrollView style={GlobalStyles.scrollView}>
          <View style={GlobalStyles.VStack}>
            {isAdmin ? null : (
              <View style={styles.producerView}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('ProductDetailScreen: 구매하기 버튼 누름');
                    onOpen();
                  }}>
                  <View style={GlobalStyles.buttonSmall}>
                    <Text style={GlobalStyles.buttonTextStyle}>
                      {strings.BUY}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.productContainer}>
              {!isEmpty(imageName) ? (
                  <FastImage
                    style={styles.imageStyle}
                    source={{
                      uri: imageName
                        ? `${baseURL}products/downloadimage/${imageName}`
                        : undefined,
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
              ) : null }
            </View>

            {showPriceInform(0, item.name, String(item.discount), String(item.price))}
            <View style={styles.divider} />
            <Text style={styles.boldText}>재고</Text>
            <Text style={styles.descriptionText}>{item.stock}</Text>
            <Text style={styles.boldText}>상품 설명</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
            <View style={styles.divider} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

// const styles = StyleSheet.create({
//   buttonText: {
//     fontWeight: 'bold',
//     fontSize: RFPercentage(2),
//     color: colors.white,
//   },
// });

const mapDispatchToProps = (props: any, dispatch: any) => {
  return {
    addItemToCart: () =>
      dispatch(actions.addToCart({quantity: 1, product: props.items})),
  };
};

export default connect(null, mapDispatchToProps)(ProductDetailScreen);

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#e5e5e5',
  },
  producerView: {
    margin: 8,
    alignItems: 'flex-end',
  },
  productContainer: {
    width: width,
  },
  imageStyle: {
    marginTop: 10,
    width: width * 0.9,
    height: height / 3,
    borderRadius: 10,
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  shippingInfoContainer: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#d9d9d9',
  },
  grayText: {
    fontSize: 12,
    color: '#808080',
  },
  deliveryTimeText: {
    marginLeft: width * 0.1,
  },
  freeShippingText: {
    marginLeft: width * 0.21,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#d9d9d9',
    marginVertical: 16,
  },
  inquiryContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  inquiryTextContainer: {
    marginRight: 16,
    width: width / 1.8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  smallGrayText: {
    fontSize: 12,
    color: '#808080',
  },
  descriptionText: {
    marginTop: RFPercentage(0.5),
    marginBottom: RFPercentage(2),
    paddingHorizontal: RFPercentage(2),
    fontSize: RFPercentage(1.5),
  },
});
