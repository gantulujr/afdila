export interface CodeFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export const expoFiles: CodeFile[] = [
  {
    name: "App.tsx",
    path: "App.tsx",
    language: "typescript",
    content: `import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';

export default function App() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#075E54" />
      <View style={styles.content}>
        {selectedPhone ? (
          <ChatScreen 
            phone={selectedPhone} 
            onBack={() => setSelectedPhone(null)} 
          />
        ) : (
          <ChatListScreen 
            onSelectChat={(phone) => setSelectedPhone(phone)} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#128C7E', // WhatsApp dark green header bar
  },
  content: {
    flex: 1,
    backgroundColor: '#ece5dd', // Classic WhatsApp background color
  }
});`
  },
  {
    name: "ChatListScreen.tsx",
    path: "screens/ChatListScreen.tsx",
    language: "typescript",
    content: `import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Search, MessageSquare, Phone, MoreVertical } from 'lucide-react-native'; // Use lucide-react-native or your favorite icon kit

interface ChatRoom {
  phone: string;
  lastMessage: string;
  timestamp: any;
  unreadCount: number;
}

interface ChatListScreenProps {
  onSelectChat: (phone: string) => void;
}

export default function ChatListScreen({ onSelectChat }: ChatListScreenProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference chats collection
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('timestamp', 'desc'));

    // Real-time onSnapshot listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: any[] = [];
      snapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() });
      });

      // Group and aggregate messages by phone number to yield virtual chat rooms
      const roomsMap: { [key: string]: { messages: any[], lastMsg: any } } = {};
      
      messagesList.forEach((msg) => {
        if (!msg.phone) return;
        const phone = msg.phone;
        if (!roomsMap[phone]) {
          roomsMap[phone] = { messages: [], lastMsg: msg };
        }
        roomsMap[phone].messages.push(msg);
      });

      const roomsArray: ChatRoom[] = Object.keys(roomsMap).map((phone) => {
        const roomData = roomsMap[phone];
        // Sort individual room messages desc
        const sortedMsgs = [...roomData.messages].sort((a,b) => b.timestamp?.seconds - a.timestamp?.seconds);
        const lastMsgObj = sortedMsgs[0] || roomData.lastMsg;
        
        // Count simulated unread messages (where role is 'user' and they came after our last admin msg)
        const unreadCount = sortedMsgs.filter(m => m.role === 'user').slice(0, 3).length; // Simulated logic

        return {
          phone,
          lastMessage: lastMsgObj.message || '',
          timestamp: lastMsgObj.timestamp,
          unreadCount: lastMsgObj.role === 'user' ? unreadCount : 0
        };
      });

      setChatRooms(roomsArray);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Chat List Error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRooms = chatRooms.filter(room => 
    room.phone.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => onSelectChat(item.phone)}
      activeOpacity={0.7}
    >
      {/* Avatar Container */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.phone.substring(0, 2).replace('+', '')}
        </Text>
      </View>

      {/* Info Container */}
      <View style={styles.chatDetails}>
        <View style={styles.titleRow}>
          <Text style={styles.phoneNumber} numberOfLines={1}>{item.phone}</Text>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#075E54" />
        <Text style={styles.loadingText}>Loading Inbox...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* WhatsApp Green Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WA Mobile CRM</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MoreVertical size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.activeTabLabel}>CHATS ({chatRooms.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabLabel}>PIPELINE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabLabel}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* Inner search bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Cari nomor HP atau isi pesan..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={52} color="#ccc" />
          <Text style={styles.emptyText}>Tidak ada pesan WhatsApp.</Text>
          <Text style={styles.emptySubtext}>Hubungkan webhook Anda untuk menerima pesan masuk.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.phone}
          renderItem={renderItem}
          itemLayoutAnimation={null} // Keeps scroll stable
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#075E54',
    fontFamily: 'System',
    fontWeight: '600',
  },
  header: {
    height: 60,
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 20,
  },
  tabRow: {
    flexDirection: 'row',
    height: 44,
    backgroundColor: '#075E54',
    borderBottomWidth: 1,
    borderBottomColor: '#128C7E',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
  },
  tabLabel: {
    color: '#b0d4cf',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchBarContainer: {
    padding: 10,
    backgroundColor: '#f6f6f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e2e2e2',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34B7F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  }
});`
  },
  {
    name: "ChatScreen.tsx",
    path: "screens/ChatScreen.tsx",
    language: "typescript",
    content: `import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sendWhatsAppMessage } from '../services/whatsapp';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react-native';

interface Message {
  id: string;
  phone: string;
  message: string;
  role: 'user' | 'admin';
  timestamp: any;
}

interface ChatScreenProps {
  phone: string;
  onBack: () => void;
}

export default function ChatScreen({ phone, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Listen to messages for the current active phone number, sorted chronologically
    const messagesRef = collection(db, 'chats');
    const q = query(
      messagesRef, 
      where('phone', '==', phone),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsList: Message[] = [];
      snapshot.forEach((doc) => {
        msgsList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgsList);
      setLoading(false);
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, (error) => {
      console.error("Firestore onSnapshot error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [phone]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      setSending(true);

      // 1. Simpan ke Firebase Firestore (role: admin)
      await addDoc(collection(db, 'chats'), {
        phone: phone,
        message: text,
        role: 'admin',
        timestamp: serverTimestamp() // Gunakan Server Timestamp dari Firestore
      });

      // 2. Kirim ke WhatsApp Cloud API via WhatsApp Service
      const result = await sendWhatsAppMessage(phone, text);
      
      console.log('WhatsApp Send Result:', result);
    } catch (err) {
      console.error('Gagal mengirim pesan:', err);
    } finally {
      setSending(false);
      // Auto Scroll ke bawah usai mengirim
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#075E54" />
        <Text style={styles.loadingText}>Memuat percakapan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Mobile-centric Header info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Avatar mini */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{phone.substring(0, 2).replace('+', '')}</Text>
        </View>

        {/* Name and State Status */}
        <View style={styles.headerInfo}>
          <Text style={styles.phoneText} numberOfLines={1}>{phone}</Text>
          <Text style={styles.onlineStatus}>Online (WhatsApp API)</Text>
        </View>

        {/* Utilities Bar */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Phone size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Video size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messaging Stream Window */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble item={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <ChatInput onSend={handleSendMessage} disabled={sending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efe7dd', // Sand texture background
  },
  keyboardView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#075E54',
  },
  header: {
    height: 60,
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34B7F1',
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  phoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineStatus: {
    color: '#b2dfdb',
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 5,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
});`
  },
  {
    name: "ChatBubble.tsx",
    path: "components/ChatBubble.tsx",
    language: "typescript",
    content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageItem {
  message: string;
  role: 'user' | 'admin';
  timestamp: any;
}

interface ChatBubbleProps {
  item: MessageItem;
}

export default function ChatBubble({ item }: ChatBubbleProps) {
  const isAdmin = item.role === 'admin';

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    // Handle Firestore server timestamp vs regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <View style={[styles.messageRow, isAdmin ? styles.alignRight : styles.alignLeft]}>
      <View style={[styles.bubble, isAdmin ? styles.adminBubble : styles.userBubble]}>
        {/* Tail effect spacing can be handled via CSS/borders */}
        <Text style={styles.messageText}>{item.message}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          {isAdmin && (
            <Text style={styles.tickText}>✓✓</Text> // High fidelity delivery ticks
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginBottom: 6,
    width: '100%',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 1, // subtle shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: '#ffffff', // Gray/White for user message
    borderTopLeftRadius: 0,
  },
  adminBubble: {
    backgroundColor: '#dcf8c6', // WhatsApp signature light green bubble
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 15,
    color: '#262626',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 10,
    color: '#8c8c8c',
  },
  tickText: {
    fontSize: 11,
    color: '#34b7f1',
    marginLeft: 3,
    fontWeight: 'bold',
  },
});`
  },
  {
    name: "ChatInput.tsx",
    path: "components/ChatInput.tsx",
    language: "typescript",
    content: `import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send, Smile, Paperclip, Camera } from 'lucide-react-native';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Emoji Icon Triggers */}
        <TouchableOpacity style={styles.iconButton}>
          <Smile size={24} color="#777" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Ketik pesan..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        {/* Attachment triggers */}
        <TouchableOpacity style={styles.iconButton}>
          <Paperclip size={20} color="#777" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Camera size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {/* Rounded Send Button */}
      <TouchableOpacity 
        style={[styles.sendButton, !text.trim() && styles.disabledSend]} 
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        activeOpacity={0.8}
      >
        <Send size={20} color="#fff" style={styles.sendIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 12,
    maxHeight: 120, // allows input expansion
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#000',
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  disabledSend: {
    backgroundColor: '#9e9e9e',
  },
  sendIcon: {
    marginLeft: 3, // nudge for optical centering
  },
});`
  },
  {
    name: "firebase.ts",
    path: "services/firebase.ts",
    language: "typescript",
    content: `// Firebase configuration details for Expo mobile app
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// PENTING: Gantilah konfigurasi ini dengan kredensial Firebase Console Anda.
// Anda direkomendasikan menggunakan file .env untuk mengamankan data sensitif ini.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Menginisialisasi Firebase SDK
const app = initializeApp(firebaseConfig);

