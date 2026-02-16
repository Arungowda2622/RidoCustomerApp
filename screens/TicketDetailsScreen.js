import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import { API_URL } from '../utils/api';

const TicketDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef();
  
  const ticketId = route.params?.ticketId;
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/tickets/${ticketId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setTicket(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch ticket');
      }

    } catch (error) {
      console.error('Error fetching ticket details:', error);
      Alert.alert('Error', 'Failed to load ticket details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Required', 'Please enter your message');
      return;
    }

    try {
      setSendingComment(true);

      // Get username from userData first, then fallback
      let userName = 'Customer';
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userName = userData.name || userData.userName || 'Customer';
        }
      } catch (e) {
        console.warn('Failed to get userName from userData:', e);
      }

      const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentBy: 'user',
          commentByName: userName,
          message: newComment
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTicket(result.data);
        setNewComment('');
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error(result.message || 'Failed to send comment');
      }

    } catch (error) {
      console.error('Error sending comment:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleCloseTicket = async () => {
    if (ticket.status === 'Closed') return;

    Alert.alert(
      'Close Ticket',
      'Are you sure you want to close this ticket? You can rate your experience.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close & Rate',
          onPress: () => setShowRatingModal(true)
        }
      ]
    );
  };

  const submitRatingAndClose = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating || undefined,
          feedback: feedback || undefined
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTicket(result.data);
        setShowRatingModal(false);
        // Ticket closed - visual feedback from modal closing and updated status
      } else {
        throw new Error(result.message || 'Failed to close ticket');
      }

    } catch (error) {
      console.error('Error closing ticket:', error);
      Alert.alert('Error', 'Failed to close ticket. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#DC2626';
      case 'In Progress': return '#F59E0B';
      case 'Resolved': return '#10B981';
      case 'Closed': return '#6B7280';
      default: return '#999';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return '#DC2626';
      case 'High': return '#F59E0B';
      case 'Medium': return '#3B82F6';
      case 'Low': return '#10B981';
      default: return '#999';
    }
  };

  const formatTimestamp = (date) => {
    const d = new Date(date);
    const today = new Date();
    
    const isToday = d.toDateString() === today.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const renderComment = (comment, index) => {
    const isUser = comment.commentBy === 'user';
    const isSystem = comment.commentBy === 'system';

    if (isSystem) {
      return (
        <View key={index} style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{comment.message}</Text>
        </View>
      );
    }

    return (
      <View key={index} style={[styles.commentBubble, isUser ? styles.userComment : styles.adminComment]}>
        <Text style={styles.commentAuthor}>{comment.commentByName || comment.commentBy}</Text>
        <Text style={[styles.commentMessage, isUser && styles.userCommentMessage]}>
          {comment.message}
        </Text>
        <Text style={[styles.commentTime, isUser && styles.userCommentTime]}>
          {formatTimestamp(comment.timestamp)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Ticket Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4D4A" />
          <Text style={styles.loadingText}>Loading ticket...</Text>
        </View>
      </View>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <HeaderWithBackButton title="Ticket Details" />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Ticket Header */}
        <View style={styles.headerCard}>
          <View style={styles.ticketIdRow}>
            <View style={styles.ticketIdContainer}>
              <Ionicons name="ticket" size={20} color="#EC4D4A" />
              <Text style={styles.ticketId}>{ticket.ticketId}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                {ticket.status}
              </Text>
            </View>
          </View>

          <Text style={styles.subject}>{ticket.subject}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag" size={14} color="#666" />
              <Text style={styles.metaText}>{ticket.issueType}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                {ticket.priority} Priority
              </Text>
            </View>
          </View>

          {ticket.bookingDetails && (
            <View style={styles.bookingInfo}>
              <Ionicons name="document-text" size={16} color="#EC4D4A" />
              <Text style={styles.bookingText}>
                Order #{ticket.bookingDetails.bookingId?.slice(-6)}
              </Text>
            </View>
          )}

          <Text style={styles.description}>{ticket.description}</Text>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsLabel}>Attachments:</Text>
              <View style={styles.attachmentsList}>
                {ticket.attachments.map((attachment, index) => (
                  <Image
                    key={index}
                    source={{ uri: attachment.url }}
                    style={styles.attachmentImage}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Conversation</Text>
          
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment, index) => renderComment(comment, index))
          ) : (
            <View style={styles.noComments}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.noCommentsText}>No messages yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Box (only if not closed) */}
      {ticket.status !== 'Closed' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newComment.trim() || sendingComment) && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!newComment.trim() || sendingComment}
          >
            {sendingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Close Ticket Button */}
      {ticket.status !== 'Closed' && ticket.status === 'Resolved' && (
        <TouchableOpacity style={styles.closeTicketButton} onPress={handleCloseTicket}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.closeTicketButtonText}>Close Ticket</Text>
        </TouchableOpacity>
      )}

      {/* Ticket Closed Message */}
      {ticket.status === 'Closed' && (
        <View style={styles.closedBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.closedText}>This ticket has been closed</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4D4A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookingText: {
    fontSize: 13,
    color: '#EC4D4A',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  attachmentsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  attachmentsList: {
    flexDirection: 'row',
    gap: 8,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commentBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userComment: {
    alignSelf: 'flex-end',
    backgroundColor: '#EC4D4A',
  },
  adminComment: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  commentMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  userCommentMessage: {
    color: '#fff',
  },
  commentTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  userCommentTime: {
    color: '#fff9',
  },
  systemMessage: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  systemMessageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EC4D4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  closeTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 14,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  closeTicketButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    gap: 8,
  },
  closedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default TicketDetailsScreen;
