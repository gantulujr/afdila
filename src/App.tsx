import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  Video, 
  Send, 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Settings, 
  Code, 
  Sparkles, 
  BookOpen, 
  FileCode, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Server, 
  RefreshCw, 
  Sliders, 
  X, 
  FileText, 
  Smartphone, 
  AlertCircle, 
  MessageCircle,
  Clock,
  CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { expoFiles, CodeFile } from "./data/expoFiles";

interface SimulatorMessage {
  id: string;
  phone: string;
  message: string;
  role: "user" | "admin";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface SimulatedRoom {
  phone: string;
  name: string;
  unreadCount: number;
  avatarColor: string;
}

export default function App() {
  // Mobile Simulator Navigation & State
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);
  const [rooms, setRooms] = useState<SimulatedRoom[]>([
    { phone: "+6281276543210", name: "Budi Santoso", unreadCount: 1, avatarColor: "bg-emerald-500" },
    { phone: "+6285643218901", name: "Rina Wijaya", unreadCount: 2, avatarColor: "bg-blue-500" },
    { phone: "+6281988004411", name: "Dev Developer", unreadCount: 0, avatarColor: "bg-indigo-500" },
    { phone: "+16505550199", name: "Smith Tech QA", unreadCount: 0, avatarColor: "bg-orange-500" }
  ]);

