import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [chatName, setChatName] = useState('');
  const [shake] = useState(new Animated.Value(0));
  
  const [chatRooms] = useState([
    { id: '1', name: 'General Chat', users: 42 },
    { id: '2', name: 'Tech Talk', users: 23 },
    { id: '3', name: 'Gaming', users: 18 },
    { id: '4', name: 'Music', users: 15 }
  ]);

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleJoin = (roomName) => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username first');
      startShake();
      return;
    }
    
    navigation.navigate('Chat', {
      username: username,
      chatName: roomName || chatName,
    });
  };

  const renderChatRoom = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatRoomItem}
      onPress={() => handleJoin(item.name)}
    >
      <LinearGradient
        colors={['#d3d3d3', '#f0f0f0']}
        style={styles.chatRoomGradient}
      >
        <Text style={styles.chatRoomName}>{item.name}</Text>
        <View style={styles.userCountContainer}>
          <Text style={styles.userIcon}>👤</Text>
          <Text style={styles.userCount}>{item.users}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>RetroChat</Text>
        <Text style={styles.logoSubtext}>Experience nostalgia</Text>
      </View>
      
      <Animated.View style={[styles.inputContainer, { transform: [{ translateX: shake }] }]}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          maxLength={20}
        />
      </Animated.View>
      
      <View style={styles.createChatContainer}>
        <Text style={styles.label}>Create New Room:</Text>
        <View style={styles.createChatRow}>
          <TextInput
            style={[styles.input, styles.createChatInput]}
            value={chatName}
            onChangeText={setChatName}
            placeholder="Enter chat room name"
            maxLength={30}
          />
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => handleJoin()}
          >
            <LinearGradient
              colors={['#0071bc', '#005a93']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Create</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Join Existing Rooms:</Text>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={item => item.id}
        style={styles.chatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f0f0',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0071bc',
  },
  logoSubtext: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    height: 40,
  },
  createChatContainer: {
    marginBottom: 20,
  },
  createChatRow: {
    flexDirection: 'row',
  },
  createChatInput: {
    flex: 1,
    marginRight: 10,
  },
  createButton: {
    width: 80,
    height: 40,
    borderRadius: 5,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chatList: {
    flex: 1,
  },
  chatRoomItem: {
    marginBottom: 10,
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  chatRoomGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chatRoomName: {
    fontSize: 16,
    color: '#333',
  },
  userCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  userCount: {
    fontSize: 14,
    color: '#555',
  },
});