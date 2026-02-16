import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import KeyboardAwareWrapper from '../components/KeyboardAwareWrapper';

const DropoffSearchScreen = () => {
  const recentDropoffs = [
    {
      id: '1',
      title: '12th Main Rd',
      address: 'Indiranagar, HAL 2nd Stage, Bengaluru',
      name: 'Anjali Sharma',
      phone: '9876543210',
    },
    // Add more items here if needed
  ];

  const renderRecentItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Feather name="clock" size={20} color="#555" style={{ marginRight: 8 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.address}>{item.address}</Text>
        <Text style={styles.contact}>
          {item.name} • {item.phone}
        </Text>
      </View>
      <TouchableOpacity>
        <AntDesign name="hearto" size={20} color="black" />
        <Text style={styles.save}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAwareWrapper
      enableScrollView={false}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enableOnAndroid={true}
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          placeholder="Where is your Drop-off?"
          style={styles.input}
        />
        <Ionicons name="mic-outline" size={24} color="#007bff" />
      </View>

      {/* Recent drop-offs */}
      <Text style={styles.sectionTitle}>Recent drop-offs</Text>
      <FlatList
        data={recentDropoffs}
        keyExtractor={(item) => item.id}
        renderItem={renderRecentItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Bottom buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn}>
          <Ionicons name="locate-outline" size={20} color="#007bff" />
          <Text style={styles.bottomText}>Use current location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn}>
          <Ionicons name="map-outline" size={20} color="#007bff" />
          <Text style={styles.bottomText}>Locate on the Map</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareWrapper>
  );
};

export default DropoffSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop:20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 12,
    marginTop: 10,
    color: '#444',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  address: {
    color: '#666',
    fontSize: 13,
  },
  contact: {
    color: '#666',
    fontSize: 13,
  },
  save: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomText: {
    marginLeft: 6,
    color: '#007bff',
    fontWeight: '500',
  },
});
