import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { connectToChat, sendMessage } from '../utils/wsClient';

export default function ChatScreen({ route, navigation }) {
  const { username, chatName } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [bounce] = useState(new Animated.Value(0));
  const flatListRef = useRef(null);
  
  useEffect(() => {
    const systemMsg = {
      id: Date.now().toString(),
      sender: 'System',
      text: `Welcome to ${chatName}! You joined as "${username}"`,
      timestamp: new Date(),
      system: true
    };
    
    setMessages([systemMsg]);
    
    const { socket, disconnect } = connectToChat(username, chatName);
    
    socket.onopen = () => {
      setIsConnected(true);
      startBounce();
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString() + Math.random().toString(),
          sender: data.sender,
          text: data.text,
          timestamp: new Date(data.timestamp),
          system: data.system || false
        }
      ]);
    };
    
    socket.onclose = () => {
      setIsConnected(false);
    };
    
    return () => {
      disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const startBounce = () => {
    Animated.sequence([
      Animated.timing(bounce, { toValue: -10, duration: 300, useNativeDriver: true }),
      Animated.spring(bounce, { toValue: 0, friction: 4, useNativeDriver: true })
    ]).start();
  };
  
  const handleSend = () => {
    if (!message.trim() || !isConnected) return;
    
    sendMessage(username, message.trim());
    setMessage('');
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderMessage = ({ item }) => {
    const isMe = item.sender === username;
    const isSystem = item.system;
    
    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.text}</Text>
          <Text style={styles.timestamp}>{formatTime(new Date(item.timestamp))}</Text>
        </View>
      );
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMe && (
            <Text style={styles.senderName}>{item.sender}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isMe ? styles.myTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(new Date(item.timestamp))}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Animated.View 
        style={[
          styles.connectionStatus, 
          isConnected ? styles.connected : styles.disconnected,
          { transform: [{ translateY: bounce }] }
        ]}
      >
        <Text style={styles.connectionText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </Animated.View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.disabledButton]}
          onPress={handleSend}
          disabled={!message.trim() || !isConnected}
        >
          <LinearGradient
            colors={!message.trim() ? ['#ccc', '#aaa'] : ['#0071bc', '#005a93']}
            style={styles.sendButtonGradient}
          >
            <Text style={styles.sendIcon}>▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6',
  },
  connectionStatus: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  connected: {
    backgroundColor: '#a3d39c',
  },
  disconnected: {
    backgroundColor: '#f5a9a9',
  },
  connectionText: {
    fontSize: 12,
    color: '#333',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 10,
    padding: 10,
    minWidth: 80,
  },
  myMessageBubble: {
    backgroundColor: '#dcf8c6',
    borderWidth: 1,
    borderColor: '#c3e6b4',
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0071bc',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
  },
  myMessageText: {
    color: '#333',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: '#7b8b6f',
  },
  otherTimestamp: {
    color: '#999',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessage: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 16,
    color: '#fff',
  },
});