// Mendapatkan instance Firestore database
export const db = getFirestore(app);`
  },
  {
    name: "whatsapp.ts",
    path: "services/whatsapp.ts",
    language: "typescript",
    content: `import axios from 'axios';

// Kredensial WhatsApp Cloud API (Meta Developers)
// Diperoleh dari dashboard pengembang Meta
const WHATSAPP_TOKEN = process.env.EXPO_PUBLIC_WHATSAPP_TOKEN || "YOUR_WHATSAPP_SYSTEM_USER_ACCESS_TOKEN";
const PHONE_NUMBER_ID = process.env.EXPO_PUBLIC_PHONE_NUMBER_ID || "YOUR_PHONE_NUMBER_ID";

/**
 * Mengirim balasan pesan teks langsung ke WhatsApp Messenger user melalui Meta Cloud API.
 * 
 * @param phone Nomor telepon target dengan format kode negara (co: +62812345678)
 * @param message Teks isi pesan/balasan
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  // Format nomor HP agar bersih dari karakter non-numerik (kecuali angka)
  const cleanedPhone = phone.replace(/[^0-9]/g, '');

  if (!WHATSAPP_TOKEN || WHATSAPP_TOKEN.includes("YOUR")) {
    console.warn("Kredensial WhatsApp Token kosong. Melewati pengiriman Meta API (Simulated mode).");
    return { simulated: true, status: "success", message: "Mock message sent locally because Cloud credentials are not configured." };
  }

  const endpoint = \`https://graph.facebook.com/v19.0/\${PHONE_NUMBER_ID}/messages\`;
  
  const headers = {
    'Authorization': \`Bearer \${WHATSAPP_TOKEN}\`,
    'Content-Type': 'application/json',
  };

  const payload = {
    messaging_product: "whatsapp",
    to: cleanedPhone, // Harus menyertakan kode negara (misalkan 628123456789)
    type: "text",
    text: {
      body: message
    }
  };

  try {
    const response = await axios.post(endpoint, payload, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error saat melakukan HIT ke WhatsApp Cloud API:', error?.response?.data || error.message);
    throw new Error(JSON.stringify(error?.response?.data || error.message));
  }
}`
  },
  {
    name: "package.json",
    path: "package.json",
    language: "json",
    content: `{
  "name": "whatsapp-mobile-crm",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "ts:check": "tsc"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "firebase": "^10.12.0",
    "axios": "^1.6.8",
    "lucide-react-native": "^0.379.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "~5.3.3"
  },
  "private": true
}`
  },
  {
    name: "app.json",
    path: "app.json",
    language: "json",
    content: `{
  "expo": {
    "name": "WhatsApp Mobile CRM",
    "slug": "whatsapp-mobile-crm",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#075e54"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.crm.whatsapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#128c7e"
      },
      "package": "com.crm.whatsapp"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}`
  },
  {
    name: "expo.env",
    path: ".env",
    language: "bash",
    content: `# EXPO MOBILE CRM SETTINGS

# 1. FIREBASE CONFIGURATION
EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSyA..."
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="whatsapp-crm-xyz.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="whatsapp-crm-xyz"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="whatsapp-crm-xyz.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
EXPO_PUBLIC_FIREBASE_APP_ID="1:123456:web:abcd123"

# 2. WHATSAPP CLOUD API CONFIGURATION (META DEV)
EXPO_PUBLIC_WHATSAPP_TOKEN="EAAGb3f6..."
EXPO_PUBLIC_PHONE_NUMBER_ID="123456789012345"`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    content: `# WhatsApp Mobile CRM - Chat Inbox App
WhatsApp Mobile CRM adalah aplikasi template Expo (React Native) siap-pakai untuk menyinkronkan chat WhatsApp Cloud API ke Firebase Firestore secara dua-arah (real-time).

---

## 🚀 Langkah Installas & Setup (Quick Start)

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal alat-alat berikut di perangkat Anda:
- **Node.js** (Rekomendasi v18 ke atas)
- **Git**
- **Expo Go** app terinstal di perangkat seluler pintar Anda (Android / iOS)

### 2. Kloning dan Instalasi Dependensi
\`\`\`bash
# Buat folder baru
mkdir whatsapp-crm
cd whatsapp-crm

# Buat berkas-berkas sesuai dengen struktur proyek:
# - App.tsx
# - screens/ChatListScreen.tsx
# - screens/ChatScreen.tsx
# - components/ChatBubble.tsx
# - components/ChatInput.tsx
# - services/firebase.ts
# - services/whatsapp.ts

# Instal paket npm wajib
npm install
\`\`\`

### 3. Mengatur Environment Variables
Buat berkas bernama \`.env\` di akar proyek Anda (sejajar dengan \`App.tsx\`), dan isi kredensial berikut:
\`\`\`bash
EXPO_PUBLIC_FIREBASE_API_KEY="API_KEY_ANDA"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="PROJECT_ID_ANDA"
EXPO_PUBLIC_WHATSAPP_TOKEN="TOKEN_TEMPORARY_ATAU_PERMANEN_META"
EXPO_PUBLIC_PHONE_NUMBER_ID="PHONE_NUMBER_ID_DARI_META"
\`\`\`

---

## 📦 Menghubungkan Firebase & WhatsApp Webhook

### Langkah 1: Kebutuhan Firestore-Schema
Buatlah koleksi bernama **\`chats\`** di Firebase Firestore database Anda dengan struktur berikut:
| Field | Tipe | Contoh Nilai | Deskripsi |
| :--- | :--- | :--- | :--- |
| **phone** | string | \`+62812345678\` | Nomor WA Client dengan format telp utuh |
| **message** | string | \`Halo, selamat pagi\` | Isi pesan teks balasan |
| **role** | string | \`admin\` atau \`user\` | \`user\` = Pesan Masuk, \`admin\` = Balasan Agent |
| **timestamp** | timestamp | \`ServerTimestamp\` | Waktu penerimaan/pengiriman pesan |

### Langkah 2: Setup Webhook WhatsApp (Menerima Pesan Masuk)
Supaya status chat terupdate secara otomatis dan memicu respons real-time (pesan masuk dari user), Anda harus mengonfigurasi webhook HTTPS yang menyalurkan payload Meta Developers ke database Firebase Anda.
1. **Buat Server Webhook Node.js / Cloud Function** yang menerima Payload POST dari Meta.
2. Saat Meta mengirimkan payload chat baru, masukkan datanya ke Firestore koleksi \`chats\` sebagai:
   - \`phone\`: nomor pengirim
   - \`message\`: isi teks
   - \`role\`: \`user\`
   - \`timestamp\`: Tanggal sistem saat ini.
3. Aplikasi mobile CRM akan secara otomatis memperbarui list chat berkat listener \`onSnapshot()\`!

---

## 📱 Menjalankan Aplikasi di Expo Go

\`\`\`bash
# Jalankan bundler Expo
npx expo start
\`\`\`

- **Android:** Buka aplikasi **Expo Go**, ketuk "Scan QR Code" dan pindai kode QR di terminal Anda.
- **iOS:** Buka kamera bawaan, deteksi kode QR, klik tautan Expo Go untuk membuka.`
  }
];
