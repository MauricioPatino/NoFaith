import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/utils/supabase';
import { Thread, User } from '@/src/types';

export default function ProfileTab() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      await loadCurrentUser();
    };
    load();
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserPosts(currentUser.id);
    }
  }, [currentUser?.id]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profile) setCurrentUser(profile as User);
    } catch (e) {
      console.error('Error loading current user:', e);
    } finally {
      // don't turn off loading here; wait for posts
    }
  };

  const loadUserPosts = async (userId: string) => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          user:users(id, username, name, image)
        `)
        .eq('user_id', userId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithLikes = await Promise.all(
        (data || []).map(async (thread) => {
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);

          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('thread_id', thread.id)
            .eq('user_id', userId)
            .single();

          return {
            ...thread,
            likes_count: count || 0,
            is_liked: !!userLike,
          } as Thread;
        })
      );

      setPosts(postsWithLikes);
    } catch (e) {
      console.error('Error loading user posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!currentUser?.id) return;
    setRefreshing(true);
    await loadUserPosts(currentUser.id);
    setRefreshing(false);
  };

  const toggleLike = async (threadId: string) => {
    if (!currentUser) return;

    try {
      const thread = posts.find(t => t.id === threadId);
      if (!thread) return;

      if (thread.is_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('likes')
          .insert([{ thread_id: threadId, user_id: currentUser.id }]);
      }

      setPosts(posts.map(t =>
        t.id === threadId
          ? {
              ...t,
              is_liked: !t.is_liked,
              likes_count: t.is_liked ? (t.likes_count || 1) - 1 : (t.likes_count || 0) + 1,
            }
          : t
      ));
    } catch (e) {
      console.error('Error toggling like:', e);
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

  const ListHeader = useMemo(() => {
    if (!currentUser) return null;
    return (
      <View style={styles.header}>
        {currentUser.image ? (
          <Image source={{ uri: currentUser.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person-outline" size={36} color="#777" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.displayName}>{currentUser.name || 'Unnamed'}</Text>
          <Text style={styles.handle}>@{currentUser.username || 'user'}</Text>
        </View>
      </View>
    );
  }, [currentUser]);

  const renderPost = ({ item }: { item: Thread }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        {item.user?.image ? (
          <Image source={{ uri: item.user.image }} style={styles.postAvatar} />
        ) : (
          <View style={[styles.postAvatar, styles.avatarPlaceholder]}>
            <Ionicons name="person-outline" size={18} color="#777" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.postName}>{item.user?.name || currentUser?.name || 'You'}</Text>
            <Text style={styles.postMeta}> · {formatTimeAgo(item.created_at)}</Text>
          </View>
          <Text style={styles.postHandle}>@{item.user?.username || currentUser?.username}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleLike(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={styles.likeRow}>
            <Ionicons
              name={item.is_liked ? 'heart' : 'heart-outline'}
              size={18}
              color={item.is_liked ? '#e0245e' : '#555'}
            />
            <Text style={styles.likeCount}>{item.likes_count || 0}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={{ padding: 24 }}>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            No posts yet.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: { fontSize: 20, fontWeight: '700' },
  handle: { color: '#666', marginTop: 2 },
  post: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  postName: { fontWeight: '700' },
  postHandle: { color: '#666', fontSize: 12 },
  postMeta: { color: '#666', fontSize: 12 },
  postContent: { fontSize: 16, lineHeight: 22, color: '#111' },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeCount: { marginLeft: 6, color: '#555', fontSize: 12 },
});