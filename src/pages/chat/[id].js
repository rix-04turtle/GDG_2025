import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage, fetchDonationById, fetchUserDonations, fetchUserClaimedDonations } from '../../firebase';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, XCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Chat() {
  const router = useRouter();
  const { id: donationId } = router.query;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userChats, setUserChats] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!donationId || !user) {
      return;
    }

    const fetchUserChats = async () => {
      try {
        const [created, claimed] = await Promise.all([
          fetchUserDonations(user.uid),
          fetchUserClaimedDonations(user.uid)
        ]);
        
        // Only include donations that are claimed (either by current user or someone else)
        const claimedDonations = created.filter(d => d.claimedBy);
        const claimedByOthers = claimed.filter(c => !created.some(cr => cr.id === c.id));
        
        // Combine all claimed donations for chat list
        const allChats = [...claimedDonations, ...claimedByOthers];
        setUserChats(allChats);
      } catch (err) {
        console.error("Failed to fetch user chats", err);
      }
    };

    const checkPermissionsAndFetchMessages = async () => {
      setLoading(true);
      setError('');

      try {
        const donationData = await fetchDonationById(donationId);
        if (!donationData) {
          throw new Error('Donation not found');
        }

        // Check if the user is authorized to view this chat
        const isCreator = donationData.createdBy === user.uid;
        const isClaimed = donationData.claimedBy === user.uid;
        if (!isCreator && !isClaimed) {
          throw new Error('You do not have permission to access this chat');
        }

        const unsubscribe = getMessages(donationId, setMessages);
        return () => unsubscribe();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserChats();
    checkPermissionsAndFetchMessages();
  }, [donationId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const message = {
      text: newMessage,
      senderId: user.uid,
      senderEmail: user.email,
      senderName: user.displayName || user.email,
      senderPhoto: user.photoURL || null,
    };

    try {
      await sendMessage(donationId, message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getSenderDisplay = (message) => {
    if (message.senderId === user?.uid) {
      return {
        name: user.displayName || user.email || 'You',
        photo: user.photoURL,
        isCurrentUser: true
      };
    }
    return {
      name: message.senderName || message.senderEmail || 'Unknown User',
      photo: message.senderPhoto,
      isCurrentUser: false
    };
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="flex flex-col h-screen bg-slate-50 pt-24">
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-slate-600 font-semibold">Loading chat...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="flex flex-col h-screen bg-slate-50 pt-24">
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-semibold text-lg">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="flex h-screen pt-24">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-1/4 bg-white/80 backdrop-blur-md border-r border-slate-200 shadow-lg"
        >
          <div className="p-6">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Your Chats</h2>
            <div className="space-y-3">
              {userChats.map(chat => (
                <Link key={chat.id} href={`/chat/${chat.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl transition-all cursor-pointer ${
                      chat.id === donationId 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={chat.imageUrl || 'https://via.placeholder.com/40x40?text=No+Image'} 
                        alt={chat.title} 
                        className="h-10 w-10 rounded-lg object-cover shadow-sm" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${
                          chat.id === donationId ? 'text-white' : 'text-slate-800'
                        }`}>
                          {chat.title}
                        </p>
                        <p className={`text-sm truncate ${
                          chat.id === donationId ? 'text-white/80' : 'text-slate-500'
                        }`}>
                          {chat.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-slate-50">
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="rounded-xl px-4 py-2 font-semibold shadow-md hover:bg-primary hover:text-white transition-all"
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-extrabold text-slate-800">Chat Room</h1>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
                className="space-y-6"
              >
                {messages.map((msg) => {
                  const sender = getSenderDisplay(msg);
                  return (
                    <motion.div
                      key={msg.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                      }}
                      className={`flex ${sender.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-md lg:max-w-lg ${sender.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          {sender.photo ? (
                            <img 
                              src={sender.photo} 
                              alt={sender.name} 
                              className="h-10 w-10 rounded-full object-cover shadow-md" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex flex-col ${sender.isCurrentUser ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-md ${
                            sender.isCurrentUser 
                              ? 'bg-primary text-white' 
                              : 'bg-white text-slate-800 border border-slate-200'
                          }`}>
                            <p className="text-sm font-semibold mb-1">{sender.name}</p>
                            <p className="text-base">{msg.text}</p>
                          </div>
                          <p className={`text-xs mt-1 ${
                            sender.isCurrentUser ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {msg.timestamp?.toDate().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </motion.div>
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 shadow-lg">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="text-lg py-4 px-4 rounded-xl shadow-md border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="px-8 py-4 bg-primary hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                  Send
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
