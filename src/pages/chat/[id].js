import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage, fetchDonationById, fetchUserDonations, fetchUserClaimedDonations } from '../../firebase';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Button } from '@/components/ui/button';

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
        const allChats = [...created, ...claimed.filter(c => !created.some(cr => cr.id === c.id))];
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
    };

    try {
      await sendMessage(donationId, message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="flex flex-col h-screen bg-gray-50 pt-16">
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">Loading chat...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="flex flex-col h-screen bg-gray-50 pt-16">
          <div className="flex-grow flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
          <h2 className="text-lg font-semibold mb-4">Your Chats</h2>
          <ul>
            {userChats.map(chat => (
              <li key={chat.id} className={`mb-2 ${chat.id === donationId ? 'font-bold' : ''}`}>
                <Link href={`/chat/${chat.id}`} className="block p-2 rounded hover:bg-gray-200 transition">
                  {chat.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-50">
          <div className="flex-grow overflow-auto p-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center mb-4">
                <Button onClick={() => router.back()} className="mr-4">Back</Button>
                <h1 className="text-2xl font-bold text-center flex-grow">Chat Room</h1>
              </div>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.senderId === user?.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      <p className="text-sm font-semibold">{msg.senderEmail}</p>
                      <p>{msg.text}</p>
                      <p className="text-xs text-right mt-1 opacity-75">
                        {msg.timestamp?.toDate().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-t">
            <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring"
              />
              <Button type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
                Send
              </Button>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
