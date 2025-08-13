import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Alert,
  RefreshControl,
  Modal,
  Dimensions,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/utils/supabase';
import { Thread, User } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TopicsScreen() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
    loadThreads();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadThreads = async () => {
    try {
      setLoading(true);
      const [{ data: mutes }, { data: blockedBy }] = await Promise.all([
        supabase.from('mutes').select('muted_id').eq('muter_id', currentUser?.id || ''),
        supabase.from('blocks').select('blocker_id').eq('blocked_id', currentUser?.id || ''),
      ]);
      const mutedIds = new Set((mutes || []).map(m => m.muted_id));
      const blockedByIds = new Set((blockedBy || []).map(b => b.blocker_id));

      let { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          user:users(id, username, name, image)
        `)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const visibleThreads = (data || []).filter(
        t => !mutedIds.has(t.user_id) && !blockedByIds.has(t.user_id)
      );

      // Get likes count and user's like status separately for each thread
      const threadsWithLikes = await Promise.all(
        visibleThreads.map(async (thread) => {
          // Get likes count
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);

          // Check if current user liked this thread
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('thread_id', thread.id)
            .eq('user_id', currentUser?.id || '')
            .single();

          return {
            ...thread,
            likes_count: count || 0,
            is_liked: !!userLike
          };
        })
      );

      setThreads(threadsWithLikes);
    } catch (error) {
      console.error('Error loading threads:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadThreads();
    setRefreshing(false);
  };

  const createThread = async () => {
    if (!newThreadContent.trim() || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('threads')
        .insert([
          {
            content: newThreadContent.trim(),
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
          }
        ])
        .select(`
          *,
          user:users(id, username, name, image)
        `)
        .single();

      if (error) throw error;

      setThreads([data, ...threads]);
      setNewThreadContent('');
      setShowCompose(false);
      Alert.alert('Success', 'Post created!');
    } catch (error) {
      console.error('Error creating thread:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const toggleLike = async (threadId: string) => {
    if (!currentUser) return;

    try {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      if (thread.is_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', currentUser.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert([{ thread_id: threadId, user_id: currentUser.id }]);
      }

      // Update local state
      setThreads(threads.map(t => 
        t.id === threadId 
          ? { 
              ...t, 
              is_liked: !t.is_liked,
              likes_count: t.is_liked ? (t.likes_count || 1) - 1 : (t.likes_count || 0) + 1
            }
          : t
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const openActionSheet = (thread: Thread) => {
    setSelectedThread(thread);
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    setShowActionSheet(false);
    setSelectedThread(null);
  };

  const handleMuteAccount = async () => {
    if (!currentUser || !selectedThread || selectedThread.user_id === currentUser.id) {
      closeActionSheet(); return;
    }
    try {
      // toggle mute
      const { data: existing } = await supabase
        .from('mutes')
        .select('muted_id')
        .eq('muter_id', currentUser.id)
        .eq('muted_id', selectedThread.user_id)
        .maybeSingle();

      if (existing) {
        await supabase.from('mutes')
          .delete()
          .eq('muter_id', currentUser.id)
          .eq('muted_id', selectedThread.user_id);
      } else {
        await supabase.from('mutes').insert({
          muter_id: currentUser.id,
          muted_id: selectedThread.user_id,
        });
      }

      // Optimistically remove posts by that user from the feed
      setThreads(prev => prev.filter(t => t.user_id !== selectedThread.user_id));
    } catch (e:any) {
      Alert.alert('Mute failed', e.message || 'Unknown error');
    } finally {
      closeActionSheet();
    }
  };

  const handleBlockAccount = async () => {
    if (!currentUser || !selectedThread || selectedThread.user_id === currentUser.id) {
      closeActionSheet(); return;
    }
    try {
      // toggle block
      const { data: existing } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', currentUser.id)
        .eq('blocked_id', selectedThread.user_id)
        .maybeSingle();

      if (existing) {
        await supabase.from('blocks')
          .delete()
          .eq('blocker_id', currentUser.id)
          .eq('blocked_id', selectedThread.user_id);
      } else {
        await supabase.from('blocks').insert({
          blocker_id: currentUser.id,
          blocked_id: selectedThread.user_id,
        });
      }

      // Remove their posts
      setThreads(prev => prev.filter(t => t.user_id !== selectedThread.user_id));
    } catch (e:any) {
      Alert.alert('Block failed', e.message || 'Unknown error');
    } finally {
      closeActionSheet();
    }
  };

  const handleReportPost = () => {
    Alert.alert('Report Post', 'This feature is coming soon!');
    closeActionSheet();
  };

  const handleEditPost = () => {
    if (selectedThread) {
      setNewThreadContent(selectedThread.content);
      setShowCompose(true);
      closeActionSheet();
    }
  };

  const handleDeletePost = async () => {
    if (!selectedThread || !currentUser) return;

    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { data, error } = await supabase
            .from('threads')
            .delete()
            .eq('id', selectedThread.id)
            .eq('user_id', currentUser.id)   // reinforces policy match
            .select('id');                   // returns deleted rows

          if (error) {
            Alert.alert('Error', error.message);
            return;
          }
          if (!data?.length) {
            Alert.alert('Not deleted', 'RLS likely blocked this delete.');
            return;
          }

          setThreads(prev => prev.filter(t => t.id !== selectedThread.id));
          closeActionSheet();
        }
      }
    ]);
  };

  const renderThread = ({ item }: { item: Thread }) => (
    <View style={styles.threadContainer}>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Image 
          source={{ 
            uri: item.user?.image || 'sad-face.png'
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
            <Text style={styles.displayName}>{item.user?.name || 'Unknown'}</Text>
            <Text style={styles.username}>@{item.user?.username || 'unknown'}</Text>
            <Text style={styles.timestamp}>· {formatTimeAgo(item.created_at)}</Text>
          </View>
        </View>
      </View>

      {/* Thread content */}
      <Text style={styles.threadContent}>{item.content}</Text>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleLike(item.id)}
        >
          <Ionicons 
            name={item.is_liked ? "heart" : "heart-outline"} 
            size={18} 
            color={item.is_liked ? "#e91e63" : "#666"} 
          />
          <Text style={[
            styles.actionText,
            item.is_liked && { color: '#e91e63' }
          ]}>
            {typeof item.likes_count === 'number'
              ? item.likes_count
              : (item.likes_count && typeof item.likes_count === 'object' && 'count' in item.likes_count)
                ? (item.likes_count as any).count
                : 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openActionSheet(item)}
        >
          <Ionicons name="ellipsis-vertical-outline" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What's on your mind?</Text>
        <TouchableOpacity 
          style={styles.composeButton}
          onPress={() => setShowCompose(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Compose Modal */}
      <Modal
        visible={showCompose}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.composeModal}>
          <View style={styles.composeHeader}>
            <TouchableOpacity onPress={() => setShowCompose(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.postButton}
              onPress={createThread}
              disabled={!newThreadContent.trim()}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.composeContent}>
            <Image 
              source={{ 
                uri: currentUser?.image
              }}
              style={styles.avatar}
            />
            <TextInput
              style={styles.composeInput}
              placeholder="Share your thoughts"
              value={newThreadContent}
              onChangeText={setNewThreadContent}
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </View>
        </View>
      </Modal>

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent
        onRequestClose={closeActionSheet}
      >
        <View style={styles.actionSheetOverlay}>
          <View style={styles.actionSheetContainer}>
            <View style={styles.actionSheetHandle} />
            
            {selectedThread && (
              <>
                {/* For other users' posts */}
                {selectedThread.user_id !== currentUser?.id && (
                  <>
                    <TouchableOpacity 
                      style={styles.actionSheetButton}
                      onPress={handleMuteAccount}
                    >
                      <Ionicons name="volume-mute-outline" size={20} color="#666" />
                      <Text style={styles.actionSheetButtonText}>Mute @{selectedThread.user?.username}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionSheetButton}
                      onPress={handleBlockAccount}
                    >
                      <Ionicons name="ban-outline" size={20} color="#666" />
                      <Text style={styles.actionSheetButtonText}>Block @{selectedThread.user?.username}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionSheetButton}
                      onPress={handleReportPost}
                    >
                      <Ionicons name="flag-outline" size={20} color="#e74c3c" />
                      <Text style={[styles.actionSheetButtonText, { color: '#e74c3c' }]}>Report post</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* For user's own posts */}
                {selectedThread.user_id === currentUser?.id && (
                  <>
                    <TouchableOpacity 
                      style={styles.actionSheetButton}
                      onPress={handleEditPost}
                    >
                      <Ionicons name="create-outline" size={20} color="#666" />
                      <Text style={styles.actionSheetButtonText}>Edit post</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionSheetButton}
                      onPress={handleDeletePost}
                    >
                      <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                      <Text style={[styles.actionSheetButtonText, { color: '#e74c3c' }]}>Delete post</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            <TouchableOpacity 
              style={styles.actionSheetCancelButton}
              onPress={closeActionSheet}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  composeButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  threadHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 4,
  },
  username: {
    color: '#666',
    fontSize: 15,
    marginRight: 4,
  },
  timestamp: {
    color: '#666',
    fontSize: 15,
  },
  threadContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  composeModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  composeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    fontSize: 16,
    color: '#1DA1F2',
  },
  postButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  composeContent: {
    flexDirection: 'row',
    padding: 16,
  },
  composeInput: {
    flex: 1,
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for iPhone
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  actionSheetButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  actionSheetCancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 8,
    borderTopColor: '#f0f0f0',
  },
  actionSheetCancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
