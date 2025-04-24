import React from 'react';
import {TouchableOpacity} from 'react-native';
import ProductCard from './ProductCard';
import {StackNavigationProp} from '@react-navigation/stack';
import {IProduct} from '../model/interface/IProductInfo';
import {ICompany} from '../model/interface/ICompany';
import { ISProduct } from '../Admin/AddProductScreen';

interface ProductListProps {
  item: ISProduct; // Replace 'any' with a specific type for 'item' if available
  companyInform: ICompany; // Replace 'any' with a specific type for 'companyInform' if available
  navigation: StackNavigationProp<any, any>; // Update types based on your navigation stack
  onLoadingChange: (isLoading: boolean) => void; // 타입 명시

}

const ProductList: React.FC<ProductListProps> = props => {
  const {item, companyInform, navigation, onLoadingChange} = props;

  return (
    <TouchableOpacity
      // style={{ width: '50%' }}
      onPress={() => {
        console.log('ProductList ...')
        navigation.navigate('ProductDetailScreen', {
          item: item,
          companyInform: companyInform,
        });
      }}>
      <ProductCard navigation={navigation} items={item} {...item} onLoadingChange = {onLoadingChange} />
    </TouchableOpacity>
  );
};

export default ProductList;