  const [messages, setMessages] = useState<SimulatorMessage[]>([
    { id: "1", phone: "+6281276543210", message: "Halo Admin, saya mau tanya harga paket CRM WhatsApp.", role: "user", timestamp: new Date(Date.now() - 3600000 * 3), status: "read" },
    { id: "2", phone: "+6281276543210", message: "Baik pak Budi, paket Basic mulai dari Rp 150rb/bulan.", role: "admin", timestamp: new Date(Date.now() - 3600000 * 2.5), status: "read" },
    { id: "3", phone: "+6281276543210", message: "Apakah harga tersebut sudah termasuk nominal deposit dari Meta?", role: "user", timestamp: new Date(Date.now() - 600000), status: "sent" },

    { id: "4", phone: "+6285643218901", message: "Apakah sistem ini bisa broadcast ke 10.000 kontak sekaligus?", role: "user", timestamp: new Date(Date.now() - 3600000 * 12), status: "read" },
    { id: "5", phone: "+6285643218901", message: "Bisa kak Rina! CRM ini dilengkapi fitur Scheduler dan Broadcast List resmi WhatsApp API.", role: "admin", timestamp: new Date(Date.now() - 3600000 * 11), status: "read" },
    { id: "6", phone: "+6285643218901", message: "Wah oke, cara integrasi database internalnya bagaimama ya?", role: "user", timestamp: new Date(Date.now() - 3600000 * 10), status: "sent" },

    { id: "7", phone: "+6281988004411", message: "Halo, saya sedang menguji Webhook dari Meta Developer.", role: "user", timestamp: new Date(Date.now() - 3600000 * 24), status: "read" },
    { id: "8", phone: "+6281988004411", message: "Siap, silakan kirimkan payload payload JSON-template kesini.", role: "admin", timestamp: new Date(Date.now() - 3600000 * 23), status: "read" }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [newRoomPhone, setNewRoomPhone] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);

  // CRM Config States
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [firebaseApiKey, setFirebaseApiKey] = useState("");
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [useRealConnection, setUseRealConnection] = useState(false);

  // Exporter / Code IDE States
  const [activeTab, setActiveTab] = useState<"code" | "config" | "guide">("code");
  const [selectedFile, setSelectedFile] = useState<CodeFile>(expoFiles[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [searchFileQuery, setSearchFileQuery] = useState("");

  // System Terminal Logs
  const [logs, setLogs] = useState<Array<{ time: string; type: "info" | "success" | "warn" | "error"; msg: string }>>([
    { time: new Date().toLocaleTimeString(), type: "info", msg: "WhatsApp CRM Mobile Simulator loaded." },
    { time: new Date().toLocaleTimeString(), type: "info", msg: "Mock Firestore 'onSnapshot()' listener initiated." },
    { time: new Date().toLocaleTimeString(), type: "success", msg: "Workspace ready. Tap code files on right to export." }
  ]);

  const addLog = (type: "info" | "success" | "warn" | "error", msg: string) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), type, msg }, ...prev.slice(0, 49)]);
  };

  const phoneChatEndRef = useRef<HTMLDivElement>(null);

  // Sync scroll to chat end in simulator
  useEffect(() => {
    phoneChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentPhone, isTyping]);

  // Handle simulated responses
  const triggerAutoReply = (phone: string, text: string) => {
    setIsTyping(phone);
    addLog("info", `User ${phone} is typing a simulated response...`);
    
    setTimeout(() => {
      setIsTyping(null);
      const randomReplies = [
        "Terima kasih atas informasinya, nanti saya hubungi lagi.",
        "Sangat jelas penjelasannya! Apakah ada panduan tertulisnya?",
        "Baik, saya akan coba setup dulu di dashboard pengembang Meta saya.",
        "Oke admin, tolong kirimkan faktur penawarannya lewat WhatsApp ini ya.",
        "Halo, tes masuk. webhooknya responsif sekali!",
        "Mantap responnya cepat sekali! WhatsApp CRM ini sangat membantu bisnis saya."
      ];
      const randomMsg = randomReplies[Math.floor(Math.random() * randomReplies.length)];
      
      const newMsg: SimulatorMessage = {
        id: Math.random().toString(),
        phone,
        message: randomMsg,
        role: "user",
        timestamp: new Date(),
        status: "read"
      };

      setMessages(prev => [...prev, newMsg]);
      
      // Update room last message/unread count
      setRooms(prev => prev.map(r => {
        if (r.phone === phone) {
          return {
            ...r,
            unreadCount: currentPhone === phone ? 0 : r.unreadCount + 1
          };
        }
        return r;
      }));

      addLog("success", `[Webhook Event] Received message from ${phone}: "${randomMsg}"`);
    }, 2500);
  };

  // Sending message logic in simulator
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentPhone) return;

    const typedText = inputMessage;
    setInputMessage("");

    // 1. Add locally
    const adminMsg: SimulatorMessage = {
      id: Math.random().toString(),
      phone: currentPhone,
      message: typedText,
      role: "admin",
      timestamp: new Date(),
      status: "sent"
    };

    setMessages(prev => [...prev, adminMsg]);
    addLog("info", `[Firestore] Writing admin message to chats collection: "${typedText}"`);

    // Simulate delivery ticks
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === adminMsg.id ? { ...m, status: "delivered" } : m));
    }, 500);

    // 2. Clear unread for active chat
    setRooms(prev => prev.map(r => r.phone === currentPhone ? { ...r, unreadCount: 0 } : r));

    // 3. Connect to Real Node Backend Proxy if toggled, or run Simulated Mode
    if (useRealConnection && (waToken || waPhoneId)) {
      addLog("info", `[Meta API] Directing HTTP request to API proxy backend for WhatsApp Cloud API...`);
      try {
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: currentPhone,
            message: typedText,
            token: waToken,
            phoneNumberId: waPhoneId
          })
        });

        const data = await res.json();
        if (data.success || data.simulated) {
          addLog("success", `[Meta API Success] Response: ${JSON.stringify(data.apiResponse || data)}`);
          setMessages(prev => prev.map(m => m.id === adminMsg.id ? { ...m, status: "read" } : m));
        } else {
          addLog("error", `[Meta API Error] ${JSON.stringify(data.error)}`);
        }
      } catch (err: any) {
        addLog("error", `Failed to route WhatsApp proxy request: ${err.message}`);
      }
    } else {
      // Offline Simulated WhatsApp sending
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === adminMsg.id ? { ...m, status: "read" } : m));
        addLog("success", `[Simulated WhatsApp send] Sent to ${currentPhone}. Payload matching Meta standard JSON body structured.`);
      }, 1000);

      // Trigger automatic receipt webhook back from the customer user
      triggerAutoReply(currentPhone, typedText);
    }
  };

  // Add custom contact / lead
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomPhone.trim() || !newRoomName.trim()) return;

    const formattedPhone = newRoomPhone.startsWith("+") ? newRoomPhone : `+${newRoomPhone}`;
    
    // Check duplication
    if (rooms.some(r => r.phone === formattedPhone)) {
      addLog("warn", `Nomor ${formattedPhone} sudah ada dalam inbox CRM.`);
      return;
    }

    const bgColors = ["bg-emerald-500", "bg-sky-500", "bg-indigo-500", "bg-pink-500", "bg-rose-500", "bg-teal-500", "bg-violet-500"];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const newRoom: SimulatedRoom = {
      phone: formattedPhone,
      name: newRoomName,
      unreadCount: 0,
      avatarColor: randomBg
    };

    setRooms(prev => [newRoom, ...prev]);
    
    // Initial welcome message from client
    const initMsg: SimulatorMessage = {
      id: Math.random().toString(),
      phone: formattedPhone,
      message: `Halo CRM admin! Saya baru saja mengunjungi web Anda dari nomor ${formattedPhone}.`,
      role: "user",
      timestamp: new Date(),
      status: "sent"
    };

    setMessages(prev => [...prev, initMsg]);

    setNewRoomName("");
    setNewRoomPhone("");
    setShowAddRoom(false);
    setCurrentPhone(formattedPhone);
    
    addLog("success", `Lead WhatsApp baru terdaftar: ${newRoomName} (${formattedPhone})`);
  };

  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(selectedFile.path);
    addLog("success", `Disalin ke clipboard: ${selectedFile.name}`);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const filteredRooms = rooms.filter(r => 
    r.phone.includes(searchQuery) || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomLastMessage = (phone: string) => {
    const roomMsgs = messages.filter(m => m.phone === phone);
    if (roomMsgs.length === 0) return "Tidak ada pesan";
    return roomMsgs[roomMsgs.length - 1];
  };

  const getUnreadCount = (phone: string) => {
    const r = rooms.find(room => room.phone === phone);
    return r ? r.unreadCount : 0;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  return (
    <div className="min-h-screen bg-[#070b0d] text-slate-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="border-b border-slate-800 bg-[#0c1317]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-[#0c1317] p-2 rounded-xl flex items-center justify-center font-bold">
            <MessageCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              WhatsApp Mobile CRM <span className="text-xs bg-emerald-500/10 text-emerald-400 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/20">Production-Ready Expo</span>
            </h1>
            <p className="text-xs text-slate-400">Live Simulator Workspace & React Native Code Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Virtual Sandbox Online</span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <p className="text-slate-400 hidden md:block">Time: <span className="font-mono text-slate-300">16:44 UTC</span></p>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: WhatsApp Phone Sandbox (cols 1-5 on large screens) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-start">
          <div className="text-left w-full mb-3">
            <h2 className="text-sm font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" /> WhatsApp Phone Simulator
            </h2>
          </div>

          {/* Genuine Phone Shell Casing */}
          <div className="relative w-full max-w-[370px] aspect-[9/19] bg-[#0c0f12] rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800/80 flex flex-col overflow-hidden">
            
            {/* Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#0c0f12] rounded-b-2xl z-40 flex items-center justify-center gap-1.5 px-3">
              <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700/50"></div>
            </div>

            {/* Inner Mobile Screen Area */}
            <div className="flex-1 w-full h-full bg-[#111] rounded-[34px] overflow-hidden flex flex-col relative border border-slate-900 shadow-inner">
              
              {/* Phone Status Bar */}
              <div className="h-7 bg-[#075E54] text-[10px] text-emerald-100 flex items-center justify-between px-5 font-medium z-30 pt-1 select-none">
                <span className="font-mono">16:44</span>
                <span className="text-[9px] uppercase tracking-wide bg-emerald-700/60 px-1.5 py-0.5 rounded text-white font-normal">WA API Simulator</span>
                <div className="flex items-center gap-1">
                  <span>LTE</span>
                  <div className="w-4 h-2.5 border border-emerald-200/50 rounded-sm relative p-0.5 flex items-center">
                    <div className="bg-emerald-200 h-full w-4/5 rounded-2xs"></div>
                  </div>
                </div>
              </div>

              {/* Chat View Conditional Switch */}
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[#ece5dd]">
                
                {/* 1. CHAT LIST SCREEN */}
                {!currentPhone ? (
                  <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 h-full relative">
                    
                    {/* Header bar */}
                    <div className="bg-[#075E54] text-white px-4 py-3 flex flex-col shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">WA Mobile CRM</span>
                        <div className="flex gap-4">
                          <Search className="w-5 h-5 opacity-90 cursor-pointer" />
                          <Settings className="w-5 h-5 opacity-90 cursor-pointer" onClick={() => addLog("info", "Settings menu clicked on simulated phone.")} />
                        </div>
                      </div>
                      
                      {/* Nav Tabs */}
                      <div className="flex text-xs font-bold mt-1 text-emerald-100/80">
                        <div className="flex-1 text-center py-2 border-b-2 border-white text-white">CHATS</div>
                        <div className="flex-1 text-center py-2 opacity-60">PROSPECTS</div>
                        <div className="flex-1 text-center py-2 opacity-60">API STATUS</div>
                      </div>
                    </div>

                    {/* Lead Search bar */}
                    <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                      <div className="flex-1 bg-white flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                        <input 
                          type="text" 
                          placeholder="Cari chat atau pesan..." 
                          className="w-full bg-transparent outline-none text-slate-800"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => setShowAddRoom(true)}
                        className="bg-[#128C7E] text-white p-2 rounded-lg hover:bg-[#075E54] transition-all"
                        title="Tambah Kontak WhatsApp Baru"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Chat Rooms List (FlatList simulation) */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                      {filteredRooms.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600">Tidak ada chat ditemukan</p>
                          <p className="text-slate-400 mt-0.5">Tambah leads baru atau hubungkan webhook</p>
                        </div>
                      ) : (
                        filteredRooms.map((room) => {
                          const lastMsg = getRoomLastMessage(room.phone);
                          return (
                            <div 
                              key={room.phone}
                              onClick={() => {
                                setCurrentPhone(room.phone);
                                // Reset unread count
                                setRooms(prev => prev.map(r => r.phone === room.phone ? { ...r, unreadCount: 0 } : r));
                              }}
                              className="px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                {/* Simulated Avatar */}
                                <div className={`w-11 h-11 rounded-full ${room.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                                  {room.name.substring(0, 2)}
                                </div>
                                <div className="max-w-[170px]">
                                  <h4 className="font-bold text-sm text-slate-800 truncate">{room.name}</h4>
                                  <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {typeof lastMsg === "string" ? lastMsg : (lastMsg.role === "admin" ? "✓✓ " : "") + lastMsg.message}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 text-[10px]">
                                <span className="text-slate-400">
                                  {typeof lastMsg === "string" ? "16.44" : lastMsg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {room.unreadCount > 0 && (
                                  <span className="bg-[#25D366] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1 select-none">
                                    {room.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Developer Info Bottom Pill */}
                    <div className="p-3 bg-emerald-50 border-t border-emerald-100 text-[10px] text-emerald-800 flex items-center gap-2">
                      <div className="p-1 bg-[#128C7E] text-white rounded-full">
                        <Terminal className="w-3 h-3" />
                      </div>
                      <p className="font-medium">Tekan kontak untuk menguji chat inbox & respons API</p>
                    </div>

                    {/* Dialog Model: Add custom simulated WhatsApp Number */}
                    {showAddRoom && (
                      <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <form onSubmit={handleAddRoom} className="bg-white rounded-2xl w-full p-4 shadow-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-800 text-sm">Simulasi Lead Baru</span>
                            <X className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setShowAddRoom(false)} />
                          </div>
                          
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[11px] text-slate-500 font-bold mb-1">NAMA CHAT/CUSTOMER</label>
                              <input 
                                type="text"
                                placeholder="co: Andi Wijaya"
                                required
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-[#128C7E]"
                                value={newRoomName}
                                onChange={e => setNewRoomName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-500 font-bold mb-1">NOMOR WA (+KODE NEGARA)</label>
                              <input 
                                type="text"
                                placeholder="co: +62812345678"
                                required
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-[#128C7E]"
                                value={newRoomPhone}
                                onChange={e => setNewRoomPhone(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-4 text-xs font-bold">
                            <button 
                              type="button" 
                              onClick={() => setShowAddRoom(false)}
                              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                            >
                              Batal
                            </button>
                            <button 
                              type="submit" 
                              className="px-3 py-1.5 bg-[#128C7E] text-white rounded-lg"
                            >
                              Tambah Leads
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  
                  /* 2. CHAT DETAILS SCREEN */
                  <div className="flex-1 flex flex-col h-full bg-[#efe7dd] relative text-slate-900">
                    
                    {/* Header of Chat Screen */}
                    <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shadow-md z-10 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setCurrentPhone(null)}
                          className="p-1 hover:bg-emerald-700/50 rounded-full transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 focus:outline-none" />
                        </button>
                        
                        {/* Avatar */}
                        <div className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {rooms.find(r => r.phone === currentPhone)?.name.substring(0, 2) || "WA"}
                        </div>

                        {/* Caller Info */}
                        <div className="max-w-[130px]">
                          <h4 className="font-bold text-xs truncate text-white">
                            {rooms.find(r => r.phone === currentPhone)?.name || currentPhone}
                          </h4>
                          <p className="text-[10px] text-emerald-100 opacity-90 truncate">Online (Meta API)</p>
                        </div>
                      </div>

                      {/* Top utilities */}
                      <div className="flex gap-3 text-white opacity-90">
                        <Video className="w-4 h-4 cursor-not-allowed" />
                        <Phone className="w-4 h-4 cursor-not-allowed" />
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 relative scroll-smooth flex flex-col">
                      <div className="mx-auto my-1.5 bg-sky-100 border border-sky-200/50 text-[#0c2e44] text-[9px] px-3 py-1 rounded-md text-center shadow-2xs max-w-[90%] font-medium">
                        🛡️ Pesan diamankan di database Firestore Anda dengan verifikasi token Meta Cloud API.
                      </div>

                      {messages
                        .filter(m => m.phone === currentPhone)
                        .map((msg) => {
                          const isAdmin = msg.role === "admin";
                          return (
                            <div 
                              key={msg.id}
                              className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`p-2.5 rounded-xl max-w-[80%] shadow-2xs relative text-xs text-slate-800 ${
                                isAdmin 
                                  ? "bg-[#DCF8C6] rounded-tr-none text-right" 
                                  : "bg-white rounded-tl-none text-left"
                              }`}>
                                <p className="text-left select-text whitespace-pre-wrap">{msg.message}</p>
                                
                                <div className="flex items-center justify-end gap-1 text-[8px] text-slate-400 mt-1 select-none">
                                  <span>{formatMessageTime(msg.timestamp)}</span>
                                  {isAdmin && (
                                    <span>
                                      {msg.status === "sent" && <span className="text-slate-400">✓</span>}
                                      {msg.status === "delivered" && <span className="text-slate-400">✓✓</span>}
                                      {msg.status === "read" && <span className="text-sky-500 font-bold"><CheckCheck className="w-3.5 h-3.5 inline text-[#34b7f1]" /></span>}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Realtime customer typing state simulator */}
                      {isTyping === currentPhone && (
                        <div className="flex w-full justify-start">
                          <div className="bg-white px-3 py-2 rounded-xl rounded-tl-none shadow-2xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                          </div>
                        </div>
                      )}

                      <div ref={phoneChatEndRef}></div>
                    </div>

                    {/* Bottom message composite bar */}
                    <div className="p-1.5 bg-[#f0f0f0] border-t border-slate-300 flex items-center gap-1.5 sticky bottom-0 shrink-0">
                      <div className="flex-1 bg-white flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-xs">
                        <input 
                          type="text" 
                          placeholder="Ketik balasan CRM..." 
                          className="w-full bg-transparent outline-none text-slate-800 py-0.5"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className={`p-2.5 rounded-full text-white flex items-center justify-center transition-all ${
                          inputMessage.trim() ? "bg-[#128C7E] hover:scale-105 active:scale-95" : "bg-slate-300"
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* Home indicator bar inside the frame */}
            <div className="h-5 w-full flex items-center justify-center z-40 select-none pb-1 mt-1.5">
              <div className="w-24 h-1 bg-slate-700/70 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Code Hub, Configuration & Developer Setup Guides */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
          
          {/* Top Panel Switching Tab */}
          <div className="flex bg-[#11191f] border border-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("code")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "code" 
                  ? "bg-[#1f2c34] text-emerald-400 font-bold border border-emerald-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-4 h-4" /> 📂 EXPO SOURCE CODE
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "config" 
                  ? "bg-[#1f2c34] text-emerald-400 font-bold border border-emerald-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-4 h-4" /> 🛠️ API & FIREBASE SETTINGS
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "guide" 
                  ? "bg-[#1f2c34] text-emerald-400 font-bold border border-emerald-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" /> 📖 INTERACTIVE SETUP GUIDE
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-[450px]">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: CODE EXPLORER */}
              {activeTab === "code" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#11191f] border border-slate-850 rounded-2xl flex-1 flex flex-col overflow-hidden"
                >
                  <div className="border-b border-slate-800 px-4 py-3 bg-[#0e141a] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white tracking-wide">Expo Project Source Code Bundle</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-slate-500 font-mono">React Native TS (Babel/ESLint)</span>
                      <button 
                        onClick={() => handleCopyCode(selectedFile.content)}
                        className="px-3 py-1.5 bg-[#128C7E] hover:bg-[#075E54] active:scale-95 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2"
                      >
                        {copiedFile === selectedFile.path ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedFile === selectedFile.path ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                  </div>

                  {/* Code Workspace Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 flex-1 divide-x divide-slate-800 overflow-hidden h-full">
                    
                    {/* File Directory Sidebar */}
                    <div className="col-span-1 md:col-span-4 bg-[#0a0f13] overflow-y-auto p-3 text-xs flex flex-col h-full max-h-[500px]">
                      <div className="mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">PROJECT FILES</div>
                      <div className="space-y-1">
                        {expoFiles.map((file) => {
                          const isSel = selectedFile.path === file.path;
                          return (
                            <div 
                              key={file.path}
                              onClick={() => setSelectedFile(file)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                isSel 
                                  ? "bg-[#1d272f] text-emerald-400 font-medium border border-emerald-500/10" 
                                  : "text-slate-400 hover:bg-[#11191f] hover:text-slate-200"
                              }`}
                            >
                              <FileText className={`w-3.5 h-3.5 ${isSel ? "text-emerald-400" : "text-slate-500"}`} />
                              <div className="truncate">
                                <p className="font-mono text-left">{file.name}</p>
                                <p className="text-[9px] text-slate-500 font-mono">{file.path}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-800">
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/15 rounded-xl">
                          <h4 className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Expo Go Compatible
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            All files can be extracted directly to your React Native Expo directory without modifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Syntax Highlight Code Viewer */}
                    <div className="col-span-1 md:col-span-8 flex flex-col bg-[#11191f] h-full overflow-hidden max-h-[500px]">
                      <div className="px-4 py-2 bg-[#0d1217] text-[11px] text-slate-500 font-mono flex items-center justify-between border-b border-slate-800">
                        <span>Directory Path: /<span className="text-emerald-400">{selectedFile.path}</span></span>
                        <span className="text-slate-500 uppercase font-bold">{selectedFile.language}</span>
                      </div>
                      <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-350 leading-relaxed bg-[#0b0f12]">
                        <pre className="text-left select-all whitespace-pre">
                          {selectedFile.content}
                        </pre>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 2: ACTIVE API & FIREBASE CRM CONFIG */}
              {activeTab === "config" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#11191f] border border-slate-800 rounded-2xl p-5 flex flex-col gap-5 flex-1"
                >
                  <div className="flex flex-col gap-1.5 border-b border-slate-800 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-emerald-400" /> WhatsApp Cloud API & Firestore Credentials
                    </h3>
                    <p className="text-xs text-slate-400">
                      Masukkan kredensial WhatsApp dan Firebase untuk mengaktifkan panggilan API nyata melalui server proxy Node container.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left: WhatsApp API Form */}
                    <div className="space-y-4 bg-[#0a0f13] border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-[#34b7f1] uppercase tracking-wide flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" /> 1. WhatsApp Cloud API (Meta Dev)
                      </h4>
                      
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1.5">SYSTEM USER PERMANENT TOKEN</label>
                          <input 
                            type="password"
                            placeholder="EAAGb3f6..."
                            className="w-full text-xs p-2.5 bg-[#11191f] border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            value={waToken}
                            onChange={(e) => setWaToken(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1.5">WHATSAPP PHONE NUMBER ID</label>
                          <input 
                            type="text"
                            placeholder="123456789012345"
                            className="w-full text-xs p-2.5 bg-[#11191f] border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            value={waPhoneId}
                            onChange={(e) => setWaPhoneId(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Firebase Custom Config Form */}
                    <div className="space-y-4 bg-[#0a0f13] border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Server className="w-4 h-4" /> 2. Firebase App Credentials
                      </h4>
                      
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1.5">FIREBASE API KEY</label>
                          <input 
                            type="password"
                            placeholder="AIzaSyA..."
                            className="w-full text-xs p-2.5 bg-[#11191f] border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            value={firebaseApiKey}
                            onChange={(e) => setFirebaseApiKey(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1.5">FIREBASE PROJECT ID</label>
                          <input 
                            type="text"
                            placeholder="whatsapp-crm-app-xyz"
                            className="w-full text-xs p-2.5 bg-[#11191f] border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            value={firebaseProjectId}
                            onChange={(e) => setFirebaseProjectId(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-500/15 rounded-xl gap-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        id="useRealConnection"
                        className="w-4.5 h-4.5 accent-emerald-500 cursor-pointer"
                        checked={useRealConnection}
                        onChange={(e) => {
                          setUseRealConnection(e.target.checked);
                          addLog("warn", e.target.checked ? "Switched to REAL Meta WhatsApp API proxying." : "Switched to Simulator Offline Sandbox.");
                        }}
                      />
                      <div>
                        <label htmlFor="useRealConnection" className="font-bold text-sm text-slate-200 cursor-pointer">
                          Hubungkan ke Meta WhatsApp API & Firebase Nyata
                        </label>
                        <p className="text-xs text-slate-400">
                          Saat aktif, pesan yang dikirim dari Simulator akan dicoba dikirim ke nomor HP asli lewat Meta Developers Server!
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                        useRealConnection 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {useRealConnection ? "PRODUCTION WEB PROXY" : "OFFLINE SANDBOX"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: GUIDE INTERAKTIF */}
              {activeTab === "guide" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#11191f] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 flex-1 overflow-y-auto max-h-[500px]"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" /> Panduan Step-by-Step WhatsApp Cloud & Firebase CRM
                    </h3>
                    <p className="text-xs text-slate-400">Ikuti instruksi komprehensif bahasa Indonesia ini untuk implementasi di perangkat lokal Anda.</p>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-300 text-left">
                    
                    {/* Section 1 */}
                    <div className="bg-[#0a0f13] p-4 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
                        <span className="bg-emerald-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                        Menyiapkan WhatsApp Business Cloud API di Meta Developer
                      </h4>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Buka portal <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Meta for Developers <ExternalLink className="w-3.5 h-3.5 inline" /></a> dan buat Akun Pengembang.</li>
                        <li>Ketuk <strong>"Create App"</strong>, pilih Use Case "Other" kemudian pilih <strong>"Business"</strong> sebagai tipe aplikasi Anda.</li>
                        <li>Di dalam Dashboard Produk, temukan lalu klik <strong>Set Up WhatsApp</strong>.</li>
                        <li>Meta akan secara otomatis mengalokasikan:
                          <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                            <li><strong>Temporary Access Token</strong> (Masa aktif 24 jam)</li>
                            <li><strong>Test Phone Number</strong> (Nomor penguji bawaan Meta, co: +1 555...)</li>
                            <li><strong>Phone Number ID</strong> (ID numerik bernilai 15 digit)</li>
                          </ul>
                        </li>
                        <li>Silakan masukkan nomor HP pribadi Anda sebagai nomor penerima SMS penguji di dashboard, kirim verifikasi OTP, lalu salin token ke berkas <span className="font-mono text-emerald-400">.env</span> Anda.</li>
                      </ol>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-[#0a0f13] p-4 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
                        <span className="bg-emerald-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                        Konfigurasi Firebase & Struktur Firestore Koleksi Chats
                      </h4>
                      <p className="mb-2 text-slate-400">Mengapa aplikasi CRM Mobile ini bisa memperbarui obrolan secara real-time? Ini karena penggunaan listener <span className="font-mono text-emerald-300">onSnapshot()</span>. Konfigurasinya:</p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>Buka konsol Firebase, buat proyek baru, lalu aktifkan database <strong>Cloud Firestore</strong>.</li>
                        <li>Buat koleksi utama bernama <strong>"chats"</strong>.</li>
                        <li>Pastikan aturan keamanan Firestore (<span className="font-mono text-emerald-300">firestore.rules</span>) mengizinkan baca-tulis saat fase pengembangan:
                          <pre className="bg-[#11191f] p-2 mt-1.5 rounded text-amber-500 border border-slate-800 font-mono text-[10px]">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId} {
      allow read, write: if true; // Ganti jika sudah masuk tahap production
    }
  }
}`}
                          </pre>
                        </li>
                      </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-[#0a0f13] p-4 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
                        <span className="bg-emerald-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                        Menyiapkan Webhook Penerimaan Pesan Masuk (Optional/Production)
                      </h4>
                      <p className="text-slate-400">Supaya pesan WhatsApp baru dari luar bisa masuk otomatis ke inbox mobile app, Anda perlu webhook publik (menggunakan Node.js, Express, atau cloud function):</p>
                      <ol className="list-decimal pl-5 space-y-1.5 mt-2">
                        <li>Webhook menerima request verifikasi HTTP GET dari Meta (hub.challenge, hub.verify_token).</li>
                        <li>Webhook menerima isi SMS kiriman user lewat metode HTTP POST pada payload: <span className="font-mono text-emerald-300">entry[0].changes[0].value.messages[0]</span></li>
                        <li>Kode Node webhook Anda setelah mengekstrak pesan harus langsung memformat data & melakukan ADD DOCUMENT ke Firestore:
                          <pre className="bg-[#11191f] p-2 mt-1.5 rounded text-emerald-400 border border-slate-800 font-mono text-[10px]">
{`// Simpan ke Firestore
await db.collection('chats').add({
  phone: senderPhoneNumber, // co: "+6281276543210"
  message: textBody,
  role: "user", // "user" berarti sms masuk dari client
  timestamp: admin.firestore.FieldValue.serverTimestamp()
});`}
                          </pre>
                        </li>
                        <li>Aplikasi Expo Anda di ponsel akan memicu rendering UI secara otomatis detik itu juga tanpa perlu diswap/di-refresh!</li>
                      </ol>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* REALTIME SYSTEM DIAGNOSTIC LOGS */}
          <div className="bg-[#11191f] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#34b7f1]" /> Integrated Diagnostics Console
              </span>
              <button 
                onClick={() => {
                  setLogs([]);
                  addLog("info", "Console cleared.");
                }}
                className="text-[10px] text-slate-500 hover:text-slate-350 flex items-center gap-1 font-bold focus:outline-none"
              >
                <RefreshCw className="w-3 h-3" /> Clear Console
              </button>
            </div>
            
            {/* Logs list container */}
            <div className="bg-[#0a0f13] border border-slate-900 rounded-xl p-3 h-36 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col-reverse text-left">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-8">Console clean. No active calls logged.</div>
              ) : (
                logs.map((log, index) => {
                  const colors = {
                    info: "text-blue-400",
                    success: "text-emerald-400",
                    warn: "text-amber-500",
                    error: "text-rose-500"
                  };
                  return (
                    <div key={index} className="border-b border-slate-900 last:border-b-0 py-1 flex items-start gap-2">
                      <span className="text-slate-600 select-none">[{log.time}]</span>
                      <span className={`font-semibold uppercase select-none ${colors[log.type]}`}>{log.type}</span>
                      <span className="text-slate-300 break-all">{log.msg}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </section>

      </main>

      {/* Aesthetic Footer */}
      <footer className="border-t border-slate-850 bg-[#070b0d] py-6 px-6 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl w-full mx-auto">
        <p>© 2026 WhatsApp Mobile CRM Template. Created with Google AI Studio.</p>
        <div className="flex gap-4">
          <p className="text-slate-400 hover:text-white cursor-pointer" onClick={() => setActiveTab("guide")}>Setup Webhooks</p>
          <span className="text-slate-700">•</span>
          <p className="text-slate-400 hover:text-white cursor-pointer" onClick={() => setActiveTab("config")}>Database Schema</p>
          <span className="text-slate-700">•</span>
          <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1">Meta Documentation <ExternalLink className="w-3 h-3" /></a>
        </div>
      </footer>
    </div>
  );
}
