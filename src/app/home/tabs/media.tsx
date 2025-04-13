// app/atheist-discussion/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

type DebateTopic = {
  id: string;
  title: string;
  snippet: string;
  date: string;
};

export default function AtheistDiscussionScreen() {
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate an API call to fetch debate topics
    const fetchTopics = async () => {
      setTimeout(() => {
        const data: DebateTopic[] = [
          {
            id: '1',
            title: 'Atheism and Morality: Is There a Moral Foundation Without God?',
            snippet:
              'Explore the arguments on whether morality can exist without divine command and how secular ethics compare with religious ethics...',
            date: '2023-01-15',
          },
          {
            id: '2',
            title: 'Science vs. Faith: The Role of Evidence in Belief Systems',
            snippet:
              'A detailed discussion on the balance between scientific reasoning and faith-based belief systems. What weight should evidence hold?',
            date: '2023-02-05',
          },
          {
            id: '3',
            title: 'Atheism in the Public Sphere: The Impact of Secularism on Society',
            snippet:
              'An exploration of how secular principles influence public policy and societal norms in modern democracies and the debates that arise from them...',
            date: '2023-03-22',
          },
        ];
        setTopics(data);
        setLoading(false);
      }, 1000);
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderTopic = ({ item }: { item: DebateTopic }) => (
    <TouchableOpacity
      onPress={() => router.push(`/home/tabs/media`)}
      style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ marginVertical: 5 }}>{item.snippet}</Text>
      <Text style={{ fontSize: 12, color: 'gray' }}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Atheist Debate Topics
      </Text>
      <FlatList data={topics} keyExtractor={(item) => item.id} renderItem={renderTopic} />
    </View>
  );
}
