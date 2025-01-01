import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';

// Icon images stored locally or from a CDN
const icons = {
  eBay: 'https://logos-world.net/wp-content/uploads/2020/11/eBay-Logo.png', // Update the path accordingly
  Lazada: 'https://vectorseek.com/wp-content/uploads/2023/10/Lazada-Icon-Logo-Vector.svg-.png', // Update the path accordingly
  Amazon: 'https://logo-base.com/logo/amazon-logo.png', // Update the path accordingly
};

const ProductScreen = ({ route }) => {
  const { products } = route.params; // Receive the data passed from Home
  console.log(products);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.productContainer} onPress={() => Linking.openURL(item.link)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          onError={(e) => console.log('Loading image failed', e)}
        />
        <Image
          source={{ uri: icons[item.source] }}
          style={styles.icon}
          onError={(e) => console.log('Loading icon failed', e)}
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.headerTitle}>Search Result ({products.length})</Text>
      <FlatList
        data={products} // Use the received products data
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    padding: 20,
    textAlign: 'center'
  },
  productContainer: {
    flex: 1,
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'left'
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative', // Important for absolute positioning of the icon
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  icon: {
    width: 50,
    height: 50,
    position: 'absolute', // Absolute position for the icon
    top: 0, // Right top corner
    right: 0,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  price: {
    fontSize: 14,
    color: 'green',
    textAlign: 'left',
  },
  row: {
    flex: 1,
    justifyContent: "space-around"
  }
});

export default ProductScreen;
